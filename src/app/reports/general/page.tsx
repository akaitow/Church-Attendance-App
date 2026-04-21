import { getGeneralReportData } from "../../actions/reports";
import ChartClient from "./ChartClient";

export const dynamic = 'force-dynamic';

export default async function GeneralReportPage() {
  const data = await getGeneralReportData();

  return (
    <div className="mt-6 flex flex-col gap-6">
      <div className="card">
        <h3 className="mb-4">Attendance Trend (% Present)</h3>
        <ChartClient data={data.chartData} />
      </div>

      <div className="card">
        <h3 className="mb-4 text-danger" style={{ color: 'var(--danger)' }}>Top Absences</h3>
        {data.absenceRanking.length === 0 ? (
          <p style={{ color: 'var(--secondary)' }}>No absences recorded in this period.</p>
        ) : (
          <ul className="flex flex-col gap-2" style={{ listStyle: 'none' }}>
            {data.absenceRanking.map((item, index) => (
              <li key={item.person.id} className="flex justify-between p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <span style={{ fontWeight: 'bold', color: 'var(--secondary)', width: '20px' }}>{index + 1}.</span>
                  <span>{item.person.fullName}</span>
                  <span className={`badge badge-${item.person.personType}`} style={{ fontSize: '0.65rem' }}>{item.person.personType}</span>
                </div>
                <div style={{ color: 'var(--danger)', fontWeight: 500 }}>
                  {item.count} misses
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
