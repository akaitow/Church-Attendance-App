"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

export async function submitChangeRequest(actionType: string, payload: any, targetPersonId?: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "staff") throw new Error("Unauthorized");

  const userId = session.user.id;
  const churchId = session.user.churchId;

  const request = await prisma.changeRequest.create({
    data: {
      actionType,
      payloadJson: JSON.stringify(payload),
      status: "pending",
      requestedByUserId: userId,
      targetPersonId,
      churchId
    }
  });

  // Notify elders
  const elders = await prisma.user.findMany({ where: { role: "elder", churchId } });
  await prisma.notification.createMany({
    data: elders.map(elder => ({
      type: "request_submitted",
      title: "New Change Request",
      body: `${session.user.name} submitted a request to ${actionType.replace('_', ' ')}.`,
      recipientUserId: elder.id,
      relatedEntityType: "ChangeRequest",
      relatedEntityId: request.id,
      churchId
    }))
  });

  return { success: true, requestId: request.id };
}

export async function processChangeRequest(requestId: string, approve: boolean, reviewNote?: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "elder" && session.user.role !== "admin")) throw new Error("Unauthorized");

  const elderId = session.user.id;
  const churchId = session.user.churchId;

  const request = await prisma.changeRequest.findUnique({ where: { id: requestId, churchId }, include: { requestedBy: true } });
  if (!request) throw new Error("Not found");

  const status = approve ? "approved" : "rejected";

  await prisma.$transaction(async (tx) => {
    // 1. Update request status
    await tx.changeRequest.update({
      where: { id: requestId },
      data: { status, reviewNote, reviewedAt: new Date(), reviewedByUserId: elderId }
    });

    // 2. If approved, apply the change
    if (approve) {
      const payload = JSON.parse(request.payloadJson);
      if (request.actionType === "add_person") {
        await tx.person.create({
          data: {
            fullName: payload.fullName,
            personType: payload.personType,
            assignedStaffId: request.requestedByUserId,
            churchId
          }
        });
      } else if (request.actionType === "edit_person" && request.targetPersonId) {
        await tx.person.update({
          where: { id: request.targetPersonId },
          data: { fullName: payload.fullName }
        });
      } else if (request.actionType === "change_type" && request.targetPersonId) {
        await tx.person.update({
          where: { id: request.targetPersonId },
          data: { personType: payload.personType }
        });
      } else if (request.actionType === "delete_person" && request.targetPersonId) {
        // Soft delete based on product decision
        await tx.person.update({
          where: { id: request.targetPersonId },
          data: { isActive: false }
        });
      }
    }

    // 3. Notify requester
    await tx.notification.create({
      data: {
        type: `request_${status}`,
        title: `Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        body: `Your request to ${request.actionType.replace('_', ' ')} was ${status}.`,
        recipientUserId: request.requestedByUserId,
        relatedEntityType: "ChangeRequest",
        relatedEntityId: request.id,
        churchId
      }
    });
  });

  return { success: true };
}

export async function getPendingRequests() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "elder" && session.user.role !== "admin")) throw new Error("Unauthorized");

  const churchId = session.user.churchId;

  return prisma.changeRequest.findMany({
    where: { status: "pending", churchId },
    include: { requestedBy: true, targetPerson: true },
    orderBy: { createdAt: "desc" }
  });
}
