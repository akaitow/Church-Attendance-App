"use client";

import { useState, useEffect } from "react";
import { getStaffMembers, createStaffMember } from "../../actions/staff";
import { useRouter } from "next/navigation";

export default function ManageStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [staffLimit, setStaffLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await getStaffMembers();
      setStaff(data.staff);
      setStaffLimit(data.staffLimit);
    } catch (err) {
      console.error(err);
      setError("Failed to load staff members");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await createStaffMember(fullName, username, password, role);
      if (result.error) {
        setError(result.error);
      } else {
        setFullName("");
        setUsername("");
        setPassword("");
        setRole("staff");
        await loadStaff();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12">Loading...</div>;
  }

  const staffCount = staff.length;
  const isAtLimit = staffCount >= staffLimit;

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-[800px] mx-auto pt-6">
      <div className="flex justify-between items-center">
        <h2>Manage Staff</h2>
        <div className="text-sm font-medium" style={{ color: isAtLimit ? 'var(--danger)' : 'var(--text-secondary)' }}>
          {staffCount} of {staffLimit} staff slots used
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 card">
          <h3 className="mb-4">Staff Directory</h3>
          {staff.length === 0 ? (
            <p style={{ color: 'var(--secondary)' }}>No staff members found.</p>
          ) : (
            <ul className="flex flex-col gap-2" style={{ listStyle: 'none' }}>
              {staff.map((s) => (
                <li key={s.id} className="flex justify-between items-center p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{s.fullName}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>@{s.username}</div>
                  </div>
                  <span className={`badge ${s.role === 'elder' ? 'badge-present' : 'badge-unknown'}`}>
                    {s.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:w-80 card h-fit">
          <h3 className="mb-4">Add New Staff</h3>
          
          {error && (
            <div className="p-3 mb-4 rounded-md" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {isAtLimit ? (
            <div className="p-4 rounded-md text-center" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>You have reached your staff limit.</p>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="fullName" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="username" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="role" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                >
                  <option value="staff">Staff</option>
                  <option value="elder">Elder</option>
                </select>
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary w-full mt-2" style={{ padding: '0.75rem' }}>
                {submitting ? "Adding..." : "Add Staff"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
