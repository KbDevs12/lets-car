import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function handlePrismaError(error: any) {
  console.error("Database error:", error);

  if (error.code === "P2002") {
    const target = error.meta?.target;
    if (Array.isArray(target)) {
      if (target.includes("username")) {
        return { message: "Username sudah digunakan", field: "username" };
      }
      if (target.includes("email")) {
        return { message: "Email sudah digunakan", field: "email" };
      }
      if (target.includes("no_plat")) {
        return { message: "Nomor plat sudah terdaftar", field: "no_plat" };
      }
    }
    return { message: "Data sudah ada dalam sistem" };
  }

  if (error.code === "P2025") {
    // Record not found
    return { message: "Data tidak ditemukan" };
  }

  return { message: "Terjadi kesalahan pada database" };
}

// Helper function untuk user operations
export async function createUserWithProfile(userData: {
  username: string;
  password: string;
  profile: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
  };
}) {
  return await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.users.create({
      data: {
        username: userData.username,
        password: userData.password,
        role: "user", // default role
      },
    });

    // Create profile
    const profile = await tx.profiles.create({
      data: {
        user_id: user.id,
        full_name: userData.profile.full_name,
        email: userData.profile.email,
        phone: userData.profile.phone,
        address: userData.profile.address,
      },
    });

    return { user, profile };
  });
}

// Helper function untuk get user dengan profile
export async function getUserWithProfile(userId: number) {
  return await prisma.users.findUnique({
    where: { id: userId },
    include: {
      profiles: true,
    },
  });
}

// Helper function untuk authenticate user
export async function authenticateUser(username: string) {
  return await prisma.users.findUnique({
    where: { username },
    include: {
      profiles: true,
    },
  });
}

// Helper function untuk check unique fields
export async function checkUniqueFields(username: string, email: string) {
  const [existingUser, existingProfile] = await Promise.all([
    prisma.users.findUnique({
      where: { username },
    }),
    prisma.profiles.findFirst({
      where: { email },
    }),
  ]);

  return {
    usernameExists: !!existingUser,
    emailExists: !!existingProfile,
  };
}
