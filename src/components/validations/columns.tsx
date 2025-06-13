"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Validate } from "@/lib/validations/validate";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export function columns({
  onEdit,
  onRefresh,
}: {
  onEdit: (validate: Validate) => void;
  onRefresh: () => void;
}): ColumnDef<Validate>[] {
  return [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "payment_id", header: "Payment ID" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let color = "text-gray-600";
        if (status === "valid") color = "text-green-600";
        else if (status === "tidak_valid") color = "text-red-600";
        else if (status === "menunggu") color = "text-yellow-600";

        return <span className={color}>{status}</span>;
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const validate = row.original;

        const handleDelete = async () => {
          const res = await fetch(`/api/validates?id=${validate.id}`, {
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(validate)}
            >
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
