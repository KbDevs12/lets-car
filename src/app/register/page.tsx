"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  User,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

const registerSchema = z
  .object({
    username: z.string().min(3, { message: "Username minimal 3 karakter" }),
    password: z.string().min(6, { message: "Password minimal 6 karakter" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password minimal 6 karakter" }),
    full_name: z
      .string()
      .min(2, { message: "Nama lengkap minimal 2 karakter" }),
    email: z.string().email({ message: "Format email tidak valid" }),
    phone: z.string().min(10, { message: "Nomor telepon minimal 10 digit" }),
    address: z.string().min(10, { message: "Alamat minimal 10 karakter" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password harus sama",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      full_name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          profile: {
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            address: data.address,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal register");
      }

      router.push("/login?message=Registration successful! Please login.");
    } catch (error: any) {
      if (error.message.includes("username")) {
        form.setError("username", { message: "Username sudah digunakan" });
      } else if (error.message.includes("email")) {
        form.setError("email", { message: "Email sudah digunakan" });
      } else {
        form.setError("root", {
          message: error.message || "Terjadi kesalahan",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center px-4 py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-300 rounded-2xl mb-4 shadow-lg">
            <Car className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bergabung dengan Kami
          </h1>
          <p className="text-muted-foreground">
            Daftar sekarang dan nikmati kemudahan menyewa mobil
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card/70 backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8">
          <Form {...form}>
            <div className="space-y-6">
              {/* Account Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-card-foreground">
                    Informasi Akun
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-card-foreground font-medium">
                        Username
                      </Label>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            placeholder="Username unik Anda"
                            className="pl-10 h-12 border-border focus:border-primary focus:ring-ring rounded-xl"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-card-foreground font-medium">
                          Password
                        </Label>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pr-10 h-12 border-border focus:border-primary focus:ring-ring rounded-xl"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-card-foreground font-medium">
                          Konfirmasi Password
                        </Label>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pr-10 h-12 border-border focus:border-primary focus:ring-ring rounded-xl"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-secondary" />
                  <h3 className="font-semibold text-card-foreground">
                    Informasi Pribadi
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-card-foreground font-medium">
                        Nama Lengkap
                      </Label>
                      <FormControl>
                        <Input
                          placeholder="Nama lengkap sesuai KTP"
                          className="h-12 border-border focus:border-secondary focus:ring-ring rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-card-foreground font-medium">
                          Email
                        </Label>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="email@example.com"
                              className="pl-10 h-12 border-border focus:border-secondary focus:ring-ring rounded-xl"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-card-foreground font-medium">
                          Nomor Telepon
                        </Label>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              placeholder="08123456789"
                              className="pl-10 h-12 border-border focus:border-secondary focus:ring-ring rounded-xl"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-card-foreground font-medium">
                        Alamat
                      </Label>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                          <textarea
                            placeholder="Alamat lengkap tempat tinggal"
                            className="w-full pl-10 pt-3 pb-3 pr-3 min-h-[3rem] border border-border rounded-xl focus:border-secondary focus:ring-1 focus:ring-ring resize-none bg-input text-foreground"
                            rows={3}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant={"default"}
                className="w-full h-12 hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={loading}
                onClick={form.handleSubmit(onSubmit)}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Mendaftarkan...
                  </div>
                ) : (
                  "Daftar Sekarang"
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-muted-foreground">
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="text-primary hover:text-primary/90 font-semibold hover:underline transition-colors"
                  >
                    Masuk di sini
                  </button>
                </p>
              </div>
            </div>
          </Form>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8 text-center">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Car className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Mobil Berkualitas
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border">
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Shield className="w-4 h-4 text-secondary" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Aman & Terpercaya
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Phone className="w-4 h-4 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Support 24/7
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
