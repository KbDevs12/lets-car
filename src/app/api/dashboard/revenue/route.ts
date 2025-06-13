import { NextResponse } from "next/server";
import { fetchRevenueChartData } from "@/actions/dashboard-actions";

export async function GET() {
  const data = await fetchRevenueChartData();
  return NextResponse.json(data);
}
