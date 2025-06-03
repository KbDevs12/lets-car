import { z } from "zod";

export const carSchema = z.object({
  id: z.number().optional(),
  no_plat: z
    .string()
    .min(1, "Nomor plat harus diisi")
    .max(10, "Nomor plat maksimal 10 karakter dengan spasi")
    .regex(
      /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/,
      "Format nomor plat tidak valid (contoh: B 1234 ABC)"
    ),
  merk: z
    .string()
    .min(1, "Merk harus diisi")
    .max(100, "Merk maksimal 100 karakter"),
  model: z
    .string()
    .min(1, "Model harus diisi")
    .max(100, "Model maksimal 100 karakter"),
  tahun: z
    .number()
    .min(1900, "Tahun minimal 1900")
    .max(
      new Date().getFullYear() + 1,
      `Tahun maksimal ${new Date().getFullYear() + 1}`
    ),
  warna: z
    .string()
    .min(1, "Warna harus diisi")
    .max(50, "Warna maksimal 50 karakter"),
  kapasitas: z
    .number()
    .min(1, "Kapasitas minimal 1 orang")
    .max(50, "Kapasitas maksimal 50 orang"),
  harga: z
    .number()
    .min(0, "Harga tidak boleh negatif")
    .max(999999999, "Harga terlalu besar"),
  status: z.enum(["tersedia", "tidak_tersedia"], {
    required_error: "Status harus dipilih",
  }),
  foto_mobil: z.string().optional(),
  deskripsi: z.string().optional(),
});

export const createCarSchema = carSchema.omit({ id: true });
export const updateCarSchema = carSchema.partial().required({ id: true });

export type Car = z.infer<typeof carSchema>;
export type CreateCar = z.infer<typeof createCarSchema>;
export type UpdateCar = z.infer<typeof updateCarSchema>;
