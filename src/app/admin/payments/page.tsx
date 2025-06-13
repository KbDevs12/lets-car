"use client";

import { useEffect, useState } from "react";
import { columns, Payment } from "@/components/payments/columns";
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
import { PaymentDataTable } from "@/components/payments/data-table";
import { getAllPayments, createPayment, updatePayment } from "./action";

const paymentSchema = z.object({
  booking_id: z.number(),
  jumlah_pembayaran: z.number().min(1000, "Minimal Rp1.000"),
  metode_pembayaran: z.enum(["cash", "transfer", "qris"]),
  tanggal_pembayaran: z.string(),
  status_pembayaran: z.enum(["belum_bayar", "sudah_bayar", "pending"]),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [editing, setEditing] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    try {
      const data = await getAllPayments();

      const formatted = data.map((p) => ({
        ...p,
        tanggal_pembayaran: p.tanggal_pembayaran
          ? new Date(p.tanggal_pembayaran).toISOString().split("T")[0]
          : null,
      }));

      setPayments(formatted);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil data pembayaran");
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      booking_id: 0,
      jumlah_pembayaran: 0,
      metode_pembayaran: "cash",
      tanggal_pembayaran: new Date().toISOString().split("T")[0],
      status_pembayaran: "belum_bayar",
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      if (editing) {
        await updatePayment(editing.id, data);
        toast.success("Data pembayaran diperbarui");
      } else {
        await createPayment(data);
        toast.success("Pembayaran berhasil ditambahkan");
      }
      form.reset();
      setEditing(null);
      setSheetOpen(false);
      fetchPayments();
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan data pembayaran");
    }
  };

  const onEdit = (payment: Payment) => {
    setEditing(payment);
    form.reset({
      booking_id: payment.bookings.id,
      jumlah_pembayaran: payment.jumlah_pembayaran || 0,
      metode_pembayaran: payment.metode_pembayaran as
        | "cash"
        | "transfer"
        | "qris",
      tanggal_pembayaran: payment.tanggal_pembayaran
        ? new Date(payment.tanggal_pembayaran).toISOString().split("T")[0]
        : "",
      status_pembayaran: payment.status_pembayaran as
        | "belum_bayar"
        | "sudah_bayar"
        | "pending",
    });

    setSheetOpen(true);
  };

  const handleAdd = () => {
    form.reset();
    setEditing(null);
    setSheetOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Manajemen Pembayaran</h1>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleAdd}>Tambah Pembayaran</Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[500px]">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "Edit Pembayaran" : "Pembayaran Baru"}
            </h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  name="booking_id"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Booking</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="jumlah_pembayaran"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah Pembayaran</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="metode_pembayaran"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metode Pembayaran</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih metode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="qris">QRIS</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="tanggal_pembayaran"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Pembayaran</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="status_pembayaran"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Pembayaran</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="belum_bayar">
                            Belum Bayar
                          </SelectItem>
                          <SelectItem value="sudah_bayar">
                            Sudah Bayar
                          </SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  {editing ? "Update Pembayaran" : "Simpan Pembayaran"}
                </Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <PaymentDataTable
        columns={columns({ onEdit, onRefresh: fetchPayments })}
        data={payments}
      />
    </div>
  );
}
