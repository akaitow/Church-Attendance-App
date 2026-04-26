"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [churchName, setChurchName] = useState("");
  const [adminFullName, setAdminFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchName,
          adminFullName,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred during signup");
      } else {
        // Success, redirect to login
        router.push("/login?registered=true");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-8">
      <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "450px" }}>
        <div className="flex flex-col items-center mb-6">
          <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem' }}>C</div>
          <h2 className="text-center">Register Organization</h2>
          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>Create an account for your church</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-md" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="churchName" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Church/Organization Name</label>
            <input
              id="churchName"
              type="text"
              value={churchName}
              onChange={(e) => setChurchName(e.target.value)}
              required
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="adminFullName" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Admin Full Name</label>
            <input
              id="adminFullName"
              type="text"
              value={adminFullName}
              onChange={(e) => setAdminFullName(e.target.value)}
              required
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="username" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Admin Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-4" style={{ padding: '0.75rem' }}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center" style={{ fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
