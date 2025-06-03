"use client";

import { useEffect, useState } from "react";
import { columns as carColumns } from "@/components/cars/columns";
import { Car, createCarSchema } from "@/lib/validations/car";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DataTable } from "@/components/cars/data-table";

type FormValues = z.infer<typeof createCarSchema>;

export default function CarPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [cars, setCars] = useState<Car[]>([]);

  const fetchCars = async () => {
    try {
      const res = await fetch("/api/cars");
      const data = await res.json();
      setCars(data.data);
    } catch {
      toast.error("Gagal mengambil data mobil");
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(createCarSchema),
    defaultValues: {
      no_plat: "",
      merk: "",
      model: "",
      tahun: new Date().getFullYear(),
      warna: "",
      kapasitas: 4,
      harga: 0,
      status: "tersedia",
      deskripsi: "",
      foto_mobil: "",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        form.setValue("foto_mobil", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan data");
      }

      toast.success("Mobil berhasil ditambahkan");
      form.reset();
      setPreview(null);
      setSheetOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const onEdit = (car: Car) => {
    form.reset(car);
    setPreview(car.foto_mobil || null);
    setSheetOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Manajemen Mobil</h1>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button>Tambah Mobil</Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:w-[600px] overflow-auto"
          >
            <h2 className="text-lg font-semibold mb-4">Form Mobil</h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  name="no_plat"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Plat</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            let value = e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "");
                            let formatted = "";

                            if (value.length >= 1) formatted += value[0]; // Huruf awal
                            if (value.length > 1) {
                              const angka = value.slice(1).match(/\d{1,4}/);
                              if (angka) formatted += " " + angka[0];
                              const huruf = value
                                .slice(1 + (angka?.[0].length || 0))
                                .match(/[A-Z]{1,3}/);
                              if (huruf) formatted += " " + huruf[0];
                            }

                            field.onChange(formatted);
                          }}
                          value={field.value}
                          placeholder="A 1234 XYZ"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="merk"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Merk</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="model"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="tahun"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="warna"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warna</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="kapasitas"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kapasitas</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="harga"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Sewa</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tersedia">Tersedia</SelectItem>
                          <SelectItem value="tidak_tersedia">
                            Tidak Tersedia
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="deskripsi"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Foto Mobil</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </FormControl>
                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full mt-2 rounded-md"
                    />
                  )}
                  <FormMessage />
                </FormItem>

                <Button type="submit" className="w-full">
                  Simpan
                </Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={carColumns({ onEdit, onRefresh: fetchCars })}
        data={cars}
      />
    </div>
  );
}
