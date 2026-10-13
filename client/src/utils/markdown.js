// Builds the monthly evaluation report as Markdown text (ported unchanged)
export function buildMarkdownReport({
  committeeName,
  month,
  supervisor,
  scoreText,
  meetingsCount,
  attendanceText,
  attendanceNotes,
  challenges,
  solutions,
  deliverables,
  warnings,
  filteration,
  bestMember,
  generalRecs,
}) {
  return `# تقرير التقييم الشهري - GDG On Campus Damanhour
**اسم اللجنة:** ${committeeName}
**الشهر:** ${month}
**مُعدّ التقرير:** ${supervisor}
**التقييم الشامل:** ${scoreText}

### 1. ملخص اللقاءات والاجتماعات/السيشنات
- **العدد الكلي:** ${meetingsCount}
- **متوسط التزام الحضور:** ${attendanceText}
- **ملاحظات الحضور العامة:** ${attendanceNotes}

### 2. التحديات والحلول
- **التحديات:** ${challenges}
- **الحلول والإجراءات المتخذة:** ${solutions}

### 3. أبرز مخرجات وإنجازات الشهر
- **المخرجات المحققة:** ${deliverables}

### 4. توصيات الـ Supervisor
- **الإنذارات (Warning):** ${warnings}
- **الفلترة (Filteration):** ${filteration}
- **العضو المتميز (Best Member):** ${bestMember}
- **المقترحات للـ HR:** ${generalRecs}

تم استخراج التقرير رسمياً عبر لوحة GDG On Campus Damanhour التفاعلية.`;
}
