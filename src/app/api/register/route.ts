import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { registerServerSchema } from "@/lib/validations/auth";
import {
  createUserWithProfile,
  checkUniqueFields,
  handlePrismaError,
} from "@/lib/prisma";
import {
  successResponse,
  validationErrorResponse,
  conflictResponse,
  serverErrorResponse,
  methodNotAllowedResponse,
} from "@/lib/utilities/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validasi input dengan Zod
    const validationResult = registerServerSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return validationErrorResponse(errors);
    }

    const { username, password, profile } = validationResult.data;

    // Cek apakah username atau email sudah digunakan
    const { usernameExists, emailExists } = await checkUniqueFields(
      username,
      profile.email
    );

    if (usernameExists) {
      return conflictResponse("Username sudah digunakan", "username");
    }

    if (emailExists) {
      return conflictResponse("Email sudah digunakan", "email");
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Buat user dan profil
    const result = await createUserWithProfile({
      username,
      password: hashedPassword,
      profile,
    });

    // Return response sukses (tanpa password)
    return successResponse(
      {
        user: {
          id: result.user.id,
          username: result.user.username,
          role: result.user.role,
        },
        profile: {
          id: result.profile.id,
          full_name: result.profile.full_name,
          email: result.profile.email,
          phone: result.profile.phone,
          address: result.profile.address,
        },
      },
      "Registrasi berhasil! Silakan login untuk melanjutkan.",
      201
    );
  } catch (error) {
    console.error("Registration error:", error);

    const dbError = handlePrismaError(error);

    if (dbError.field) {
      return conflictResponse(dbError.message, dbError.field);
    }

    return serverErrorResponse(dbError.message);
  }
}

export async function GET() {
  return methodNotAllowedResponse(["POST"]);
}

export async function PUT() {
  return methodNotAllowedResponse(["POST"]);
}

export async function DELETE() {
  return methodNotAllowedResponse(["POST"]);
}
