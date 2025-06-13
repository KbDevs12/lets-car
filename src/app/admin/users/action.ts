"use server";

import { prisma, handlePrismaError } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// GET all users
export async function getAllUsers() {
  try {
    return await prisma.users.findMany({
      include: { profiles: true },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}

// CREATE user with profile
export async function createUser(data: {
  username: string;
  password: string;
  role: "user" | "admin" | "owner";
  profile: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
  };
}) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          username: data.username,
          password: hashedPassword,
          role: data.role,
        },
      });

      const profile = await tx.profiles.create({
        data: {
          user_id: user.id,
          full_name: data.profile.full_name,
          email: data.profile.email,
          phone: data.profile.phone,
          address: data.profile.address,
        },
      });

      return { user, profile };
    });

    revalidatePath("/users");
    return created;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

// UPDATE user with profile
export async function updateUser(
  id: number,
  data: {
    username?: string;
    password?: string;
    role?: "user" | "admin" | "owner";
    profile?: {
      full_name: string;
      email: string;
      phone: string;
      address: string;
    };
  }
) {
  try {
    const updated = await prisma.$transaction(async (tx) => {
      // Update user data
      const userData: any = {
        username: data.username,
        role: data.role,
      };

      if (data.password && data.password.trim() !== "") {
        userData.password = await bcrypt.hash(data.password, 10);
      }

      const user = await tx.users.update({
        where: { id },
        data: userData,
      });

      // Update profile data if provided
      if (data.profile) {
        // First, try to find existing profile
        const existingProfile = await tx.profiles.findFirst({
          where: { user_id: id },
        });

        if (existingProfile) {
          // Update existing profile
          await tx.profiles.update({
            where: { id: existingProfile.id },
            data: {
              full_name: data.profile.full_name,
              email: data.profile.email,
              phone: data.profile.phone,
              address: data.profile.address,
            },
          });
        } else {
          // Create new profile
          await tx.profiles.create({
            data: {
              user_id: id,
              full_name: data.profile.full_name,
              email: data.profile.email,
              phone: data.profile.phone,
              address: data.profile.address,
            },
          });
        }
      }

      return user;
    });

    revalidatePath("/users");
    return updated;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

// DELETE user
export async function deleteUser(id: number) {
  try {
    await prisma.users.delete({ where: { id } });
    revalidatePath("/users");
    return { message: "User berhasil dihapus" };
  } catch (error) {
    throw handlePrismaError(error);
  }
}

// GET user by ID (for edit form)
export async function getUser(id: number) {
  try {
    return await prisma.users.findUnique({
      where: { id },
      include: { profiles: true },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}
