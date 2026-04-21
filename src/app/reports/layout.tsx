import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "elder") {
    redirect("/"); // Or an unauthorized page
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2>Reports</h2>
      </div>

      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/reports" className="px-4 py-2" style={{ borderBottom: '2px solid var(--primary)', color: 'var(--primary)', fontWeight: 500 }}>
          Last Sunday
        </Link>
        <Link href="/reports/general" className="px-4 py-2" style={{ color: 'var(--secondary)' }}>
          General
        </Link>
        {/* Person report deferred to later iterations or if time permits */}
      </div>

      <div className="report-content">
        {children}
      </div>
    </div>
  );
}
