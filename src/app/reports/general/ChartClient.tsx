"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ChartData = {
  name: string;
  Members: number;
  Visits: number;
};

export default function ChartClient({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return <div className="text-secondary p-4">No data available for trend chart.</div>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--secondary)" />
          <YAxis domain={[0, 100]} stroke="var(--secondary)" />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
            itemStyle={{ color: 'var(--foreground)' }}
          />
          <Legend />
          <Line type="monotone" dataKey="Members" stroke="var(--primary)" strokeWidth={2} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Visits" stroke="var(--warning)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
