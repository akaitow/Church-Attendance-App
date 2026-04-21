import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getNotifications } from "../actions/notifications";
import NotificationsClient from "./NotificationsClient";

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const notifications = await getNotifications();

  return (
    <NotificationsClient initialNotifications={notifications} />
  );
}
