import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getAssignedPeople } from "../actions/attendance";
import AttendanceForm from "./AttendanceForm";

export default async function AttendancePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Currently MVP focuses on staff filling out attendance.
  // Elders can do it too, but we will reuse the same logic if they have people assigned,
  // or later build an elder-specific override view.
  const initialPeople = await getAssignedPeople();

  if (initialPeople.length === 0) {
    return (
      <div className="card">
        <h2>Attendance</h2>
        <p className="mt-4" style={{ color: 'var(--secondary)' }}>You do not have any people assigned to you. Attendance cannot be taken.</p>
      </div>
    );
  }

  return (
    <AttendanceForm initialPeople={initialPeople} />
  );
}
