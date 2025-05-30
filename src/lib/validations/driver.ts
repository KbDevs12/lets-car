import { z } from "zod";

export const driverFormSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  nik: z
    .string()
    .length(16, "NIK harus tepat 16 digit")
    .regex(/^\d+$/, "NIK hanya boleh berisi angka"),
  nomor_sim: z
    .string()
    .length(14, "Nomor SIM tepat 14 digit")
    .regex(/^[A-Z0-9]+$/, "Nomor SIM hanya boleh berisi huruf dan angka"),
  alamat: z.string().min(5, "Alamat wajib diisi"),
  tarif: z.number().min(0, "Tarif tidak boleh negatif"),
  phone: z
    .string()
    .min(8, "No. HP minimal 8 digit")
    .max(15, "No. HP maksimal 15 digit")
    .regex(/^[0-9+\-\s]+$/, "Format nomor HP tidak valid"),
  photo: z.string().optional(),
});

export type DriverFormInput = z.infer<typeof driverFormSchema>;

export const driverSchema = driverFormSchema.extend({
  photo: z.string().default(""),
});

export type DriverInput = z.infer<typeof driverSchema>;
