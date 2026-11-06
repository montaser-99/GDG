export const COMMITTEES = {
  non_tech: [
    { id: 'OC', name: 'لجنة التنظيم (OC)' },
    { id: 'PR', name: 'العلاقات العامة (PR)' },
    { id: 'CB', name: 'بناء المجتمع (CB)' },
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

export const COMMITTEE_BY_ID = new Map(
  Object.entries(COMMITTEES).flatMap(([type, committees]) =>
    committees.map((committee) => [committee.id, { ...committee, type }])
  )
);

export function getCommitteeInfo(id, fallbackType = 'non_tech') {
  return COMMITTEE_BY_ID.get(id) || { id, name: id, type: fallbackType };
}
