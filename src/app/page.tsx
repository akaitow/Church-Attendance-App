import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  // Staff Dashboard
  if (user.role === "staff") {
    const assignedPersons = await prisma.person.findMany({
      where: { assignedStaffId: user.id, isActive: true },
      orderBy: { fullName: "asc" }
    });

    const membersCount = assignedPersons.filter(p => p.personType === 'member').length;
    const visitsCount = assignedPersons.filter(p => p.personType === 'visit').length;

    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h2>My Assigned People</h2>
        </div>

        <div className="flex gap-4">
          <div className="card flex-1 flex flex-col items-center justify-center py-6">
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{membersCount}</span>
            <span style={{ color: 'var(--secondary)' }}>Members</span>
          </div>
          <div className="card flex-1 flex flex-col items-center justify-center py-6">
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>{visitsCount}</span>
            <span style={{ color: 'var(--secondary)' }}>Visits</span>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4">People List</h3>
          {assignedPersons.length === 0 ? (
            <p style={{ color: 'var(--secondary)' }}>No people assigned to you yet.</p>
          ) : (
            <ul className="flex flex-col gap-2" style={{ listStyle: 'none' }}>
              {assignedPersons.map((person) => (
                <li key={person.id} className="flex justify-between items-center p-3" style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--unknown-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                      {person.fullName.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 500 }}>{person.fullName}</span>
                  </div>
                  <span className={`badge badge-${person.personType}`}>{person.personType}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // Elder Dashboard
  if (user.role === "elder") {
    const allStaff = await prisma.user.findMany({
      where: { role: 'staff', isActive: true },
      include: {
        _count: { select: { assignedPersons: true } }
      }
    });

    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h2>Elder Overview</h2>
        </div>

        <div className="card">
          <h3 className="mb-4">Staff Directory</h3>
          <ul className="flex flex-col gap-2" style={{ listStyle: 'none' }}>
            {allStaff.map(staff => (
              <li key={staff.id} className="flex justify-between items-center p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 500 }}>{staff.fullName}</span>
                <span className="badge badge-unknown">{staff._count.assignedPersons} assigned</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
