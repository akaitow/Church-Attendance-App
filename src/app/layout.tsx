import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LogoutButton from "./components/LogoutButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Assistance App",
  description: "Manage Sunday attendance effectively.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="app-shell flex flex-col" style={{ minHeight: "100vh" }}>
          {session && (
            <header className="header p-4 border-b flex justify-between items-center" style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <div className="logo flex items-center gap-2">
                <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>A</div>
                <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Assistance</h1>
              </div>
              <div className="user-menu flex items-center gap-4">
                <span className="badge badge-member" style={{ textTransform: 'capitalize' }}>{session.user.role}</span>
                <span style={{ fontWeight: 500 }}>{session.user.name}</span>
                <LogoutButton />
              </div>
            </header>
          )}

          <div className="main-content flex flex-1">
            {session && (
              <nav className="sidebar p-4" style={{ width: '250px', backgroundColor: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
                <ul className="flex flex-col gap-2" style={{ listStyle: 'none' }}>
                  <li><Link href="/" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start' }}>Home</Link></li>
                  <li><Link href="/attendance" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start' }}>Attendance</Link></li>
                  {session.user.role === 'elder' && (
                    <li><Link href="/reports" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start' }}>Reports</Link></li>
                  )}
                  {session.user.role === 'admin' && (
                    <li><Link href="/settings/staff" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start' }}>Manage Staff</Link></li>
                  )}
                  <li><Link href="/settings" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start' }}>Settings</Link></li>
                  <li><Link href="/notifications" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start' }}>Notifications</Link></li>
                </ul>
              </nav>
            )}

            <main className="content flex-1 p-4" style={{ backgroundColor: 'var(--background)' }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
