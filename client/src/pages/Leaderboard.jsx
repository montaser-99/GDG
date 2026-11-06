import { useEffect, useMemo, useState } from 'react';
import { MONTHS } from '../data/committees';
import { api } from '../utils/api';

const EMPTY_DATA = {
  summary: { totalCommittees: 0, avgOverallScore: 0, avgAttendance: 0, avgDeadline: 0, totalMeetings: 0 },
  podium: [],
  rankings: [],
  insights: { bestMembers: [], needsAttention: [], warnings: [], filtering: [] },
  distribution: { excellent: 0, veryGood: 0, good: 0, needsAttention: 0 },
};

function Stat({ label, value, detail, icon, tone }) {
  return (
    <article className="leaderboard-stat">
      <span className={`leaderboard-stat-icon ${tone}`} aria-hidden="true"><i className={`fa-solid ${icon}`} /></span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function InsightPanel({ title, icon, items, empty, tone, renderItem }) {
  return (
    <section className="leaderboard-panel insight-panel">
      <div className="leaderboard-panel-heading">
        <span className={`insight-icon ${tone}`} aria-hidden="true"><i className={`fa-solid ${icon}`} /></span>
        <h2>{title}</h2>
      </div>
      {items.length ? (
        <ul className="insight-list">{items.map((item) => <li key={`${item.committeeId}-${item.id}`}>{renderItem(item)}</li>)}</ul>
      ) : <p className="leaderboard-empty-inline">{empty}</p>}
    </section>
  );
}

export default function Leaderboard({ onOpenReport }) {
  const [month, setMonth] = useState(MONTHS[1] || MONTHS[0]);
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [months, setMonths] = useState(MONTHS);
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let active = true;
    api.get('/evaluations/months')
      .then(({ months: savedMonths = [] }) => {
        if (!active) return;
        const merged = [...new Set([...MONTHS, ...savedMonths])];
        setMonths(merged);
        if (!month && merged.length) setMonth(merged[0]);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (type !== 'all') params.set('type', type);
    api.get(`/leaderboard?${params.toString()}`)
      .then((result) => {
        if (active) setData({ ...EMPTY_DATA, ...result });
      })
      .catch((err) => {
        if (!active) return;
        setError(err.status === 403 ? 'حسابك غير مصرح له بعرض التحليلات.' : 'تعذر تحميل بيانات الترتيب. جرّب مرة تانية.');
        setData(EMPTY_DATA);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [month, type, refreshToken]);

  const filteredRankings = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ar');
    if (!normalized) return data.rankings;
    return data.rankings.filter((item) =>
      `${item.committeeName} ${item.supervisor}`.toLocaleLowerCase('ar').includes(normalized)
    );
  }, [data.rankings, query]);

  const totalDistribution = Object.values(data.distribution).reduce((sum, value) => sum + value, 0);
  const openReport = (item) => onOpenReport({ committeeId: item.committeeId, committeeType: item.committeeType, month: item.month });

  return (
    <main className="leaderboard-page" dir="rtl">
      <div className="leaderboard-page-heading">
        <div>
          <p className="eyebrow">مؤشرات الأداء الشهرية</p>
          <h1>ترتيب اللجان والتحليلات</h1>
          <p className="page-description">مقارنة مبنية على التقارير المحفوظة، مع وصول سريع لتقرير كل لجنة.</p>
        </div>
        <div className="leaderboard-controls">
          <label className="control-field">
            <span>الشهر</span>
            <select value={month} onChange={(event) => setMonth(event.target.value)}>
              {months.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <div className="category-control" role="group" aria-label="تصفية حسب نوع اللجنة">
            {[
              ['all', 'كل اللجان'],
              ['tech', 'تقنية'],
              ['non_tech', 'غير تقنية'],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={type === value ? 'is-selected' : ''}
                aria-pressed={type === value}
                onClick={() => setType(value)}
              >{label}</button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="leaderboard-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setRefreshToken((value) => value + 1)}>إعادة المحاولة</button>
        </div>
      )}

      <section className="leaderboard-stat-grid" aria-label="ملخص الشهر">
        <Stat label="تقارير محفوظة" value={data.summary.totalCommittees} detail="لجنة خلال الشهر" icon="fa-people-group" tone="tone-blue" />
        <Stat label="متوسط التقييم" value={`${data.summary.avgOverallScore}%`} detail="من 100 نقطة" icon="fa-chart-line" tone="tone-green" />
        <Stat label="متوسط الحضور" value={`${data.summary.avgAttendance}%`} detail="من بيانات الاجتماعات" icon="fa-user-check" tone="tone-yellow" />
        <Stat label="الاجتماعات" value={data.summary.totalMeetings} detail={`إنجاز المهام ${data.summary.avgDeadline}%`} icon="fa-calendar-check" tone="tone-red" />
      </section>

      <section className="leaderboard-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">أفضل النتائج المسجلة</p>
            <h2>المراكز الأولى</h2>
          </div>
          <span className="section-meta">{month}</span>
        </div>
        {loading ? <div className="leaderboard-loading" role="status">جاري تحميل التقارير…</div> : data.podium.length ? (
          <div className="leaderboard-podium">
            {data.podium.map((item) => (
              <article className={`podium-card podium-rank-${item.rank}`} key={item.id}>
                <span className="podium-rank">{String(item.rank).padStart(2, '0')}</span>
                <div className="podium-main">
                  <span className="committee-type">{item.committeeType === 'tech' ? 'تقنية' : 'غير تقنية'}</span>
                  <h3>{item.committeeName}</h3>
                  <p>{item.supervisor || 'المشرف غير مسجل'}</p>
                </div>
                <div className="podium-score"><strong>{item.overallScore}</strong><span>/ 100</span></div>
                <button type="button" className="text-action" onClick={() => openReport(item)}>التقرير <i className="fa-solid fa-arrow-left" aria-hidden="true" /></button>
              </article>
            ))}
          </div>
        ) : <div className="leaderboard-empty">مفيش تقارير محفوظة للشهر ده لحد دلوقتي.</div>}
      </section>

      <section className="analytics-grid">
        <div className="leaderboard-panel chart-panel">
          <div className="leaderboard-panel-heading">
            <span className="insight-icon tone-blue" aria-hidden="true"><i className="fa-solid fa-chart-column" /></span>
            <div><h2>مقارنة الأداء</h2><p>التقييم العام والحضور لكل لجنة</p></div>
          </div>
          {loading ? <div className="leaderboard-loading" role="status">جاري تجهيز المقارنة…</div> : data.rankings.length ? (
            <div className="comparison-list">
              {data.rankings.slice(0, 8).map((item) => (
                <div className="comparison-row" key={item.id}>
                  <div className="comparison-label"><span>{item.committeeName}</span><strong>{item.overallScore}</strong></div>
                  <div className="comparison-track" aria-label={`التقييم ${item.overallScore}%`}><span style={{ width: `${item.overallScore}%` }} /></div>
                  <div className="comparison-sub"><span>الحضور</span><strong>{item.attendanceRate}%</strong></div>
                </div>
              ))}
            </div>
          ) : <p className="leaderboard-empty-inline">البيانات هتظهر بعد حفظ أول تقرير.</p>}
        </div>

        <div className="leaderboard-panel chart-panel">
          <div className="leaderboard-panel-heading">
            <span className="insight-icon tone-green" aria-hidden="true"><i className="fa-solid fa-chart-pie" /></span>
            <div><h2>مستويات الأداء</h2><p>توزيع التقارير حسب التقييم</p></div>
          </div>
          {totalDistribution ? (
            <div className="distribution-list">
              {[
                ['ممتاز', data.distribution.excellent, 'distribution-green'],
                ['جيد جدًا', data.distribution.veryGood, 'distribution-blue'],
                ['جيد', data.distribution.good, 'distribution-yellow'],
                ['يحتاج متابعة', data.distribution.needsAttention, 'distribution-red'],
              ].map(([label, count, tone]) => (
                <div className="distribution-row" key={label}>
                  <span>{label}</span>
                  <div className="distribution-track"><span className={tone} style={{ width: `${Math.round((count / totalDistribution) * 100)}%` }} /></div>
                  <strong>{count}</strong>
                </div>
              ))}
              <p className="chart-footnote">التصنيف مبني على درجة التقرير المحفوظة.</p>
            </div>
          ) : <p className="leaderboard-empty-inline">لا يوجد توزيع لعرضه قبل حفظ التقارير.</p>}
        </div>
      </section>

      <section className="insights-grid">
        <InsightPanel
          title="أعضاء متميزون"
          icon="fa-award"
          tone="tone-yellow"
          items={data.insights.bestMembers}
          empty="مفيش ترشيحات أعضاء مسجلة للشهر ده."
          renderItem={(item) => <><strong>{item.bestMember}</strong><small>{item.committeeName}</small></>}
        />
        <InsightPanel
          title="نقاط تستحق المتابعة"
          icon="fa-bullseye"
          tone="tone-red"
          items={data.insights.needsAttention}
          empty="مفيش تقارير مسجلة حاليًا."
          renderItem={(item) => <><strong>{item.committeeName} · {item.overallScore}%</strong><small>{item.issues.length ? item.issues.join('، ') : 'راجع التقرير مع اللجنة لتحديد الخطوة التالية.'}</small></>}
        />
        <InsightPanel
          title="تنبيهات مسجلة"
          icon="fa-triangle-exclamation"
          tone="tone-red"
          items={data.insights.warnings}
          empty="مفيش تنبيهات مكتوبة في التقارير."
          renderItem={(item) => <><strong>{item.committeeName}</strong><small>{item.warnings}</small></>}
        />
        <InsightPanel
          title="حالات مراجعة مسجلة"
          icon="fa-magnifying-glass-chart"
          tone="tone-blue"
          items={data.insights.filtering}
          empty="مفيش حالات مراجعة مسجلة."
          renderItem={(item) => <><strong>{item.committeeName}</strong><small>{item.filteration}</small></>}
        />
      </section>

      <section className="leaderboard-section leaderboard-panel rankings-panel">
        <div className="section-title-row rankings-heading">
          <div><p className="eyebrow">كل النتائج</p><h2>ترتيب اللجان</h2></div>
          <label className="search-field">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <span className="sr-only">ابحث عن لجنة أو مشرف</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن لجنة أو مشرف" />
          </label>
        </div>
        {loading ? <div className="leaderboard-loading" role="status">جاري تحميل الترتيب…</div> : filteredRankings.length ? (
          <div className="rankings-table-wrap">
            <table className="rankings-table">
              <thead><tr><th scope="col">الترتيب</th><th scope="col">اللجنة</th><th scope="col">المشرف</th><th scope="col">التقييم</th><th scope="col">الحضور</th><th scope="col">المهام</th><th scope="col"><span className="sr-only">إجراء</span></th></tr></thead>
              <tbody>
                {filteredRankings.map((item) => (
                  <tr key={item.id}>
                    <td><span className="rank-pill">{item.rank}</span></td>
                    <td><strong>{item.committeeName}</strong><small>{item.committeeType === 'tech' ? 'تقنية' : 'غير تقنية'}</small></td>
                    <td>{item.supervisor || '—'}</td>
                    <td><strong className="score-value">{item.overallScore}<small>/100</small></strong></td>
                    <td>{item.attendanceRate}%</td>
                    <td>{item.completedTasks}/{item.totalTasks}</td>
                    <td><button type="button" className="text-action" onClick={() => openReport(item)}>فتح التقرير</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="leaderboard-empty">مفيش نتائج مطابقة للبحث.</div>}
      </section>
    </main>
  );
}
