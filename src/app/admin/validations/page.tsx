"use client";

import { useEffect, useState } from "react";
import { columns } from "@/components/validations/columns";
import { ValidateDataTable } from "@/components/validations/data-table";
import { Validate } from "@/lib/validations/validate";
import {
  getAllValidates,
  createValidate,
  updateValidate,
  getAllPayments,
} from "./action";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const validateSchema = z.object({
  payment_id: z.coerce.number().int().positive("Pilih payment ID"),
  status: z.enum(["menunggu", "valid", "tidak_valid"]),
});

type ValidateFormValues = z.infer<typeof validateSchema>;

interface PaymentOption {
  id: number;
  metode_pembayaran: string | null;
  status_pembayaran: string | null;
}

export default function ValidatesPage() {
  const [data, setData] = useState<Validate[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Validate | null>(null);
  const [payments, setPayments] = useState<PaymentOption[]>([]);

  const fetchValidates = async () => {
    try {
      const result = await getAllValidates();
      setData(result);
    } catch (error: any) {
      toast.error("Gagal memuat data validasi");
    }
  };

  const fetchPayments = async () => {
    try {
      const result = await getAllPayments();
      setPayments(result);
    } catch (error) {
      toast.error("Gagal memuat data pembayaran");
    }
  };

  useEffect(() => {
    fetchValidates();
    fetchPayments();
  }, []);

  const form = useForm<ValidateFormValues>({
    resolver: zodResolver(validateSchema),
    defaultValues: {
      payment_id: 0,
      status: "menunggu",
    },
  });

  const onEdit = (validate: Validate) => {
    setEditing(validate);
    form.reset({
      payment_id: validate.payment_id,
      status: validate.status,
    });
    setSheetOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    form.reset({
      payment_id: 0,
      status: "menunggu",
    });
    setSheetOpen(true);
  };

  const onSubmit = async (values: ValidateFormValues) => {
    try {
      if (editing) {
        await updateValidate(editing.id, values);
        toast.success("Validasi diperbarui");
      } else {
        await createValidate(values);
        toast.success("Validasi berhasil ditambahkan");
      }
      form.reset();
      setEditing(null);
      setSheetOpen(false);
      fetchValidates();
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan validasi");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Manajemen Validasi Pembayaran</h1>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleAdd}>Tambah Validasi</Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[400px]">
            <div className="h-full p-4">
              <h2 className="text-lg font-semibold mb-4">
                {editing ? "Edit Validasi" : "Validasi Baru"}
              </h2>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    name="payment_id"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih pembayaran" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {payments.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                #{p.id} - {p.metode_pembayaran ?? "-"} -{" "}
                                {p.status_pembayaran ?? "-"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Validasi</FormLabel>
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
                            <SelectItem value="menunggu">Menunggu</SelectItem>
                            <SelectItem value="valid">Valid</SelectItem>
                            <SelectItem value="tidak_valid">
                              Tidak Valid
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    {editing ? "Update Validasi" : "Simpan Validasi"}
                  </Button>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <ValidateDataTable
        columns={columns({ onEdit, onRefresh: fetchValidates })}
        data={data}
      />
    </div>
  );
}
