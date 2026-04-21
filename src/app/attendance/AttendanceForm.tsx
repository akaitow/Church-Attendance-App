"use client";

import { useState, useEffect } from "react";
import { getAssignedPeople, saveDraft, getDraft, submitAttendance, checkExistingAttendance } from "../actions/attendance";
import { getAvailableSundays } from "../utils/date";

type Person = {
  id: string;
  fullName: string;
  personType: string;
};

export default function AttendanceForm({ initialPeople }: { initialPeople: Person[] }) {
  const sundays = getAvailableSundays();
  const [selectedSunday, setSelectedSunday] = useState<string>(sundays[0].date);
  
  // Status state: personId -> "present" | "absent" | "" (unknown)
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Derived counts
  const presentCount = Object.values(statuses).filter(s => s === "present").length;
  const absentCount = Object.values(statuses).filter(s => s === "absent").length;
  const unknownCount = initialPeople.length - presentCount - absentCount;

  // Load draft and check existing when Sunday changes
  useEffect(() => {
    let active = true;
    async function loadSundayData() {
      setWarningMessage("");
      setSuccessMessage("");
      
      const { exists } = await checkExistingAttendance(selectedSunday);
      if (active && exists) {
        setWarningMessage("Attendance has already been submitted for this Sunday. You can still make updates if needed.");
      }

      const draft = await getDraft(selectedSunday);
      if (active && draft && draft.draftJson) {
        setStatuses(JSON.parse(draft.draftJson));
      } else if (active) {
        setStatuses({});
      }
    }
    loadSundayData();
    return () => { active = false; };
  }, [selectedSunday]);

  // Autosave draft when statuses change
  useEffect(() => {
    const handler = setTimeout(async () => {
      // Don't save empty drafts if they are entirely empty to begin with
      if (Object.keys(statuses).length > 0) {
        setIsSavingDraft(true);
        await saveDraft(selectedSunday, JSON.stringify(statuses));
        setIsSavingDraft(false);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(handler);
  }, [statuses, selectedSunday]);

  const handleStatusChange = (personId: string, status: string) => {
    setStatuses(prev => ({
      ...prev,
      [personId]: prev[personId] === status ? "" : status // toggle off if same
    }));
  };

  const handleSubmit = async () => {
    // Check for blanks
    if (unknownCount > 0) {
      const confirmSubmit = window.confirm(`There are ${unknownCount} people with no marked status. They will be saved as 'unknown'. Do you want to continue?`);
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");
    setWarningMessage("");
    
    try {
      await submitAttendance(selectedSunday, statuses);
      setSuccessMessage("Attendance successfully submitted!");
      setStatuses({}); // clear local form state (optional)
    } catch (err) {
      setWarningMessage("Failed to submit attendance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2>Attendance</h2>
          <p style={{ color: 'var(--secondary)' }}>Record attendance for your assigned people.</p>
        </div>
        <select 
          value={selectedSunday} 
          onChange={(e) => setSelectedSunday(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
        >
          {sundays.map(s => (
            <option key={s.date} value={s.date}>{s.label}</option>
          ))}
        </select>
      </div>

      {warningMessage && (
        <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
          {warningMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
          {successMessage}
        </div>
      )}

      <div className="flex gap-4">
        <div className="card flex-1 flex flex-col items-center py-4">
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{presentCount}</span>
          <span style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>Present</span>
        </div>
        <div className="card flex-1 flex flex-col items-center py-4">
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{absentCount}</span>
          <span style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>Absent</span>
        </div>
        <div className="card flex-1 flex flex-col items-center py-4">
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--unknown)' }}>{unknownCount}</span>
          <span style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>Unknown</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm" style={{ color: 'var(--secondary)' }}>
        <span>{isSavingDraft ? "Saving draft..." : "Draft saved"}</span>
      </div>

      <div className="card">
        <ul className="flex flex-col gap-2" style={{ listStyle: 'none' }}>
          {initialPeople.map((person) => {
            const currentStatus = statuses[person.id] || "";
            return (
              <li key={person.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--unknown-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                    {person.fullName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{person.fullName}</div>
                    <span className={`badge badge-${person.personType}`} style={{ fontSize: '0.65rem' }}>{person.personType}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatusChange(person.id, "present")}
                    className="btn" 
                    style={{ 
                      backgroundColor: currentStatus === "present" ? 'var(--success)' : 'var(--surface)', 
                      color: currentStatus === "present" ? 'white' : 'var(--foreground)',
                      border: currentStatus === "present" ? '1px solid var(--success)' : '1px solid var(--border)' 
                    }}
                  >
                    Present
                  </button>
                  <button 
                    onClick={() => handleStatusChange(person.id, "absent")}
                    className="btn" 
                    style={{ 
                      backgroundColor: currentStatus === "absent" ? 'var(--danger)' : 'var(--surface)', 
                      color: currentStatus === "absent" ? 'white' : 'var(--foreground)',
                      border: currentStatus === "absent" ? '1px solid var(--danger)' : '1px solid var(--border)' 
                    }}
                  >
                    Absent
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex justify-end sticky bottom-0 bg-white p-4" style={{ backgroundColor: 'var(--background)', borderTop: '1px solid var(--border)', margin: '0 -1.5rem -1.5rem', padding: '1.5rem' }}>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting} 
          className="btn btn-primary" 
          style={{ width: '100%', maxWidth: '200px' }}
        >
          {isSubmitting ? "Submitting..." : "Submit Attendance"}
        </button>
      </div>
    </div>
  );
}
