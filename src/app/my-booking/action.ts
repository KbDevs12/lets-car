"use server";

import { prisma } from "@/lib/prisma";

export async function getMyBookings(userId: number) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const bookings = await prisma.bookings.findMany({
      where: {
        user_id: userId,
      },
      include: {
        cars: {
          select: {
            id: true,
            no_plat: true,
            merk: true,
            model: true,
            tahun: true,
            warna: true,
            kapasitas: true,
            harga: true,
            foto_mobil: true,
            deskripsi: true,
          },
        },
        drivers: {
          select: {
            id: true,
            name: true,
            phone: true,
            photo: true,
            nik: true,
            nomor_sim: true,
            alamat: true,
          },
        },
        payments: {
          select: {
            id: true,
            jumlah_pembayaran: true,
            metode_pembayaran: true,
            tanggal_pembayaran: true,
            status_pembayaran: true,
          },
          orderBy: {
            tanggal_pembayaran: "desc",
          },
        },
      },
      orderBy: {
        tanggal_mulai: "desc",
      },
    });

    return {
      success: true,
      data: bookings,
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch bookings",
      data: [],
    };
  }
}

export async function cancelBooking(bookingId: number, userId: number) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    // Check if booking belongs to the user
    const booking = await prisma.bookings.findFirst({
      where: {
        id: bookingId,
        user_id: userId,
      },
      include: {
        payments: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found or access denied");
    }

    // Only allow cancellation if booking is pending or confirmed
    if (booking.status === "completed" || booking.status === "cancelled") {
      throw new Error(
        "Cannot cancel this booking - it is already completed or cancelled"
      );
    }

    // Check if there are any paid payments
    const hasPaidPayments = booking.payments.some(
      (payment) => payment.status_pembayaran === "sudah_bayar"
    );

    if (hasPaidPayments) {
      throw new Error(
        "Cannot cancel booking with completed payments. Please contact support for refund."
      );
    }

    // Update booking status to cancelled
    await prisma.bookings.update({
      where: {
        id: bookingId,
      },
      data: {
        status: "cancelled",
      },
    });

    return {
      success: true,
      message: "Booking cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to cancel booking",
    };
  }
}

export async function getBookingDetails(bookingId: number, userId: number) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    const booking = await prisma.bookings.findFirst({
      where: {
        id: bookingId,
        user_id: userId,
      },
      include: {
        cars: true,
        drivers: true,
        payments: {
          include: {
            validates: true,
          },
        },
        users: {
          include: {
            profiles: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found or access denied");
    }

    return {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch booking details",
      data: null,
    };
  }
}

export async function getBookingStats(userId: number) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get booking counts by status
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
    ] = await Promise.all([
      prisma.bookings.count({
        where: { user_id: userId },
      }),
      prisma.bookings.count({
        where: { user_id: userId, status: "pending" },
      }),
      prisma.bookings.count({
        where: { user_id: userId, status: "confirmed" },
      }),
      prisma.bookings.count({
        where: { user_id: userId, status: "completed" },
      }),
      prisma.bookings.count({
        where: { user_id: userId, status: "cancelled" },
      }),
    ]);

    // Get total spending
    const totalSpending = await prisma.bookings.aggregate({
      where: {
        user_id: userId,
        status: "completed",
      },
      _sum: {
        biaya: true,
      },
    });

    return {
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalSpending: totalSpending._sum.biaya || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch booking statistics",
      data: {
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalSpending: 0,
      },
    };
  }
}
