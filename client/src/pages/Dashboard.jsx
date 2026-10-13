import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { committeesData, MONTHS, defaultFormValues, getDefaultEvaluation, TECH_COMMITTEE_IDS } from '../data/committees';
import { api } from '../utils/api';
import { computeAttendanceRate, computeScore, getScoreBadge } from '../utils/calculations';
import { buildMarkdownReport } from '../utils/markdown';
import Header from '../components/Header';
import PrintHeader from '../components/PrintHeader';
import MetaCard from '../components/MetaCard';
import KpiCards from '../components/KpiCards';
import MeetingsSection from '../components/evaluation/MeetingsSection';
import TasksSection from '../components/evaluation/TasksSection';
import MetricsSection from '../components/evaluation/MetricsSection';
import ChallengesSection from '../components/evaluation/ChallengesSection';
import DeliverablesSection from '../components/evaluation/DeliverablesSection';
import RecommendationsSection from '../components/evaluation/RecommendationsSection';
import ProfileModal from '../components/ProfileModal';

const NUMBER_WORDS = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن'];

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isEditMode, setIsEditMode] = useState(false);
  const [committeeType, setCommitteeType] = useState('non_tech');
  const [committeeId, setCommitteeId] = useState('OC');
  const [month, setMonth] = useState(MONTHS[0]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalId, setEvalId] = useState(null);

  const [initialData] = useState(() => getDefaultEvaluation('OC', 'non_tech', user?.name));
  const [form, setForm] = useState(initialData.form);
  const [meetings, setMeetings] = useState(initialData.meetings);
  const [tasks, setTasks] = useState(initialData.tasks);

  // Latest-user ref so the load effect reads the user without depending on it
  // (mirrors the original imperative getCurrentUser() behavior).
  const userRef = useRef(user);
  userRef.current = user;
  const loadSeq = useRef(0);

  const committeeName =
    committeesData[committeeType].find((c) => c.id === committeeId)?.name || '';

  // Mirrors the original loadEvaluation(): fetch the saved evaluation from the
  // API or reset to the base template. Never auto-creates a document.
  useEffect(() => {
    const seq = ++loadSeq.current;
    const name = committeesData[committeeType].find((c) => c.id === committeeId)?.name || '';
    const defaults = getDefaultEvaluation(committeeId, committeeType, userRef.current?.name);

    setEvalLoading(true);
    api
      .get(`/evaluations?committeeId=${encodeURIComponent(committeeId)}&month=${encodeURIComponent(month)}`)
      .then(({ evaluations }) => {
        if (seq !== loadSeq.current) return;
        const saved = evaluations[0];

        if (saved) {
          setEvalId(saved._id);
          setForm((prev) => ({
            ...prev,
            supervisor: saved.supervisor ? saved.supervisor : prev.supervisor,
            target: saved.target ? saved.target : prev.target,
            commScore: saved.commScore ?? 90,
            deadlineScore: saved.deadlineScore ?? 85,
            attendanceNotes: saved.attendanceNotes || '',
            challenges: saved.challenges || '',
            solutions: saved.solutions || '',
            deliverables: saved.deliverables || '',
            warnings: saved.warnings || '',
            filteration: saved.filteration || '',
            bestMember: saved.bestMember || '',
            generalRecs: saved.generalRecs || '',
          }));
          setMeetings(saved.meetings || []);
          // Server contract uses `assignee`; the UI keeps using `assigned`.
          setTasks((saved.tasks || []).map((t) => ({ ...t, assigned: t.assignee ?? t.assigned ?? '' })));
          showToast(`تم استرجاع تقييم ${name} المحفوظ لشهر ${month} 📂`, 'info');
        } else {
          setEvalId(null);
          const currentUser = userRef.current;
          setForm((prev) => ({
            ...defaultFormValues,
            supervisor: currentUser ? currentUser.name : prev.supervisor,
            target: prev.target,
          }));
          setMeetings(defaults.meetings);
          setTasks(defaults.tasks);
          showToast(`تم فتح النموذج الأساسي لـ ${name} (${month})`, 'info');
        }
      })
      .catch(() => {
        if (seq !== loadSeq.current) return;
        setEvalId(null);
        showToast('فشل تحميل التقييم من الخادم، حاول تحديث الصفحة!', 'error');
      })
      .finally(() => {
        if (seq === loadSeq.current) setEvalLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, committeeId, committeeType]);

  // Mirrors the original checkAuthOnLoad() -> applyAuthenticatedUser():
  // set supervisor to the logged-in user and switch to their committee.
  // The committee switch is batched atomically; unknown committees (e.g. 'عام')
  // are skipped instead of crashing like the original did.
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({ ...prev, supervisor: user.name }));

    if (user.committee && user.committee !== 'HR') {
      if (TECH_COMMITTEE_IDS.includes(user.committee)) {
        setCommitteeType('tech');
        setCommitteeId(user.committee);
      } else if (committeesData.non_tech.some((c) => c.id === user.committee)) {
        setCommitteeId(user.committee);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Returns true when the save reached MongoDB; false means the current state
  // is kept intact so nothing is silently lost.
  const saveCurrentEvaluation = async (silent = false) => {
    const payload = {
      month,
      committeeId,
      committeeType,
      supervisor: form.supervisor,
      target: form.target,
      commScore: form.commScore,
      deadlineScore: form.deadlineScore,
      attendanceNotes: form.attendanceNotes,
      challenges: form.challenges,
      solutions: form.solutions,
      deliverables: form.deliverables,
      warnings: form.warnings,
      filteration: form.filteration,
      bestMember: form.bestMember,
      generalRecs: form.generalRecs,
      meetings: meetings.map(({ id, ...rest }) => rest),
      tasks: tasks.map(({ id, assigned, ...rest }) => ({ ...rest, assignee: assigned })),
      savedAt: new Date().toISOString(),
    };

    try {
      const data = evalId
        ? await api.put(`/evaluations/${evalId}`, payload)
        : await api.post('/evaluations', payload);
      setEvalId(data.evaluation._id);
      if (!silent) {
        showToast(`تم حفظ تقييم ${committeeName} لشهر ${month} بنجاح! 💾`, 'success');
      }
      return true;
    } catch (err) {
      showToast(`فشل حفظ التقييم! ${err.message}`, 'error');
      return false;
    }
  };

  const toggleEditMode = async () => {
    if (isEditMode) {
      const saved = await saveCurrentEvaluation(false);
      if (saved) setIsEditMode(false);
    } else {
      setIsEditMode(true);
      showToast('تم تفعيل وضع التعديل! يمكنك الآن تعديل البيانات وحفظها.', 'info');
    }
  };

  const handleTypeChange = async (newType) => {
    if (isEditMode) {
      const saved = await saveCurrentEvaluation(true);
      if (!saved) return; // keep current state; do not switch
    }
    const firstCommittee = committeesData[newType][0];
    setCommitteeType(newType);
    setCommitteeId(firstCommittee.id);
  };

  const handleCommitteeChange = async (newCommitteeId) => {
    if (isEditMode) {
      const saved = await saveCurrentEvaluation(true);
      if (!saved) return;
    }
    setCommitteeId(newCommitteeId);
  };

  const handleMonthChange = async (newMonth) => {
    if (isEditMode) {
      const saved = await saveCurrentEvaluation(true);
      if (!saved) return;
    }
    setMonth(newMonth);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ---------- Meetings ----------
  const addMeeting = () => {
    const indexStr = NUMBER_WORDS[meetings.length] || meetings.length + 1;
    const newMeeting =
      committeeType === 'tech'
        ? {
            id: Date.now(),
            title: `السيشن ${indexStr}: موضوع جديد`,
            instructor: 'اسم الانستراكتور',
            type: 'أونلاين (Google Meet)',
            duration: '2 ساعة',
            attendance: 20,
            absence: 2,
            notes: 'ملاحظات وتفاعل الأعضاء في السيشن',
          }
        : {
            id: Date.now(),
            title: `الاجتماع ${indexStr}: اجتماع متابعة جديد`,
            duration: '1.5 ساعة',
            attendance: 18,
            absence: 2,
            notes: 'ملاحظات وتوصيات الاجتماع',
          };
    setMeetings((prev) => [...prev, newMeeting]);
    showToast('تم إدراج سيشن / اجتماع جديد بنجاح!', 'info');
  };

  const removeMeeting = (idx) => {
    setMeetings((prev) => prev.filter((_, i) => i !== idx));
    showToast('تم حذف الاجتماع/السيشن', 'info');
  };

  const updateMeeting = (idx, field, value) => {
    setMeetings((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  };

  // ---------- Tasks ----------
  const addTask = (text, assigned) => {
    setTasks((prev) => [...prev, { text, assigned, status: 'completed' }]);
    showToast('تم إدراج المهمة بنجاح!', 'info');
  };

  const removeTask = (idx) => {
    setTasks((prev) => prev.filter((_, i) => i !== idx));
    showToast('تم حذف المهمة', 'info');
  };

  const updateTask = (idx, field, value) => {
    setTasks((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };

  // ---------- Derived KPIs (equivalent of updateCalculations) ----------
  const attendanceRate = computeAttendanceRate(meetings);
  const score = computeScore(attendanceRate, form.commScore, form.deadlineScore);
  const scoreBadge = getScoreBadge(score);

  const handleCopyReport = () => {
    const markdownText = buildMarkdownReport({
      committeeName,
      month,
      supervisor: form.supervisor,
      scoreText: `${score} / 100`,
      meetingsCount: meetings.length,
      attendanceText: `${attendanceRate}%`,
      attendanceNotes: form.attendanceNotes,
      challenges: form.challenges,
      solutions: form.solutions,
      deliverables: form.deliverables,
      warnings: form.warnings,
      filteration: form.filteration,
      bestMember: form.bestMember,
      generalRecs: form.generalRecs,
    });

    const textArea = document.createElement('textarea');
    textArea.value = markdownText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    showToast('تم نسخ نص التقرير الكامل بفرمتة Markdown!', 'info');
  };

  return (
    <div>
      <Header
        isEditMode={isEditMode}
        onToggleEdit={toggleEditMode}
        onCopyReport={handleCopyReport}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <PrintHeader />

        <MetaCard
          committeeType={committeeType}
          committeeId={committeeId}
          month={month}
          supervisor={form.supervisor}
          target={form.target}
          isEditMode={isEditMode}
          onTypeChange={handleTypeChange}
          onCommitteeChange={handleCommitteeChange}
          onMonthChange={handleMonthChange}
          onSupervisorChange={(v) => handleFormChange('supervisor', v)}
          onTargetChange={(v) => handleFormChange('target', v)}
        />

        <KpiCards
          score={score}
          scoreBadge={scoreBadge}
          attendanceRate={attendanceRate}
          meetingsCount={meetings.length}
          deadlineScore={form.deadlineScore}
        />

        <div className="relative">
          {evalLoading && (
            <div className="absolute inset-0 z-20 flex items-start justify-center pt-24 bg-slate-950/40 rounded-xl no-print">
              <div className="text-center">
                <i className="fa-solid fa-circle-notch fa-spin text-2xl text-gdg-blue"></i>
                <p className="text-slate-200 text-xs font-semibold mt-2">جاري تحميل التقييم...</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <MeetingsSection
                committeeType={committeeType}
                meetings={meetings}
                isEditMode={isEditMode}
                attendanceRate={attendanceRate}
                attendanceNotes={form.attendanceNotes}
                onAttendanceNotesChange={(v) => handleFormChange('attendanceNotes', v)}
                onAdd={addMeeting}
                onRemove={removeMeeting}
                onUpdate={updateMeeting}
              />

              <TasksSection
                tasks={tasks}
                isEditMode={isEditMode}
                onAdd={addTask}
                onRemove={removeTask}
                onUpdate={updateTask}
              />

              <MetricsSection
                commScore={form.commScore}
                deadlineScore={form.deadlineScore}
                isEditMode={isEditMode}
                onCommChange={(v) => handleFormChange('commScore', v)}
                onDeadlineChange={(v) => handleFormChange('deadlineScore', v)}
              />
            </div>

            <div className="space-y-6">
              <ChallengesSection
                challenges={form.challenges}
                solutions={form.solutions}
                isEditMode={isEditMode}
                onChange={handleFormChange}
              />

              <DeliverablesSection
                deliverables={form.deliverables}
                isEditMode={isEditMode}
                onChange={handleFormChange}
              />

              <RecommendationsSection
                warnings={form.warnings}
                filteration={form.filteration}
                bestMember={form.bestMember}
                generalRecs={form.generalRecs}
                isEditMode={isEditMode}
                onChange={handleFormChange}
              />
            </div>
          </div>
        </div>
      </main>

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </div>
  );
}
