"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteBooking } from "@/app/admin/bookings/action";

export type Booking = {
  id: number;
  user_id: number;
  car_id: number;
  driver_id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi: number | null;
  biaya: number | null;
  status: "pending" | "confirmed" | "cancelled" | "completed" | null;
};

export function columns({
  onEdit,
  onRefresh,
}: {
  onEdit: (booking: Booking) => void;
  onRefresh: () => void;
}): ColumnDef<Booking>[] {
  return [
    {
      accessorKey: "user_id",
      header: "User ID",
    },
    {
      accessorKey: "car_id",
      header: "Car ID",
    },
    {
      accessorKey: "driver_id",
      header: "Driver ID",
    },
    {
      accessorKey: "tanggal_mulai",
      header: "Mulai",
    },
    {
      accessorKey: "tanggal_selesai",
      header: "Selesai",
    },
    {
      accessorKey: "durasi",
      header: "Durasi (hari)",
    },
    {
      accessorKey: "biaya",
      header: "Biaya",
      cell: ({ row }) => `Rp ${row.original.biaya?.toLocaleString("id-ID")}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const colorMap: Record<string, string> = {
          pending: "text-yellow-600",
          confirmed: "text-blue-600",
          cancelled: "text-red-600",
          completed: "text-green-600",
        };
        return <span className={colorMap[status || ""]}>{status}</span>;
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const booking = row.original;

        const handleDelete = async () => {
          try {
            await deleteBooking(booking.id);
            toast.success("Booking berhasil dihapus");
            onRefresh();
          } catch (error: any) {
            toast.error(error.message || "Gagal menghapus booking");
          }
        };

        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(booking)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
