"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deletePayment } from "@/app/admin/payments/action";

export type Payment = {
  id: number;
  jumlah_pembayaran: number | null;
  metode_pembayaran: string | null;
  tanggal_pembayaran: string | null;
  status_pembayaran: string | null;
  bookings: {
    id: number;
    users: {
      username: string;
    };
  };
};

export function columns({
  onEdit,
  onRefresh,
}: {
  onEdit: (payment: Payment) => void;
  onRefresh: () => void;
}): ColumnDef<Payment>[] {
  return [
    {
      accessorKey: "bookings.users.username",
      header: "User",
      cell: ({ row }) => row.original.bookings?.users?.username || "-",
    },
    {
      accessorKey: "jumlah_pembayaran",
      header: "Jumlah",
      cell: ({ row }) =>
        `Rp ${row.original.jumlah_pembayaran?.toLocaleString() || 0}`,
    },
    {
      accessorKey: "metode_pembayaran",
      header: "Metode",
    },
    {
      accessorKey: "tanggal_pembayaran",
      header: "Tanggal",
    },
    {
      accessorKey: "status_pembayaran",
      header: "Status",
      cell: ({ row }) => {
        const status: any = row.original.status_pembayaran;
        const statusMap: any = {
          sudah_bayar: "text-green-600",
          belum_bayar: "text-red-600",
          pending: "text-yellow-600",
        };
        return <span className={statusMap[status] || ""}>{status}</span>;
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const payment = row.original;

        const handleDelete = async () => {
          try {
            await deletePayment(payment.id);
            toast.success("Pembayaran berhasil dihapus");
            onRefresh();
          } catch (error: any) {
            toast.error(error.message || "Gagal menghapus pembayaran");
          }
        };

        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(payment)}>
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
