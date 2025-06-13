"use server";

import { prisma, handlePrismaError } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  payments_metode_pembayaran,
  payments_status_pembayaran,
} from "@prisma/client";

// ✅ Ambil semua payments
export async function getAllPayments() {
  try {
    return await prisma.payments.findMany({
      include: {
        bookings: {
          include: {
            users: true,
          },
        },
      },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}

// ✅ Tambah payment baru
export async function createPayment(data: {
  booking_id: number;
  jumlah_pembayaran: number;
  metode_pembayaran: string;
  tanggal_pembayaran: string;
  status_pembayaran: string;
}) {
  try {
    const created = await prisma.payments.create({
      data: {
        booking_id: data.booking_id,
        jumlah_pembayaran: data.jumlah_pembayaran,
        metode_pembayaran: data.metode_pembayaran as payments_metode_pembayaran,
        tanggal_pembayaran: new Date(data.tanggal_pembayaran),
        status_pembayaran: data.status_pembayaran as payments_status_pembayaran,
      },
    });

    revalidatePath("/admin/payments");
    return created;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

// ✅ Update data payment
export async function updatePayment(
  id: number,
  data: Partial<{
    booking_id: number;
    jumlah_pembayaran: number;
    metode_pembayaran: string;
    tanggal_pembayaran: string;
    status_pembayaran: string;
  }>
) {
  try {
    const updated = await prisma.payments.update({
      where: { id },
      data: {
        ...(data.booking_id !== undefined && { booking_id: data.booking_id }),
        ...(data.jumlah_pembayaran !== undefined && {
          jumlah_pembayaran: data.jumlah_pembayaran,
        }),
        ...(data.metode_pembayaran && {
          metode_pembayaran:
            data.metode_pembayaran as payments_metode_pembayaran,
        }),
        ...(data.tanggal_pembayaran && {
          tanggal_pembayaran: new Date(data.tanggal_pembayaran),
        }),
        ...(data.status_pembayaran && {
          status_pembayaran:
            data.status_pembayaran as payments_status_pembayaran,
        }),
      },
    });

    revalidatePath("/admin/payments");
    return updated;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

// ✅ Hapus payment
export async function deletePayment(id: number) {
  try {
    await prisma.payments.delete({ where: { id } });
    revalidatePath("/admin/payments");
    return { message: "Pembayaran berhasil dihapus" };
  } catch (error) {
    throw handlePrismaError(error);
  }
}

// ✅ Ambil payment by id (untuk edit)
export async function getPayment(id: number) {
  try {
    return await prisma.payments.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            users: true,
          },
        },
      },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}
