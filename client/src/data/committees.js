
// Committees categorization (Technical vs Non-Technical)
export const committeesData = {
  non_tech: [
    { id: 'OC', name: 'لجنة التنظيم (OC)' },
    { id: 'PR', name: 'العلاقات العامة (PR)' },
    { id: 'CB', name: 'بناء المجتمع (CB - Community Building)' },
    { id: 'Creative', name: 'اللجنة الإبداعية (Creative)' },
  ],
  tech: [
    { id: 'ML', name: 'تعلم الآلة (Machine Learning)' },
    { id: 'Flutter', name: 'تطوير التطبيقات (Flutter)' },
    { id: 'DataAnalysis', name: 'تحليل البيانات (Data Analysis)' },
  ],
};

export const TECH_COMMITTEE_IDS = ['ML', 'Flutter', 'DataAnalysis'];

// Empty task presets: new evaluations start without tasks
export const committeeTasksPreset = {
  OC: [],
  PR: [],
  CB: [],
  Creative: [],
  ML: [],
  Flutter: [],
  DataAnalysis: [],
};

export const fallbackTaskPreset = [];

// Empty default meetings and technical sessions
export const defaultNonTechMeetings = [];
export const defaultTechSessions = [];

// Month options
export const MONTHS = [
  'أكتوبر 2026',
  'نوفمبر 2026',
  'ديسمبر 2026',
  'يناير 2027',
  'فبراير 2027',
  'مارس 2027',
  'أبريل 2027',
  'مايو 2027',
  'يونيو 2027',
  'يوليو 2027',
  'أغسطس 2027',
  'سبتمبر 2027',
  'أكتوبر 2027',
];

// Empty default template used when no saved evaluation exists
export const defaultFormValues = {
  supervisor: '',
  target: '',
  commScore: 0,
  deadlineScore: 0,
  attendanceNotes: '',
  challenges: '',
  solutions: '',
  deliverables: '',
  warnings: '',
  filteration: '',
  bestMember: '',
  generalRecs: '',
};

// Load an empty evaluation for a committee-month with no saved data
export function getDefaultEvaluation(committeeId, committeeType, userName) {
  return {
    form: {
      ...defaultFormValues,
      supervisor: userName || '',
    },
    meetings: [],
    tasks: [],
  };
}