"use client";

import { useState } from "react";
import { processChangeRequest } from "../actions/requests";

export default function ElderSettings({ initialRequests }: { initialRequests: any[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleProcess = async (id: string, approve: boolean) => {
    setProcessingId(id);
    try {
      await processChangeRequest(id, approve);
      setRequests(requests.filter(r => r.id !== id));
    } catch {
      alert("Failed to process request");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="card">
        <h3 className="mb-4">Pending Change Requests</h3>
        {requests.length === 0 ? (
          <p style={{ color: 'var(--secondary)' }}>No pending requests.</p>
        ) : (
          <ul className="flex flex-col gap-4" style={{ listStyle: 'none' }}>
            {requests.map(req => {
              const payload = JSON.parse(req.payloadJson);
              return (
                <li key={req.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-md" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                  <div className="flex flex-col mb-2 md:mb-0">
                    <span style={{ fontWeight: 600 }}>{req.actionType.replace('_', ' ').toUpperCase()}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>Requested by: {req.requestedBy.fullName}</span>
                    <div className="mt-1 text-sm">
                      {req.actionType === "add_person" && <span>Add: {payload.fullName} ({payload.personType})</span>}
                      {req.actionType === "change_type" && <span>Change Type to {payload.personType} for {req.targetPerson?.fullName}</span>}
                      {req.actionType === "delete_person" && <span style={{ color: 'var(--danger)' }}>Delete: {req.targetPerson?.fullName}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleProcess(req.id, true)} 
                      disabled={processingId === req.id}
                      className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--success)' }}>
                      Approve
                    </button>
                    <button 
                      onClick={() => handleProcess(req.id, false)} 
                      disabled={processingId === req.id}
                      className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', color: 'var(--danger)', border: '1px solid var(--danger-light)' }}>
                      Reject
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      <div className="card">
        <h3 className="mb-4">User Management (Coming Soon)</h3>
        <p style={{ color: 'var(--secondary)' }}>Full user and assignment management will be implemented in future iterations.</p>
      </div>
    </div>
  );
}
