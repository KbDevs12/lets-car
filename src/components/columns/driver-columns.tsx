"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Driver {
  id: number;
  name: string;
  nik: string;
  nomor_sim: string;
  alamat: string;
  tarif: number;
  phone: string;
  photo: string;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export const createDriverColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
}): ColumnDef<Driver>[] => [
  {
    accessorKey: "name",
    header: "Driver",
    cell: ({ row }) => {
      const driver = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={driver.photo || undefined} alt={driver.name} />
            <AvatarFallback className="bg-primary/10">
              {getInitials(driver.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{driver.name}</div>
            <div className="text-sm text-muted-foreground">ID: {driver.id}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "nik",
    header: "NIK",
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "nomor_sim",
    header: "No. SIM",
    cell: ({ getValue }) => (
      <Badge variant="outline" className="font-mono">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "phone",
    header: "Kontak",
    cell: ({ getValue }) => (
      <div className="flex items-center gap-1 text-sm">
        {getValue() as string}
      </div>
    ),
  },
  {
    accessorKey: "alamat",
    header: "Alamat",
    cell: ({ getValue }) => (
      <div className="flex items-start gap-1 text-sm max-w-[200px]">
        <span className="truncate" title={getValue() as string}>
          {getValue() as string}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "tarif",
    header: "Tarif/Hari",
    cell: ({ getValue }) => (
      <div className="text-right font-semibold text-green-600">
        {formatCurrency(getValue() as number)}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const driver = row.original;
      return (
        <div className="flex items-center justify-center space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(driver)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Driver</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus driver{" "}
                  <span className="font-semibold">{driver.name}</span>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(driver)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];
