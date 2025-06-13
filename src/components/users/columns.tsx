"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { deleteUser } from "@/app/admin/users/action";

export type User = {
  id: number;
  username: string;
  role: "user" | "admin" | "owner";
  profiles: {
    id: number;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  }[];
};

export function columns({
  onEdit,
  onRefresh,
}: {
  onEdit: (user: User) => void;
  onRefresh: () => void;
}): ColumnDef<User>[] {
  return [
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "profiles",
      header: "Nama Lengkap",
      cell: ({ row }) => {
        const profile = row.original.profiles?.[0];
        return profile?.full_name || "-";
      },
    },
    {
      accessorKey: "profiles",
      header: "Email",
      cell: ({ row }) => {
        const profile = row.original.profiles?.[0];
        return profile?.email || "-";
      },
    },
    {
      accessorKey: "profiles",
      header: "Telepon",
      cell: ({ row }) => {
        const profile = row.original.profiles?.[0];
        return profile?.phone || "-";
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;

        if (role === "admin") {
          return <span className="text-blue-600 font-medium">Admin</span>;
        } else if (role === "owner") {
          return <span className="text-purple-600 font-bold">Owner</span>;
        }

        return <span className="text-gray-600">User</span>;
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const user = row.original;

        const handleDelete = async () => {
          try {
            await deleteUser(user.id);
            toast.success("User berhasil dihapus");
            onRefresh();
          } catch (error: any) {
            toast.error(error.message || "Gagal menghapus user");
          }
        };

        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
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
