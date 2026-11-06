
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
    { id: 'SoftwareEngineering', name: 'هندسة البرمجيات (Software Engineering)' },
    { id: 'UIUX', name: 'تصميم واجهة وتجربة المستخدم (UI/UX)' },
    { id: 'Frontend', name: 'تطوير واجهات الويب (Frontend)' },
    { id: 'CyberSecurity', name: 'الأمن السيبراني (Cybersecurity)' },
  ],
};

export const TECH_COMMITTEE_IDS = ['ML', 'Flutter', 'DataAnalysis', 'SoftwareEngineering', 'UIUX', 'Frontend', 'CyberSecurity'];

// Empty task presets: new evaluations start without tasks
export const committeeTasksPreset = {
  OC: [],
  PR: [],
  CB: [],
  Creative: [],
  ML: [],
  Flutter: [],
  DataAnalysis: [],
  SoftwareEngineering: [],
  UIUX: [],
  Frontend: [],
  CyberSecurity: [],
};

export const fallbackTaskPreset = [];

// Empty default meetings and technical sessions
export const defaultNonTechMeetings = [];
export const defaultTechSessions = [];

// Month options
const ARABIC_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export function formatMonth(date) {
  return `${ARABIC_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

const now = new Date();
export const CURRENT_MONTH = formatMonth(now);
export const MONTHS = Array.from({ length: 14 }, (_, index) =>
  formatMonth(new Date(now.getFullYear(), now.getMonth() + index - 1, 1))
);

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
