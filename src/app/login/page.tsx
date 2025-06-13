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
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, User, Car, ArrowRight } from "lucide-react";
import Loading from "@/components/ui/Loading";

const loginSchema = z.object({
  username: z.string().min(3, { message: "Username minimal 3 karakter" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      ...data,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/");
    } else {
      form.setError("username", { message: "Username atau password salah" });
    }
  };

  if (!mounted) return <Loading />;

  return (
    <div className="min-h-screen bg-background">
      {/* Two-column layout */}
      <div className="min-h-screen flex">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
          {/* Subtle geometric patterns */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-64 h-64 border border-primary/20 rounded-full"></div>
            <div className="absolute bottom-32 right-32 w-48 h-48 border border-secondary/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-accent/20 rounded-full"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-12 py-20">
            <div className="max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-8 group hover:bg-primary/20 transition-colors duration-300">
                <Car className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-6 leading-tight">
                Selamat Datang di
                <br />
                <span className="text-primary">LetsCar</span>
              </h1>

              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Platform terpercaya untuk menyewa mobil impian Anda. Ribuan
                pilihan kendaraan berkualitas dengan layanan terbaik.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Lebih dari 10,000+ mobil tersedia</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Layanan 24/7 customer support</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Proses booking yang mudah & cepat</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">LetsCar</h2>
            </div>

            {/* Form Card */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-card-foreground">
                    Masuk ke Akun Anda
                  </h1>
                  <p className="text-muted-foreground">
                    Silakan masukkan kredensial Anda untuk melanjutkan
                  </p>
                </div>

                <Form {...form}>
                  <form
                    className="space-y-6"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <Label className="text-card-foreground font-medium">
                            Username
                          </Label>
                          <FormControl>
                            <div className="relative group">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                              <Input
                                {...field}
                                placeholder="Masukkan username Anda"
                                className="pl-12 h-12 bg-input border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-primary/50"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-destructive text-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <Label className="text-card-foreground font-medium">
                            Password
                          </Label>
                          <FormControl>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="Masukkan password Anda"
                                className="pl-12 pr-12 h-12 bg-input border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-primary/50"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-destructive text-sm" />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                            <span>Sedang Masuk...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>Masuk Sekarang</span>
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        )}
                      </Button>

                      <div className="text-right">
                        <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200 hover:underline">
                          Lupa Password?
                        </button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            </div>

            {/* Register prompt */}
            <div className="text-center">
              <p className="text-muted-foreground">
                Belum memiliki akun?{" "}
                <button className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline">
                  Daftar Sekarang
                </button>
              </p>
            </div>

            {/* Features for mobile */}
            <div className="lg:hidden mt-8 pt-8 border-t border-border">
              <div className="grid grid-cols-1 gap-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>10,000+ mobil tersedia</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Layanan 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
