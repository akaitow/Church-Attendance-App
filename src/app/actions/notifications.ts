"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

export async function getNotifications() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  return prisma.notification.findMany({
    where: { recipientUserId: session.user.id, churchId: session.user.churchId },
    orderBy: { createdAt: "desc" },
    take: 50
  });
}

export async function markAsRead(notificationId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  await prisma.notification.updateMany({
    where: { id: notificationId, churchId: session.user.churchId },
    data: { isRead: true }
  });

  return { success: true };
}

export async function markAllAsRead() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  await prisma.notification.updateMany({
    where: { recipientUserId: session.user.id, isRead: false, churchId: session.user.churchId },
    data: { isRead: true }
  });

  return { success: true };
}
