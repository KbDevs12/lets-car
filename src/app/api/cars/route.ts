import { NextRequest, NextResponse } from "next/server";
import { prisma, handlePrismaError } from "@/lib/prisma";
import { createCarSchema, updateCarSchema } from "@/lib/validations/car";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        ...(search
          ? [
              {
                OR: [
                  { no_plat: { contains: search } },
                  { merk: { contains: search } },
                  { model: { contains: search } },
                  { warna: { contains: search } },
                ],
              },
            ]
          : []),
        ...(status
          ? [{ status: status as "tersedia" | "tidak_tersedia" }]
          : []),
      ],
    };

    const [cars, total] = await Promise.all([
      prisma.cars.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
      prisma.cars.count({ where }),
    ]);

    return NextResponse.json({
      data: cars,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCarSchema.parse(body);

    const existingCar = await prisma.cars.findFirst({
      where: { no_plat: validatedData.no_plat },
    });

    if (existingCar) {
      return NextResponse.json(
        { error: "Nomor plat sudah terdaftar" },
        { status: 400 }
      );
    }

    const car = await prisma.cars.create({
      data: validatedData,
    });

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }

    const prismaError = handlePrismaError(error);
    if (prismaError) {
      return NextResponse.json({ error: prismaError.message }, { status: 400 });
    }

    console.error("Error creating car:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateCarSchema.parse(body);

    const { id, ...updateData } = validatedData;

    const existingCar = await prisma.cars.findUnique({
      where: { id },
    });

    if (!existingCar) {
      return NextResponse.json(
        { error: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    if (updateData.no_plat) {
      const duplicateCar = await prisma.cars.findFirst({
        where: {
          no_plat: updateData.no_plat,
          NOT: { id },
        },
      });

      if (duplicateCar) {
        return NextResponse.json(
          { error: "Nomor plat sudah terdaftar" },
          { status: 400 }
        );
      }
    }

    const car = await prisma.cars.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(car);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }

    const prismaError = handlePrismaError(error);
    if (prismaError) {
      return NextResponse.json({ error: prismaError.message }, { status: 400 });
    }

    console.error("Error updating car:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json(
        { error: "ID mobil harus disediakan" },
        { status: 400 }
      );
    }

    const existingCar = await prisma.cars.findUnique({
      where: { id },
    });

    if (!existingCar) {
      return NextResponse.json(
        { error: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    const activeBookings = await prisma.bookings.findFirst({
      where: {
        car_id: id,
        status: {
          in: ["pending", "confirmed"],
        },
      },
    });

    if (activeBookings) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus mobil yang memiliki booking aktif" },
        { status: 400 }
      );
    }

    await prisma.cars.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Mobil berhasil dihapus" });
  } catch (error) {
    const prismaError = handlePrismaError(error);
    if (prismaError) {
      return NextResponse.json({ error: prismaError.message }, { status: 400 });
    }

    console.error("Error deleting car:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
