import { getLastSundayData } from "../actions/reports";
import LastSundayClient from "./LastSundayClient";

export const dynamic = 'force-dynamic';

export default async function LastSundayPage() {
  const data = await getLastSundayData();

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3>Report for: {data.lastSundayStr}</h3>
      </div>
      <LastSundayClient initialRecords={data.records} />
    </div>
  );
}
