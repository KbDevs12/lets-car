"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCars() {
  try {
    const cars = await prisma.cars.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return cars;
  } catch (error) {
    console.error("Error fetching cars:", error);
    return [];
  }
}

export async function getAvailableCars() {
  try {
    const cars = await prisma.cars.findMany({
      where: {
        status: "tersedia",
      },
      orderBy: {
        id: "asc",
      },
    });

    return cars;
  } catch (error) {
    console.error("Error fetching available cars:", error);
    return [];
  }
}

export async function getCarById(id: number) {
  try {
    const car = await prisma.cars.findUnique({
      where: {
        id: id,
      },
    });

    return car;
  } catch (error) {
    console.error("Error fetching car by id:", error);
    return null;
  }
}

export async function getAvailableDrivers() {
  try {
    const drivers = await prisma.drivers.findMany({
      where: {
        status: "tersedia",
      },
      orderBy: {
        name: "asc",
      },
    });

    return drivers;
  } catch (error) {
    console.error("Error fetching available drivers:", error);
    return [];
  }
}

export async function createBooking(data: {
  user_id: number;
  car_id: number;
  driver_id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi: number;
  biaya: number;
  metode_pembayaran: "cash" | "transfer" | "qris";
}) {
  try {
    // Create booking first
    const booking = await prisma.bookings.create({
      data: {
        user_id: data.user_id,
        car_id: data.car_id,
        driver_id: data.driver_id,
        tanggal_mulai: new Date(data.tanggal_mulai),
        tanggal_selesai: new Date(data.tanggal_selesai),
        durasi: data.durasi,
        biaya: data.biaya,
        status: "pending",
      },
    });

    // Determine payment status based on payment method
    let paymentStatus: "belum_bayar" | "pending" = "belum_bayar";
    let paymentDate: Date | undefined = undefined;

    // For cash payments, keep it as belum_bayar
    // For transfer and qris, set to pending until verified
    if (
      data.metode_pembayaran === "transfer" ||
      data.metode_pembayaran === "qris"
    ) {
      paymentStatus = "pending";
    }

    // Create payment record with method
    const payment = await prisma.payments.create({
      data: {
        booking_id: booking.id,
        jumlah_pembayaran: data.biaya,
        metode_pembayaran: data.metode_pembayaran,
        status_pembayaran: paymentStatus,
        tanggal_pembayaran: paymentDate,
      },
    });

    // If payment method is transfer or qris, create validation record
    if (
      data.metode_pembayaran === "transfer" ||
      data.metode_pembayaran === "qris"
    ) {
      await prisma.validates.create({
        data: {
          payment_id: payment.id,
          status: "menunggu",
        },
      });
    }

    const drivers = await prisma.drivers.update({
      where: { id: data.driver_id },
      data: { status: "tidak_tersedia" },
    });

    revalidatePath("/cars");
    return { success: true, booking, payment, drivers };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: "Gagal membuat booking" };
  }
}

export async function checkCarAvailability(
  carId: number,
  startDate: string,
  endDate: string
) {
  try {
    const conflictingBookings = await prisma.bookings.findMany({
      where: {
        car_id: carId,
        status: {
          in: ["pending", "confirmed"],
        },
        OR: [
          {
            tanggal_mulai: {
              lte: new Date(endDate),
            },
            tanggal_selesai: {
              gte: new Date(startDate),
            },
          },
        ],
      },
    });

    return conflictingBookings.length === 0;
  } catch (error) {
    console.error("Error checking car availability:", error);
    return false;
  }
}
