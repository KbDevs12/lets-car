"use server";

import { prisma, handlePrismaError } from "@/lib/prisma";
import { Validate } from "@/lib/validations/validate";
import { revalidatePath } from "next/cache";

export async function getAllPayments() {
  try {
    return await prisma.payments.findMany({
      select: {
        id: true,
        metode_pembayaran: true,
        status_pembayaran: true,
      },
      orderBy: { id: "desc" },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function getAllValidates(): Promise<Validate[]> {
  try {
    const raw = await prisma.validates.findMany();

    return raw.map((v) => ({
      id: v.id,
      payment_id: v.payment_id,
      status: v.status ?? "menunggu",
    }));
  } catch (error) {
    throw handlePrismaError(error);
  }
}
// CREATE validate
export async function createValidate(data: {
  payment_id: number;
  status: "menunggu" | "valid" | "tidak_valid";
}) {
  try {
    const validate = await prisma.validates.create({ data });
    revalidatePath("/admin/validations");
    return validate;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

// UPDATE validate
export async function updateValidate(
  id: number,
  data: {
    payment_id?: number;
    status?: "menunggu" | "valid" | "tidak_valid";
  }
) {
  try {
    const updated = await prisma.validates.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/validations");
    return updated;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

// DELETE validate
export async function deleteValidate(id: number) {
  try {
    await prisma.validates.delete({ where: { id } });
    revalidatePath("/admin/validations");
    return { message: "Validasi berhasil dihapus" };
  } catch (error) {
    throw handlePrismaError(error);
  }
}
