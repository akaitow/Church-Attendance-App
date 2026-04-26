"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { getAvailableSundays } from "../utils/date";

const prisma = new PrismaClient({});

export async function getLastSundayData() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "elder" && session.user.role !== "admin")) throw new Error("Unauthorized");

  const churchId = session.user.churchId;
  const sundays = getAvailableSundays();
  const lastSundayStr = sundays[0].date;
  const lastSundayDate = new Date(lastSundayStr);

  const records = await prisma.attendanceRecord.findMany({
    where: { sundayDate: lastSundayDate, churchId },
    include: { person: true }
  });

  return { lastSundayStr, records };
}

export async function correctAttendance(recordId: string, newStatus: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "elder" && session.user.role !== "admin")) throw new Error("Unauthorized");

  const userId = session.user.id;
  const churchId = session.user.churchId;

  const record = await prisma.attendanceRecord.update({
    where: { id: recordId },
    data: { 
      status: newStatus,
      updatedByUserId: userId 
    }
  });

  await prisma.auditLog.create({
    data: {
      entityType: "AttendanceRecord",
      entityId: recordId,
      action: `correction_to_${newStatus}`,
      actorUserId: userId,
      churchId,
    }
  });

  return { success: true };
}

export async function getGeneralReportData() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "elder" && session.user.role !== "admin")) throw new Error("Unauthorized");

  const churchId = session.user.churchId;

  // Get last 4 Sundays for trend chart (simple MVP filter)
  const sundays = getAvailableSundays().map(s => s.date); // just current and previous for now, or we can compute more
  
  // Actually let's compute the last 4 Sundays manually for a better chart
  const today = new Date();
  const recentSundays = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() - (i * 7));
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse(); // chronological order

  const allRecords = await prisma.attendanceRecord.findMany({
    where: { sundayDate: { in: recentSundays }, churchId },
    include: { person: true }
  });

  // Calculate percentages
  const chartData = recentSundays.map(date => {
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const recordsOnDate = allRecords.filter(r => r.sundayDate.getTime() === date.getTime());
    
    const memberTotal = recordsOnDate.filter(r => r.person.personType === "member").length;
    const memberPresent = recordsOnDate.filter(r => r.person.personType === "member" && r.status === "present").length;
    
    const visitTotal = recordsOnDate.filter(r => r.person.personType === "visit").length;
    const visitPresent = recordsOnDate.filter(r => r.person.personType === "visit" && r.status === "present").length;

    return {
      name: dateStr,
      Members: memberTotal > 0 ? Math.round((memberPresent / memberTotal) * 100) : 0,
      Visits: visitTotal > 0 ? Math.round((visitPresent / visitTotal) * 100) : 0,
    };
  });

  // Absence ranking (all time or just recent)
  const absenceRanking = Object.values(allRecords.reduce((acc, r) => {
    if (r.status === "absent") {
      if (!acc[r.personId]) acc[r.personId] = { person: r.person, count: 0 };
      acc[r.personId].count++;
    }
    return acc;
  }, {} as Record<string, { person: any, count: number }>))
  .sort((a, b) => b.count - a.count)
  .slice(0, 10); // Top 10

  return { chartData, absenceRanking };
}

