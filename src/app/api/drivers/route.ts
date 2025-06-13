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
    const parsed = driverSchema.parse(body);

    const driver = await prisma.drivers.create({ data: parsed });

    return NextResponse.json(driver, { status: 201 });
  } catch (error: any) {
    console.error("Error creating driver:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          message: "Data tidak valid",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

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
