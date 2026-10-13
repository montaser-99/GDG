// Mirrors the current frontend scoring formula:
//   overall = attendance * 0.30 + communication * 0.35 + deadlines * 0.35
// The frontend keeps its own copy for now; Phase 3 will use this one.

export function computeAttendanceRate(meetings = []) {
  let totalAttendance = 0;
  let totalAbsence = 0;

  for (const meeting of meetings) {
    totalAttendance += parseInt(meeting.attendance, 10) || 0;
    totalAbsence += parseInt(meeting.absence, 10) || 0;
  }

  const totalPeople = totalAttendance + totalAbsence;
  return totalPeople > 0 ? Math.round((totalAttendance / totalPeople) * 100) : 100;
}

export function computeOverallScore(attendanceRate, commScore, deadlineScore) {
  return Math.round(
    attendanceRate * 0.3 + (parseInt(commScore, 10) || 0) * 0.35 + (parseInt(deadlineScore, 10) || 0) * 0.35
  );
}

export function computeEvaluationScore(evaluation) {
  const attendanceRate = computeAttendanceRate(evaluation.meetings || []);
  const overallScore = computeOverallScore(
    attendanceRate,
    evaluation.commScore,
    evaluation.deadlineScore
  );
  return { attendanceRate, overallScore };
}
