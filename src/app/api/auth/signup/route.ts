import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { churchName, adminFullName, username, password } = await req.json();

    // Basic validation
    if (!churchName || !adminFullName || !username || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create Church and Admin User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Church
      const newChurch = await tx.church.create({
        data: {
          name: churchName,
          staffLimit: 10, // Initial limit as requested
        },
      });

      // 2. Create the Admin User
      const newAdmin = await tx.user.create({
        data: {
          fullName: adminFullName,
          username,
          passwordHash,
          role: "admin",
          churchId: newChurch.id,
        },
      });

      return { church: newChurch, admin: newAdmin };
    });

    return NextResponse.json(
      { message: "Account created successfully", churchId: result.church.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during account creation" },
      { status: 500 }
    );
  }
}
