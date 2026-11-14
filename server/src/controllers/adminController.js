import User, { ROLES } from '../models/User.js';
import { COMMITTEE_BY_ID } from '../data/committees.js';

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const ADMIN_PASSWORD_MINIMUM = 12;

function safeUser(user) {
  const result = user.toJSON();
  result.isActive = result.isActive !== false;
  return result;
}

function validAccountRole(role) {
  return ['head_hr', 'leaderboard_viewer', 'supervisor'].includes(role);
}

function validateRoleCommittee(role, committee) {
  if (!validAccountRole(role)) return 'Role must be head_hr, leaderboard_viewer, or supervisor';
  if (role === 'supervisor' && !COMMITTEE_BY_ID.has(committee)) {
    return 'A supervisor must be assigned exactly one valid committee';
  }
  return null;
}

export async function listUsers(req, res, next) {
  try {
    const filter = {};
    if (ROLES.includes(req.query.role)) filter.role = req.query.role;
    if (req.query.committee && COMMITTEE_BY_ID.has(String(req.query.committee))) {
      filter.committee = String(req.query.committee);
    }
    if (req.query.status === 'active') filter.isActive = { $ne: false };
    if (req.query.status === 'inactive') filter.isActive = false;

    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ name: new RegExp(escaped, 'i') }, { email: new RegExp(escaped, 'i') }];
    }
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isInteger(requestedLimit) ? Math.min(100, Math.max(1, requestedLimit)) : 50;

    const [total, filteredUsers, totals, assignedCommitteeIds] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter).sort({ createdAt: -1, _id: 1 }).skip((page - 1) * limit).limit(limit),
      User.aggregate([{
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeAccounts: { $sum: { $cond: [{ $ne: [{ $ifNull: ['$isActive', true] }, false] }, 1, 0] } },
          inactiveAccounts: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
          admins: { $sum: { $cond: [{ $eq: ['$role', 'head_hr'] }, 1, 0] } },
          leaderboardViewers: { $sum: { $cond: [{ $eq: ['$role', 'leaderboard_viewer'] }, 1, 0] } },
          supervisors: { $sum: { $cond: [{ $eq: ['$role', 'supervisor'] }, 1, 0] } },
        },
      }]),
      User.distinct('committee', { role: 'supervisor', isActive: { $ne: false } }),
    ]);
    const counts = totals[0] || { totalUsers: 0, activeAccounts: 0, inactiveAccounts: 0, admins: 0, leaderboardViewers: 0, supervisors: 0 };
    const committeesWithSupervisors = new Set(assignedCommitteeIds.filter((id) => COMMITTEE_BY_ID.has(id)));

    res.json({
      users: filteredUsers.map(safeUser),
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      stats: {
        ...counts,
        committeesWithSupervisors: committeesWithSupervisors.size,
        committeesWithoutSupervisors: [...COMMITTEE_BY_ID.keys()].filter((id) => !committeesWithSupervisors.has(id)),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: safeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, role, committee } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
    }
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!EMAIL_RE.test(normalizedEmail) || normalizedEmail.length > 150) {
      return res.status(400).json({ message: 'A valid email is required' });
    }
    if (typeof password !== 'string' || password.length < ADMIN_PASSWORD_MINIMUM) {
      return res.status(400).json({ message: `Password must be at least ${ADMIN_PASSWORD_MINIMUM} characters` });
    }
    const roleError = validateRoleCommittee(role, committee);
    if (roleError) return res.status(400).json({ message: roleError });
    if (req.body.isActive !== undefined && typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }
    if (role !== 'supervisor' && committee) {
      return res.status(400).json({ message: 'Only supervisors may be assigned a committee' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      committee: role === 'supervisor' ? committee : null,
      isActive: req.body.isActive !== false,
      mustChangePassword: true,
    });
    res.status(201).json({ user: safeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select('+tokenVersion');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const body = req.body || {};

    if (String(user._id) === String(req.user._id) && (body.role !== undefined || body.isActive !== undefined)) {
      return res.status(400).json({ message: 'You cannot change your own role or account status' });
    }

    const name = body.name === undefined ? user.name : body.name;
    const email = body.email === undefined ? user.email : String(body.email).trim().toLowerCase();
    const role = body.role === undefined ? user.role : body.role;
    const committee = body.committee === undefined ? user.committee : body.committee;
    const isActive = body.isActive === undefined ? user.isActive !== false : body.isActive;

    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
    }
    if (!EMAIL_RE.test(email) || email.length > 150) return res.status(400).json({ message: 'A valid email is required' });
    if (typeof isActive !== 'boolean') return res.status(400).json({ message: 'isActive must be a boolean' });
    const keepLegacyMemberRole = user.role === 'member' && (body.role === undefined || body.role === 'member');
    const roleError = keepLegacyMemberRole ? null : validateRoleCommittee(role, committee);
    if (roleError) return res.status(400).json({ message: roleError });
    if (body.role === 'supervisor' && body.committee === undefined) {
      return res.status(400).json({ message: 'Select exactly one committee when assigning the supervisor role' });
    }
    if (role !== 'supervisor' && body.committee) {
      return res.status(400).json({ message: 'Only supervisors may be assigned a committee' });
    }

    if (user.role === 'head_hr' && user.isActive !== false && (role !== 'head_hr' || !isActive)) {
      const activeAdminCount = await User.countDocuments({ role: 'head_hr', isActive: { $ne: false } });
      if (activeAdminCount <= 1) return res.status(409).json({ message: 'The last active administrator cannot be removed or deactivated' });
    }

    const securityChanged = user.role !== role || user.committee !== (role === 'supervisor' ? committee : null) || (user.isActive !== false) !== isActive;
    user.name = name.trim();
    user.email = email;
    user.role = role;
    user.committee = role === 'supervisor' ? committee : null;
    user.isActive = isActive;
    if (securityChanged) user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    await user.save();
    res.json({ user: safeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function resetUserPassword(req, res, next) {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: 'Use the account recovery process to change your own password' });
    }
    const { password } = req.body || {};
    if (typeof password !== 'string' || password.length < ADMIN_PASSWORD_MINIMUM) {
      return res.status(400).json({ message: `Password must be at least ${ADMIN_PASSWORD_MINIMUM} characters` });
    }
    const user = await User.findById(req.params.id).select('+tokenVersion');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = password;
    user.mustChangePassword = true;
    user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    await user.save();
    res.json({ message: 'Password reset; the user must sign in again' });
  } catch (error) {
    next(error);
  }
}
