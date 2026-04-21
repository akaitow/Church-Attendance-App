import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getAssignedPeople } from "../actions/attendance";
import { getPendingRequests } from "../actions/requests";
import StaffSettings from "./StaffSettings";
import ElderSettings from "./ElderSettings";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "staff") {
    const people = await getAssignedPeople();
    return (
      <div>
        <h2 className="mb-6">Settings & Requests</h2>
        <StaffSettings people={people} />
      </div>
    );
  }

  if (session.user.role === "elder") {
    const requests = await getPendingRequests();
    return (
      <div>
        <h2 className="mb-6">Settings & Approvals</h2>
        <ElderSettings initialRequests={requests} />
      </div>
    );
  }
}
