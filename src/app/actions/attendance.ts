"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

export async function getAssignedPeople() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const staffId = session.user.id;
  const churchId = session.user.churchId;
  return prisma.person.findMany({
    where: { assignedStaffId: staffId, isActive: true, churchId },
    orderBy: { fullName: "asc" },
  });
}

export async function saveDraft(sundayDate: string, draftJson: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const staffId = session.user.id;
  const churchId = session.user.churchId;
  const parsedDate = new Date(sundayDate);

  await prisma.attendanceDraft.upsert({
    where: {
      staffId_sundayDate: {
        staffId,
        sundayDate: parsedDate,
      },
    },
    update: {
      draftJson,
    },
    create: {
      staffId,
      churchId,
      sundayDate: parsedDate,
      draftJson,
    },
  });
  return { success: true };
}

export async function getDraft(sundayDate: string) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const staffId = session.user.id;
  const churchId = session.user.churchId;
  const parsedDate = new Date(sundayDate);

  return prisma.attendanceDraft.findUnique({
    where: {
      staffId_sundayDate: {
        staffId,
        sundayDate: parsedDate,
      },
    },
  });
}

export async function checkExistingAttendance(sundayDate: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const staffId = session.user.id;
  const churchId = session.user.churchId;
  const parsedDate = new Date(sundayDate);

  // See if any attendance records exist for this staff's people on this Sunday
  const existingRecordsCount = await prisma.attendanceRecord.count({
    where: {
      sundayDate: parsedDate,
      churchId,
      person: {
        assignedStaffId: staffId,
      },
    },
  });

  return { exists: existingRecordsCount > 0 };
}

export async function submitAttendance(sundayDate: string, statuses: Record<string, string>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const userId = session.user.id;
  const churchId = session.user.churchId;
  const parsedDate = new Date(sundayDate);

  // We are upserting records. For each personId in statuses, we insert/update.
  const recordsToUpsert = Object.entries(statuses).map(([personId, status]) => {
    // blank becomes unknown
    const finalStatus = status === "" ? "unknown" : status;
    return {
      personId,
      status: finalStatus,
    };
  });

  // Prisma doesn't have a bulk upsert that returns what we want or works well with multiple unique constraints easily without map.
  // We will do a transaction
  await prisma.$transaction(
    recordsToUpsert.map((record) =>
      prisma.attendanceRecord.upsert({
        where: {
          personId_sundayDate: {
            personId: record.personId,
            sundayDate: parsedDate,
          },
        },
        update: {
          status: record.status,
          updatedByUserId: userId,
        },
        create: {
          personId: record.personId,
          churchId,
          sundayDate: parsedDate,
          status: record.status,
          enteredByUserId: userId,
        },
      })
    )
  );

  // Log to audit log
  await prisma.auditLog.create({
    data: {
      entityType: "AttendanceSubmission",
      entityId: `${userId}-${sundayDate}`,
      action: "submit",
      actorUserId: userId,
      churchId,
    },
  });

  // Clear draft
  await prisma.attendanceDraft.deleteMany({
    where: {
      staffId: userId,
      sundayDate: parsedDate,
    },
  });

  return { success: true };
}
