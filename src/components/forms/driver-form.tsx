"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import {
  Upload,
  User,
  CreditCard,
  MapPin,
  Phone,
  Image,
  CheckCircle,
} from "lucide-react";

interface DriverFormProps {
  initialData?: {
    id?: number;
    name?: string;
    nik?: string;
    nomor_sim?: string;
    alamat?: string;
    photo?: string;
    phone?: string;
    status?: "tersedia" | "tidak_tersedia";
  };
  onSuccess?: () => void;
}

export default function DriverForm({
  initialData,
  onSuccess,
}: DriverFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    nik: initialData?.nik || "",
    nomor_sim: initialData?.nomor_sim || "",
    alamat: initialData?.alamat || "",
    phone: initialData?.phone || "",
    photo: initialData?.photo || "",
    status: initialData?.status || "tersedia",
  });

  const [imageBase64, setImageBase64] = useState<string | null>(
    initialData?.photo || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // FIX 1: Update formData when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        nik: initialData.nik || "",
        nomor_sim: initialData.nomor_sim || "",
        alamat: initialData.alamat || "",
        phone: initialData.phone || "",
        photo: initialData.photo || "",
        status: initialData.status || "tersedia",
      });
      setImageBase64(initialData.photo || null);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi";
    }

    if (!formData.nik.trim()) {
      newErrors.nik = "NIK wajib diisi";
    } else if (formData.nik.length !== 16) {
      newErrors.nik = "NIK harus 16 digit";
    }

    if (!formData.nomor_sim.trim()) {
      newErrors.nomor_sim = "Nomor SIM wajib diisi";
    }

    if (!formData.alamat.trim()) {
      newErrors.alamat = "Alamat wajib diisi";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else if (!/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(formData.phone)) {
      newErrors.phone = "Format nomor telepon tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setFormData((prev) => ({ ...prev, photo: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const method = initialData?.id ? "PUT" : "POST";
      const url = initialData?.id
        ? `/api/drivers/${initialData.id}`
        : `/api/drivers`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          initialData?.id
            ? "Data driver berhasil diperbarui!"
            : "Data driver berhasil disimpan!"
        );
        onSuccess?.();
      } else {
        toast.error(result.message || "Gagal menyimpan data driver");
      }
    } catch (error) {
      console.error("Network/Client error:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {initialData?.id ? "Edit Data Driver" : "Tambah Driver Baru"}
        </CardTitle>
        <p className="text-gray-600 text-center">
          {initialData?.id
            ? "Perbarui informasi driver"
            : "Lengkapi data driver untuk mendaftar"}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pribadi
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Lengkap *
              </label>
              <Input
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`h-11 ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                NIK (Nomor Induk Kependudukan) *
              </label>
              <Input
                placeholder="Masukkan 16 digit NIK"
                value={formData.nik}
                onChange={(e) => handleInputChange("nik", e.target.value)}
                maxLength={16}
                className={`h-11 ${errors.nik ? "border-red-500" : ""}`}
              />
              <p className="text-gray-500 text-sm mt-1">
                NIK sesuai dengan KTP
              </p>
              {errors.nik && (
                <p className="text-red-500 text-sm mt-1">{errors.nik}</p>
              )}
            </div>

            <div>
              <label className="md:block text-sm font-medium mb-1 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Nomor Telepon *
              </label>
              <Input
                placeholder="Contoh: 08123456789"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`h-11 ${errors.phone ? "border-red-500" : ""}`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* License Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Informasi SIM
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nomor SIM *
              </label>
              <Input
                placeholder="Masukkan nomor SIM"
                value={formData.nomor_sim}
                onChange={(e) => handleInputChange("nomor_sim", e.target.value)}
                className={`h-11 ${errors.nomor_sim ? "border-red-500" : ""}`}
                maxLength={14}
              />
              <p className="text-gray-500 text-sm mt-1">
                SIM A/B yang masih berlaku
              </p>
              {errors.nomor_sim && (
                <p className="text-red-500 text-sm mt-1">{errors.nomor_sim}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="md:block text-sm font-medium mb-1 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Alamat Lengkap *
            </label>
            <Textarea
              placeholder="Masukkan alamat lengkap sesuai KTP"
              rows={3}
              value={formData.alamat}
              onChange={(e) => handleInputChange("alamat", e.target.value)}
              className={`resize-none ${errors.alamat ? "border-red-500" : ""}`}
            />
            {errors.alamat && (
              <p className="text-red-500 text-sm mt-1">{errors.alamat}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="md:block text-sm font-medium mb-1 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Status Driver
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full h-11 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tersedia">Tersedia</option>
              <option value="tidak_tersedia">Tidak Tersedia</option>
            </select>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="md:block text-sm font-medium mb-2 flex items-center gap-2">
              <Image className="h-4 w-4" />
              Foto Driver
            </label>
            <div className="relative w-full h-32">
              <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Klik untuk upload</span>{" "}
                    atau drag & drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG atau JPEG (MAX. 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>

              {imageBase64 && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 rounded-lg">
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
                        setFormData((prev) => ({ ...prev, photo: "" }));
                      }}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

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
      </CardContent>
    </Card>
  );
}
