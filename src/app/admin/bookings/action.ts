"use server";

import { prisma, handlePrismaError } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAllBookings() {
  try {
    return await prisma.bookings.findMany();
  } catch (error) {
    throw handlePrismaError(error);
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
  status: string;
  // Payment data
  jumlah_pembayaran: number;
  metode_pembayaran: string;
  tanggal_pembayaran: string;
  status_pembayaran: string;
}) {
  try {
    // Gunakan transaction untuk memastikan konsistensi data
    const result = await prisma.$transaction(async (tx) => {
      // 1. Cek apakah user, mobil dan driver masih tersedia
      const user = await tx.users.findUnique({
        where: { id: data.user_id },
        select: { id: true, username: true },
      });

      const car = await tx.cars.findUnique({
        where: { id: data.car_id },
        select: { id: true, status: true, merk: true, model: true },
      });

      const driver = await tx.drivers.findUnique({
        where: { id: data.driver_id },
        select: { id: true, status: true, name: true },
      });

      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      if (!car) {
        throw new Error("Mobil tidak ditemukan");
      }

      if (!driver) {
        throw new Error("Driver tidak ditemukan");
      }

      if (car.status === "tidak_tersedia") {
        throw new Error(`Mobil ${car.merk} ${car.model} sedang tidak tersedia`);
      }

      if (driver.status === "tidak_tersedia") {
        throw new Error(`Driver ${driver.name} sedang tidak tersedia`);
      }

      // 2. Buat booking baru
      const newBooking = await tx.bookings.create({
        data: {
          user_id: data.user_id,
          car_id: data.car_id,
          driver_id: data.driver_id,
          tanggal_mulai: new Date(data.tanggal_mulai),
          tanggal_selesai: new Date(data.tanggal_selesai),
          durasi: data.durasi,
          biaya: data.biaya,
          status: data.status as any,
        },
      });

      // 3. Buat data payment otomatis
      const newPayment = await tx.payments.create({
        data: {
          booking_id: newBooking.id,
          jumlah_pembayaran: data.jumlah_pembayaran,
          metode_pembayaran: data.metode_pembayaran as any,
          tanggal_pembayaran: new Date(data.tanggal_pembayaran),
          status_pembayaran: data.status_pembayaran as any,
        },
      });

      // 4. Update status mobil menjadi tidak tersedia
      await tx.cars.update({
        where: { id: data.car_id },
        data: { status: "tidak_tersedia" },
      });

      // 5. Update status driver menjadi tidak tersedia
      await tx.drivers.update({
        where: { id: data.driver_id },
        data: { status: "tidak_tersedia" },
      });

      return { booking: newBooking, payment: newPayment };
    });

    revalidatePath("/admin/bookings");
    return result;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function updateBooking(
  id: number,
  data: Partial<{
    user_id: number;
    car_id: number;
    driver_id: number;
    tanggal_mulai: string;
    tanggal_selesai: string;
    durasi: number;
    biaya: number;
    status: string;
    // Payment data
    jumlah_pembayaran: number;
    metode_pembayaran: string;
    tanggal_pembayaran: string;
    status_pembayaran: string;
  }>
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Ambil data booking yang lama untuk mengetahui car_id dan driver_id sebelumnya
      const existingBooking = await tx.bookings.findUnique({
        where: { id },
        select: {
          user_id: true,
          car_id: true,
          driver_id: true,
          status: true,
          payments: { select: { id: true } },
        },
      });

      if (!existingBooking) {
        throw new Error("Booking tidak ditemukan");
      }

      // Jika ada perubahan user_id, car_id atau driver_id, perlu validasi
      const isUserChanged =
        data.user_id && data.user_id !== existingBooking.user_id;
      const isCarChanged =
        data.car_id && data.car_id !== existingBooking.car_id;
      const isDriverChanged =
        data.driver_id && data.driver_id !== existingBooking.driver_id;
      const isStatusChanged =
        data.status && data.status !== existingBooking.status;

      // Validasi user baru jika berubah
      if (isUserChanged) {
        const newUser = await tx.users.findUnique({
          where: { id: data.user_id },
          select: { id: true, username: true },
        });

        if (!newUser) {
          throw new Error("User baru tidak ditemukan");
        }
      }

      // Jika car_id berubah
      if (isCarChanged) {
        // Cek apakah mobil baru tersedia
        const newCar = await tx.cars.findUnique({
          where: { id: data.car_id },
          select: { id: true, status: true, merk: true, model: true },
        });

        if (!newCar) {
          throw new Error("Mobil baru tidak ditemukan");
        }

        if (newCar.status === "tidak_tersedia") {
          throw new Error(
            `Mobil ${newCar.merk} ${newCar.model} sedang tidak tersedia`
          );
        }

        // Kembalikan status mobil lama menjadi tersedia
        await tx.cars.update({
          where: { id: existingBooking.car_id },
          data: { status: "tersedia" },
        });

        // Set mobil baru menjadi tidak tersedia
        await tx.cars.update({
          where: { id: data.car_id },
          data: { status: "tidak_tersedia" },
        });
      }

      // Jika driver_id berubah
      if (isDriverChanged) {
        // Cek apakah driver baru tersedia
        const newDriver = await tx.drivers.findUnique({
          where: { id: data.driver_id },
          select: { id: true, status: true, name: true },
        });

        if (!newDriver) {
          throw new Error("Driver baru tidak ditemukan");
        }

        if (newDriver.status === "tidak_tersedia") {
          throw new Error(`Driver ${newDriver.name} sedang tidak tersedia`);
        }

        // Kembalikan status driver lama menjadi tersedia
        await tx.drivers.update({
          where: { id: existingBooking.driver_id },
          data: { status: "tersedia" },
        });

        // Set driver baru menjadi tidak tersedia
        await tx.drivers.update({
          where: { id: data.driver_id },
          data: { status: "tidak_tersedia" },
        });
      }

      // Jika status booking berubah menjadi "cancelled" atau "completed"
      if (
        isStatusChanged &&
        (data.status === "cancelled" || data.status === "completed")
      ) {
        // Kembalikan status mobil dan driver menjadi tersedia
        await tx.cars.update({
          where: { id: existingBooking.car_id },
          data: { status: "tersedia" },
        });

        await tx.drivers.update({
          where: { id: existingBooking.driver_id },
          data: { status: "tersedia" },
        });
      }

      // Update data booking
      const bookingUpdateData: any = {};
      if (data.user_id) bookingUpdateData.user_id = data.user_id;
      if (data.car_id) bookingUpdateData.car_id = data.car_id;
      if (data.driver_id) bookingUpdateData.driver_id = data.driver_id;
      if (data.tanggal_mulai)
        bookingUpdateData.tanggal_mulai = new Date(data.tanggal_mulai);
      if (data.tanggal_selesai)
        bookingUpdateData.tanggal_selesai = new Date(data.tanggal_selesai);
      if (data.durasi) bookingUpdateData.durasi = data.durasi;
      if (data.biaya) bookingUpdateData.biaya = data.biaya;
      if (data.status) bookingUpdateData.status = data.status;

      const updatedBooking = await tx.bookings.update({
        where: { id },
        data: bookingUpdateData,
      });

      // Update data payment jika ada
      let updatedPayment = null;
      if (existingBooking.payments.length > 0) {
        const paymentUpdateData: any = {};
        if (data.jumlah_pembayaran !== undefined)
          paymentUpdateData.jumlah_pembayaran = data.jumlah_pembayaran;
        if (data.metode_pembayaran)
          paymentUpdateData.metode_pembayaran = data.metode_pembayaran;
        if (data.tanggal_pembayaran)
          paymentUpdateData.tanggal_pembayaran = new Date(
            data.tanggal_pembayaran
          );
        if (data.status_pembayaran)
          paymentUpdateData.status_pembayaran = data.status_pembayaran;

        if (Object.keys(paymentUpdateData).length > 0) {
          updatedPayment = await tx.payments.update({
            where: { id: existingBooking.payments[0].id },
            data: paymentUpdateData,
          });
        }
      } else {
        // Jika belum ada payment, buat baru
        if (
          data.jumlah_pembayaran ||
          data.metode_pembayaran ||
          data.tanggal_pembayaran ||
          data.status_pembayaran
        ) {
          updatedPayment = await tx.payments.create({
            data: {
              booking_id: id,
              jumlah_pembayaran: data.jumlah_pembayaran || 0,
              metode_pembayaran: (data.metode_pembayaran as any) || "cash",
              tanggal_pembayaran: data.tanggal_pembayaran
                ? new Date(data.tanggal_pembayaran)
                : new Date(),
              status_pembayaran:
                (data.status_pembayaran as any) || "belum_bayar",
            },
          });
        }
      }

      return { booking: updatedBooking, payment: updatedPayment };
    });

    revalidatePath("/admin/bookings");
    return result;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function deleteBooking(id: number) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Ambil data booking untuk mengembalikan status mobil dan driver
      const existingBooking = await tx.bookings.findUnique({
        where: { id },
        select: {
          car_id: true,
          driver_id: true,
          payments: { select: { id: true } },
        },
      });

      if (!existingBooking) {
        throw new Error("Booking tidak ditemukan");
      }

      // Hapus payment terlebih dahulu (jika ada)
      if (existingBooking.payments.length > 0) {
        await tx.payments.deleteMany({
          where: { booking_id: id },
        });
      }

      // Hapus booking
      const deletedBooking = await tx.bookings.delete({
        where: { id },
      });

      // Kembalikan status mobil dan driver menjadi tersedia
      await tx.cars.update({
        where: { id: existingBooking.car_id },
        data: { status: "tersedia" },
      });

      await tx.drivers.update({
        where: { id: existingBooking.driver_id },
        data: { status: "tersedia" },
      });

      return deletedBooking;
    });

    revalidatePath("/admin/bookings");
    return result;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function getAllCars() {
  try {
    return await prisma.cars.findMany({
      orderBy: { merk: "asc" },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function getAllDrivers() {
  try {
    return await prisma.drivers.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function getAllUsers() {
  try {
    return await prisma.users.findMany({
      include: {
        profiles: {
          select: {
            full_name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { username: "asc" },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function getBookingById(id: number) {
  try {
    return await prisma.bookings.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            profiles: true,
          },
        },
        cars: true,
        drivers: true,
        payments: true,
      },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function getBookingsByUserId(userId: number) {
  try {
    return await prisma.bookings.findMany({
      where: { user_id: userId },
      include: {
        cars: true,
        drivers: true,
        payments: true,
      },
      orderBy: { tanggal_mulai: "desc" },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function updateBookingStatus(id: number, status: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingBooking = await tx.bookings.findUnique({
        where: { id },
        select: { car_id: true, driver_id: true, status: true },
      });

      if (!existingBooking) {
        throw new Error("Booking tidak ditemukan");
      }

      const updatedBooking = await tx.bookings.update({
        where: { id },
        data: { status: status as any },
      });

      // Jika status berubah menjadi cancelled atau completed, kembalikan status mobil dan driver
      if (status === "cancelled" || status === "completed") {
        await tx.cars.update({
          where: { id: existingBooking.car_id },
          data: { status: "tersedia" },
        });

        await tx.drivers.update({
          where: { id: existingBooking.driver_id },
          data: { status: "tersedia" },
        });
      }
      // Jika status berubah menjadi confirmed, set mobil dan driver tidak tersedia
      else if (status === "confirmed" && existingBooking.status === "pending") {
        await tx.cars.update({
          where: { id: existingBooking.car_id },
          data: { status: "tidak_tersedia" },
        });

        await tx.drivers.update({
          where: { id: existingBooking.driver_id },
          data: { status: "tidak_tersedia" },
        });
      }

      return updatedBooking;
    });

    revalidatePath("/admin/bookings");
    return result;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function updatePaymentStatus(
  bookingId: number,
  paymentData: {
    status_pembayaran: string;
    jumlah_pembayaran?: number;
    metode_pembayaran?: string;
    tanggal_pembayaran?: string;
  }
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Cari payment berdasarkan booking_id
      const existingPayment = await tx.payments.findFirst({
        where: { booking_id: bookingId },
      });

      if (!existingPayment) {
        throw new Error("Data pembayaran tidak ditemukan");
      }

      const updateData: any = {
        status_pembayaran: paymentData.status_pembayaran as any,
      };

      if (paymentData.jumlah_pembayaran !== undefined) {
        updateData.jumlah_pembayaran = paymentData.jumlah_pembayaran;
      }
      if (paymentData.metode_pembayaran) {
        updateData.metode_pembayaran = paymentData.metode_pembayaran as any;
      }
      if (paymentData.tanggal_pembayaran) {
        updateData.tanggal_pembayaran = new Date(
          paymentData.tanggal_pembayaran
        );
      }

      const updatedPayment = await tx.payments.update({
        where: { id: existingPayment.id },
        data: updateData,
      });

      return updatedPayment;
    });

    revalidatePath("/admin/bookings");
    return result;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
