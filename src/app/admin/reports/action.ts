"use server";
import { prisma, handlePrismaError } from "@/lib/prisma";
import { Report } from "@/types/report";
export async function getAllReports(): Promise<Report[]> {
  try {
    const data = await prisma.reports.findMany({
      include: {
        users: {
          select: { username: true },
        },
        payments: {
          select: {
            jumlah_pembayaran: true,
            metode_pembayaran: true,
            status_pembayaran: true,
          },
        },
      },
      orderBy: { tanggal_laporan: "desc" },
    });

    return data.map((r) => ({
      id: r.id,
      payment_id: r.payment_id,
      user_id: r.user_id,
      laporan: r.laporan,
      tanggal_laporan: r.tanggal_laporan?.toISOString() ?? "",
      user: r.users,
      payment: r.payments,
    }));
  } catch (error) {
    throw handlePrismaError(error);
  }
}
