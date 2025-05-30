import * as z from "zod";

// Schema untuk validasi registrasi di client
export const registerClientSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username minimal 3 karakter" })
      .max(100, { message: "Username maksimal 100 karakter" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username hanya boleh mengandung huruf, angka, dan underscore",
      }),

    password: z
      .string()
      .min(6, { message: "Password minimal 6 karakter" })
      .max(255, { message: "Password maksimal 255 karakter" }),

    confirmPassword: z
      .string()
      .min(6, { message: "Konfirmasi password minimal 6 karakter" }),

    full_name: z
      .string()
      .min(2, { message: "Nama lengkap minimal 2 karakter" })
      .max(255, { message: "Nama lengkap maksimal 255 karakter" })
      .regex(/^[a-zA-Z\s]+$/, {
        message: "Nama hanya boleh mengandung huruf dan spasi",
      }),

    email: z
      .string()
      .email({ message: "Format email tidak valid" })
      .max(255, { message: "Email maksimal 255 karakter" }),

    phone: z
      .string()
      .min(10, { message: "Nomor telepon minimal 10 digit" })
      .max(50, { message: "Nomor telepon maksimal 50 karakter" })
      .regex(/^[0-9+\-\s()]+$/, {
        message: "Format nomor telepon tidak valid",
      }),

    address: z
      .string()
      .min(10, { message: "Alamat minimal 10 karakter" })
      .max(1000, { message: "Alamat maksimal 1000 karakter" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password harus sama",
    path: ["confirmPassword"],
  });

// Schema untuk validasi di server (tanpa confirmPassword)
export const registerServerSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username minimal 3 karakter" })
    .max(100, { message: "Username maksimal 100 karakter" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username hanya boleh mengandung huruf, angka, dan underscore",
    }),

  password: z
    .string()
    .min(6, { message: "Password minimal 6 karakter" })
    .max(255, { message: "Password maksimal 255 karakter" }),

  profile: z.object({
    full_name: z
      .string()
      .min(2, { message: "Nama lengkap minimal 2 karakter" })
      .max(255, { message: "Nama lengkap maksimal 255 karakter" })
      .regex(/^[a-zA-Z\s]+$/, {
        message: "Nama hanya boleh mengandung huruf dan spasi",
      }),

    email: z
      .string()
      .email({ message: "Format email tidak valid" })
      .max(255, { message: "Email maksimal 255 karakter" }),

    phone: z
      .string()
      .min(10, { message: "Nomor telepon minimal 10 digit" })
      .max(50, { message: "Nomor telepon maksimal 50 karakter" })
      .regex(/^[0-9+\-\s()]+$/, {
        message: "Format nomor telepon tidak valid",
      }),

    address: z
      .string()
      .min(10, { message: "Alamat minimal 10 karakter" })
      .max(1000, { message: "Alamat maksimal 1000 karakter" }),
  }),
});

// Schema untuk login
export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username harus diisi" }),

  password: z.string().min(1, { message: "Password harus diisi" }),
});

// Types
export type RegisterClientInput = z.infer<typeof registerClientSchema>;
export type RegisterServerInput = z.infer<typeof registerServerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
