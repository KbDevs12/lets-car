import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUserWithProfile, prisma, handlePrismaError } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      include: { profiles: true },
    });
    return NextResponse.json(users);
  } catch (error) {}
}
