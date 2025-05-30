import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { driverSchema } from "@/lib/validations/driver";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const driver = await prisma.drivers.findUnique({ where: { id } });

  if (!driver)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(driver);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const parsed = driverSchema.parse(body);

    const updated = await prisma.drivers.update({
      where: { id },
      data: parsed,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  try {
    await prisma.drivers.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
