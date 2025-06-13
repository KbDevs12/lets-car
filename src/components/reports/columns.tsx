"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Report } from "@/types/report";

export const columns: ColumnDef<Report>[] = [
  {
    accessorKey: "tanggal_laporan",
    header: "Tanggal",
    cell: ({ row }) =>
      new Date(row.original.tanggal_laporan).toLocaleDateString("id-ID"),
  },
  {
    accessorKey: "user.username",
    header: "User",
    cell: ({ row }) => row.original.user.username,
  },
  {
    accessorKey: "payment.jumlah_pembayaran",
    header: "Jumlah (Rp)",
    cell: ({ row }) =>
      row.original.payment.jumlah_pembayaran?.toLocaleString("id-ID") ?? "-",
  },
  {
    accessorKey: "laporan",
    header: "Laporan",
  },
];
