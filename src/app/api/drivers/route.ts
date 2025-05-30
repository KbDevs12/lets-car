import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { driverSchema } from "@/lib/validations/driver";

export async function GET() {
  try {
    const drivers = await prisma.drivers.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(drivers);
  } catch (error: any) {
    console.error("Error fetching drivers:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data driver" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received data:", body); // Debug log

    // Validasi data dengan schema
    const parsed = driverSchema.parse(body);
    console.log("Parsed data:", parsed); // Debug log

    // Buat driver baru di database
    const driver = await prisma.drivers.create({
      data: {
        name: parsed.name,
        nik: parsed.nik, // Simpan sebagai string, bukan BigInt
        nomor_sim: parsed.nomor_sim, // Simpan sebagai string, bukan BigInt
        alamat: parsed.alamat,
        tarif: parsed.tarif,
        phone: parsed.phone,
        photo: parsed.photo || "", // Fallback ke empty string
      },
    });

    console.log("Created driver:", driver); // Debug log
    return NextResponse.json(driver, { status: 201 });
  } catch (error: any) {
    console.error("Error creating driver:", error);

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          message: "Data tidak valid",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          message: "NIK atau Nomor SIM sudah terdaftar",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: error.message || "Gagal menyimpan data driver",
      },
      { status: 500 }
    );
  }
}
