"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({});

export async function getStaffMembers() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  const churchId = session.user.churchId;

  const staff = await prisma.user.findMany({
    where: { churchId, role: { in: ["staff", "elder"] } },
    orderBy: { createdAt: "asc" },
  });

  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: { staffLimit: true }
  });

  return { staff, staffLimit: church?.staffLimit || 10 };
}

export async function createStaffMember(fullName: string, username: string, password: string, role: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const churchId = session.user.churchId;

  try {
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { staffLimit: true }
    });

    const currentStaffCount = await prisma.user.count({
      where: { churchId, role: { in: ["staff", "elder"] } }
    });

    if (church && currentStaffCount >= church.staffLimit) {
      return { error: `Staff limit reached. You can only create up to ${church.staffLimit} staff members.` };
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return { error: "Username is already taken" };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        fullName,
        username,
        passwordHash,
        role,
        churchId
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to create staff member:", error);
    return { error: "An unexpected error occurred." };
  }
}
