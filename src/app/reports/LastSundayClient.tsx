"use client";

import { useState } from "react";
import { correctAttendance } from "../actions/reports";

type RecordData = {
  id: string;
  status: string;
  person: { id: string; fullName: string; personType: string };
};

export default function LastSundayClient({ initialRecords }: { initialRecords: RecordData[] }) {
  const [records, setRecords] = useState(initialRecords);
  
  const handleCorrect = async (id: string, newStatus: string) => {
    // Optimistic update
    const originalRecords = [...records];
    setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
    
    try {
      await correctAttendance(id, newStatus);
    } catch {
      // Revert on error
      setRecords(originalRecords);
      alert("Failed to update attendance.");
    }
  };

  const membersPresent = records.filter(r => r.person.personType === "member" && r.status === "present").length;
  const membersAbsent = records.filter(r => r.person.personType === "member" && r.status === "absent").length;
  const membersUnknown = records.filter(r => r.person.personType === "member" && r.status === "unknown").length;

  const visitsPresent = records.filter(r => r.person.personType === "visit" && r.status === "present").length;
  const visitsAbsent = records.filter(r => r.person.personType === "visit" && r.status === "absent").length;
  const visitsUnknown = records.filter(r => r.person.personType === "visit" && r.status === "unknown").length;

  const absentList = records.filter(r => r.status === "absent");
  const unknownList = records.filter(r => r.status === "unknown");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card text-center p-4">
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Members</div>
          <div className="flex justify-around mt-2">
            <div><span style={{ color: 'var(--success)' }}>{membersPresent}</span> P</div>
            <div><span style={{ color: 'var(--danger)' }}>{membersAbsent}</span> A</div>
            <div><span style={{ color: 'var(--unknown)' }}>{membersUnknown}</span> U</div>
          </div>
        </div>
        <div className="card text-center p-4">
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Visits</div>
          <div className="flex justify-around mt-2">
            <div><span style={{ color: 'var(--success)' }}>{visitsPresent}</span> P</div>
            <div><span style={{ color: 'var(--danger)' }}>{visitsAbsent}</span> A</div>
            <div><span style={{ color: 'var(--unknown)' }}>{visitsUnknown}</span> U</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 card">
          <h3 className="mb-4 text-danger" style={{ color: 'var(--danger)' }}>Absent List</h3>
          {absentList.length === 0 ? <p style={{ color: 'var(--secondary)' }}>No absences recorded.</p> : (
            <ul className="flex flex-col gap-2" style={{ listStyle: 'none' }}>
              {absentList.map(r => (
                <li key={r.id} className="flex justify-between p-2 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span>{r.person.fullName}</span>
                  <span className={`badge badge-${r.person.personType}`}>{r.person.personType}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex-1 card">
          <h3 className="mb-4 text-unknown" style={{ color: 'var(--unknown)' }}>Unknown / Needs Correction</h3>
          {unknownList.length === 0 ? <p style={{ color: 'var(--secondary)' }}>All records are complete.</p> : (
            <ul className="flex flex-col gap-2" style={{ listStyle: 'none' }}>
              {unknownList.map(r => (
                <li key={r.id} className="flex justify-between items-center p-2 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex flex-col">
                    <span>{r.person.fullName}</span>
                    <span className={`badge badge-${r.person.personType}`} style={{ fontSize: '0.65rem', alignSelf: 'flex-start' }}>{r.person.personType}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleCorrect(r.id, "present")} className="badge badge-present hover:opacity-80">P</button>
                    <button onClick={() => handleCorrect(r.id, "absent")} className="badge badge-absent hover:opacity-80">A</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
