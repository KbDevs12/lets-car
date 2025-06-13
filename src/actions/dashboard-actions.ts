"use server";

import { prisma } from "@/lib/prisma";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

export async function fetchDashboardStats() {
  const [totalBookings, totalUsers, availableCars, totalRevenue] =
    await Promise.all([
      prisma.bookings.count(),
      prisma.users.count(),
      prisma.cars.count({ where: { status: "tersedia" } }),
      prisma.payments.aggregate({
        _sum: { jumlah_pembayaran: true },
        where: { status_pembayaran: "sudah_bayar" },
      }),
    ]);

  return {
    totalBookings,
    totalUsers,
    availableCars,
    totalRevenue: totalRevenue._sum.jumlah_pembayaran ?? 0,
  };
}

export async function fetchRecentBookings() {
  const bookings = await prisma.bookings.findMany({
    orderBy: { id: "desc" },
    take: 5,
    include: {
      users: true,
      cars: true,
      payments: {
        orderBy: { id: "desc" },
        take: 1,
      },
    },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    userName: booking.users.username,
    carModel: booking.cars.model,
    status: booking.status,
    date: booking.tanggal_mulai?.toISOString().slice(0, 10),
    amount: booking.payments[0]?.jumlah_pembayaran ?? 0,
  }));
}

export async function fetchRevenueChartData() {
  const now = new Date();
  const data = [];

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const monthLabel = monthStart.toLocaleString("default", { month: "short" });

    const sum = await prisma.payments.aggregate({
      _sum: { jumlah_pembayaran: true },
      where: {
        tanggal_pembayaran: {
          gte: monthStart,
          lte: monthEnd,
        },
        status_pembayaran: "sudah_bayar",
      },
    });

    data.push({
      month: monthLabel,
      revenue: sum._sum.jumlah_pembayaran ?? 0,
    });
  }

  return data;
}
