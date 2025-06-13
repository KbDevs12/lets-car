"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Car } from "@/lib/validations/car";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export function columns({
  onEdit,
  onRefresh,
}: {
  onEdit: (car: Car) => void;
  onRefresh: () => void;
}): ColumnDef<Car>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "no_plat",
      header: "No. Plat",
    },
    {
      accessorKey: "merk",
      header: "Merk",
    },
    {
      accessorKey: "model",
      header: "Model",
    },
    {
      accessorKey: "warna",
      header: "Warna",
    },
    {
      accessorKey: "harga",
      header: "Harga",
      cell: ({ row }) => {
        const harga = row.original.harga;
        const formatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(harga);

        return <span>{formatted}</span>;
      },
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={
            row.original.status === "tersedia"
              ? "text-green-600"
              : "text-red-600"
          }
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "foto_mobil",
      header: "Foto",
      cell: ({ row }) => {
        const foto = row.original.foto_mobil;
        return foto ? (
          <img
            src={foto}
            alt="Foto Mobil"
            className="w-20 h-12 object-cover rounded-md"
          />
        ) : (
          <span className="text-muted-foreground">No Image</span>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const car = row.original;
        const handleDelete = async () => {
          const res = await fetch(`/api/cars?id=${car.id}`, {
            method: "DELETE",
          });
          const result = await res.json();
          if (!res.ok) {
            toast.error(result.error || "Gagal menghapus");
          } else {
            toast.success("Berhasil dihapus");
            onRefresh();
          }
        };

        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(car)}>
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
