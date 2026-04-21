"use client";

import { useState } from "react";
import { submitChangeRequest } from "../actions/requests";

export default function StaffSettings({ people }: { people: any[] }) {
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonType, setNewPersonType] = useState("visit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      await submitChangeRequest("add_person", { fullName: newPersonName, personType: newPersonType });
      setMessage("Request to add person submitted successfully.");
      setNewPersonName("");
    } catch {
      setMessage("Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionRequest = async (personId: string, actionType: string, payload: any) => {
    if (!window.confirm(`Are you sure you want to request this change?`)) return;
    try {
      await submitChangeRequest(actionType, payload, personId);
      alert("Request submitted successfully.");
    } catch {
      alert("Failed to submit request.");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="card">
        <h3 className="mb-4">Request to Add Person</h3>
        {message && <div className="p-3 mb-4 rounded-md" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>{message}</div>}
        <form onSubmit={handleAddRequest} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex flex-col gap-2 w-full">
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
            <input type="text" value={newPersonName} onChange={e => setNewPersonName(e.target.value)} required style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Type</label>
            <select value={newPersonType} onChange={e => setNewPersonType(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <option value="visit">Visit</option>
              <option value="member">Member</option>
            </select>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '0.6rem 1rem' }}>Submit Request</button>
        </form>
      </div>

      <div className="card">
        <h3 className="mb-4">My Assigned People</h3>
        <p className="mb-4" style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>Changes to existing people require elder approval.</p>
        <ul className="flex flex-col gap-2" style={{ listStyle: 'none' }}>
          {people.map(p => (
            <li key={p.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <span style={{ fontWeight: 500 }}>{p.fullName}</span>
                <span className={`badge badge-${p.personType}`}>{p.personType}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <button 
                  onClick={() => handleActionRequest(p.id, "change_type", { personType: p.personType === 'member' ? 'visit' : 'member' })}
                  className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                  Toggle Type
                </button>
                <button 
                  onClick={() => handleActionRequest(p.id, "delete_person", {})}
                  className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)', border: '1px solid var(--danger-light)' }}>
                  Request Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
