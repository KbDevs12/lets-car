"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { createDriverColumns } from "@/components/columns/driver-columns";
import DriverForm from "@/components/forms/driver-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, Users, DollarSign, CreditCard } from "lucide-react";

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

export default function DriverTable() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selected, setSelected] = useState<Driver | undefined>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/drivers");
      const data = await res.json();
      setDrivers(data || []);
    } catch (error) {
      toast.error("Gagal memuat data driver");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleDelete = async (driver: Driver) => {
    try {
      const res = await fetch(`/api/drivers/${driver.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`Driver ${driver.name} berhasil dihapus`);
        fetchDrivers();
      } else {
        toast.error("Gagal menghapus driver");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus");
    }
  };

  const columns = createDriverColumns({
    onEdit: (driver) => {
      setSelected(driver);
      setOpen(true);
    },
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Data Driver
          </h1>
          <p className="text-muted-foreground">
            Kelola informasi driver dan tarif sewa
          </p>
        </div>
        <Button
          onClick={() => {
            setSelected(undefined);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Driver
        </Button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border p-4 rounded-md">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            Total Driver
          </div>
          <div className="text-2xl font-bold">{drivers.length}</div>
        </div>
        <div className="bg-card border p-4 rounded-md">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Rata-rata Tarif
          </div>
          <div className="text-2xl font-bold">
            {drivers.length > 0
              ? new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(
                  drivers.reduce((sum, d) => sum + d.tarif, 0) / drivers.length
                )
              : "Rp 0"}
          </div>
        </div>
        <div className="bg-card border p-4 rounded-md">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            Driver Aktif
          </div>
          <div className="text-2xl font-bold">{drivers.length}</div>
        </div>
      </div>

      {/* Tabel */}
      {!loading && <DataTable columns={columns} data={drivers} />}

      {/* Form Driver */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="space-y-2 pb-6">
            <SheetTitle className="text-2xl">
              {selected ? "Edit Driver" : "Tambah Driver Baru"}
            </SheetTitle>
            <SheetDescription>
              {selected
                ? `Perbarui informasi untuk ${selected.name}`
                : "Lengkapi form di bawah untuk menambahkan driver baru"}
            </SheetDescription>
          </SheetHeader>
          <DriverForm
            initialData={selected}
            onSuccess={() => {
              fetchDrivers();
              setOpen(false);
              setSelected(undefined);
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
