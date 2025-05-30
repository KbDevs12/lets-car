"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  driverFormSchema,
  DriverFormInput,
  driverSchema,
} from "@/lib/validations/driver";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Upload,
  User,
  CreditCard,
  MapPin,
  Phone,
  DollarSign,
  Image,
} from "lucide-react";

interface DriverFormProps {
  initialData?: Partial<DriverFormInput> & { id?: number };
  onSuccess?: () => void;
}

export default function DriverForm({
  initialData,
  onSuccess,
}: DriverFormProps) {
  const [imageBase64, setImageBase64] = useState<string | null>(
    initialData?.photo ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DriverFormInput>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      nik: initialData?.nik || "",
      nomor_sim: initialData?.nomor_sim || "",
      alamat: initialData?.alamat || "",
      tarif: initialData?.tarif || 0,
      phone: initialData?.phone || "",
      photo: initialData?.photo || "",
    },
  });

  const onSubmit = async (data: DriverFormInput) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...data,
        photo: imageBase64 || "",
      };

      const parsed = driverSchema.parse(submitData);

      const method = initialData?.id ? "PUT" : "POST";
      const url = initialData?.id
        ? `/api/drivers/${initialData.id}`
        : `/api/drivers`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed),
      });

      const responseData = await res.json();

      if (res.ok) {
        toast.success("Data driver berhasil disimpan!");
        onSuccess?.();
      } else {
        toast.error(responseData.message || "Gagal menyimpan data driver");

        if (responseData.errors) {
          console.error("Validation errors:", responseData.errors);
        }
      }
    } catch (error: any) {
      console.error("Error in onSubmit:", error);

      if (error.name === "ZodError") {
        console.error("Zod validation errors:", error.errors);
        toast.error(
          "Data tidak valid: " +
            error.errors.map((e: any) => e.message).join(", ")
        );
      } else {
        toast.error(error?.message || "Validasi data gagal");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (initialData?.photo) {
      setImageBase64(initialData.photo);
      form.setValue("photo", initialData.photo);
    }
  }, [initialData, form]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimal 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImageBase64(base64String);
      form.setValue("photo", base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {initialData?.id ? "Edit Data Driver" : "Tambah Driver Baru"}
        </CardTitle>
        <p className="text-muted-foreground text-center">
          {initialData?.id
            ? "Perbarui informasi driver"
            : "Lengkapi data driver untuk mendaftar"}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pribadi
              </h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama lengkap"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIK (Nomor Induk Kependudukan)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan 16 digit NIK"
                        {...field}
                        className="h-11"
                        max={16}
                      />
                    </FormControl>
                    <FormDescription>NIK sesuai dengan KTP</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Nomor Telepon
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: 08123456789"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* License Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informasi SIM
              </h3>

              <FormField
                control={form.control}
                name="nomor_sim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor SIM</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nomor SIM"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormDescription>
                      SIM A/B yang masih berlaku
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address */}
            <FormField
              control={form.control}
              name="alamat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Alamat Lengkap
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan alamat lengkap sesuai KTP"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tarif */}
            <FormField
              control={form.control}
              name="tarif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Tarif per Hari (Rp)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Contoh: 500000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-11"
                    />
                  </FormControl>
                  <FormDescription>
                    Tarif sewa driver per hari dalam Rupiah
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload */}
            <FormControl>
              <div className="relative w-full h-32">
                {/* Input file area */}
                <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Klik untuk upload</span>{" "}
                      atau drag & drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG atau JPEG (MAX. 5MB)
                    </p>
                  </div>
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImage}
                  />
                </label>

                {/* Preview image overlay */}
                {imageBase64 && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/70 rounded-lg">
                    <div className="relative">
                      <img
                        src={imageBase64}
                        alt="Preview foto"
                        className="rounded-lg w-24 h-24 object-cover border shadow"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 z-20"
                        onClick={() => {
                          setImageBase64(null);
                          form.setValue("photo", "");
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </FormControl>

            <div className="pt-6">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : initialData?.id ? (
                  "Perbarui Data Driver"
                ) : (
                  "Simpan Data Driver"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
