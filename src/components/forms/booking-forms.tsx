"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CalendarIcon,
  UserIcon,
  CarIcon,
  CreditCardIcon,
  BanknoteIcon,
  QrCodeIcon,
  CopyIcon,
} from "lucide-react";
import { createBooking, checkCarAvailability } from "@/actions/car-actions";

interface Driver {
  id: number;
  name: string | null;
  phone: string | null;
}

interface Car {
  id: number;
  merk: string | null;
  model: string | null;
  harga: number | null;
  status: "tersedia" | "tidak_tersedia" | null;
}

interface BookingFormProps {
  car: Car;
  drivers: Driver[];
  initialStartDate?: string;
  initialEndDate?: string;
}

export default function BookingForm({
  car,
  drivers,
  initialStartDate,
  initialEndDate,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    startDate: initialStartDate || "",
    endDate: initialEndDate || "",
    driverId: "",
    paymentMethod: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // Calculate duration and total price
  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 1);
  };

  const duration = calculateDuration();
  const totalPrice = duration * (car.harga || 0);

  // Bank account details
  const bankAccounts = {
    bca: "9439001234567890",
    bni: "0123456789",
    mandiri: "1234567890123456",
    bri: "001234567890123",
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");

    if (field === "paymentMethod") {
      setShowPaymentDetails(value !== "");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const validateForm = () => {
    if (!formData.startDate || !formData.endDate) {
      setError("Tanggal mulai dan selesai harus diisi");
      return false;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("Tanggal selesai harus setelah tanggal mulai");
      return false;
    }

    if (new Date(formData.startDate) < new Date()) {
      setError("Tanggal mulai tidak boleh di masa lalu");
      return false;
    }

    if (!formData.driverId) {
      setError("Pilih driver terlebih dahulu");
      return false;
    }

    if (!formData.paymentMethod) {
      setError("Pilih metode pembayaran");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      // Check car availability
      const isAvailable = await checkCarAvailability(
        car.id,
        formData.startDate,
        formData.endDate
      );

      if (!isAvailable) {
        setError("Mobil tidak tersedia pada tanggal yang dipilih");
        setLoading(false);
        return;
      }

      // Create booking with payment method
      const result = await createBooking({
        user_id: 1, // This should come from authenticated user session
        car_id: car.id,
        driver_id: parseInt(formData.driverId),
        tanggal_mulai: formData.startDate,
        tanggal_selesai: formData.endDate,
        durasi: duration,
        biaya: totalPrice,
        metode_pembayaran: formData.paymentMethod as
          | "cash"
          | "transfer"
          | "qris",
      });

      if (result.success) {
        setSuccess(
          "Booking berhasil dibuat! Silakan lakukan pembayaran sesuai metode yang dipilih."
        );
        // Reset form
        setFormData({
          startDate: "",
          endDate: "",
          driverId: "",
          paymentMethod: "",
          notes: "",
        });
        setShowPaymentDetails(false);
      } else {
        setError(result.error || "Terjadi kesalahan saat membuat booking");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentDetails = () => {
    if (!showPaymentDetails) return null;

    switch (formData.paymentMethod) {
      case "cash":
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BanknoteIcon className="h-5 w-5" />
                Pembayaran Cash
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Pembayaran cash akan dilakukan saat pengambilan mobil.
                </p>
                <p className="text-sm text-yellow-800 mt-2">
                  <strong>
                    Total yang harus dibayar: Rp {totalPrice.toLocaleString()}
                  </strong>
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "transfer":
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5" />
                Transfer Bank
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 mb-3">
                  Transfer ke salah satu rekening berikut:
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <div>
                      <p className="font-semibold">BCA</p>
                      <p className="text-sm text-gray-600">
                        {bankAccounts.bca}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(bankAccounts.bca)}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <div>
                      <p className="font-semibold">BNI</p>
                      <p className="text-sm text-gray-600">
                        {bankAccounts.bni}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(bankAccounts.bni)}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <div>
                      <p className="font-semibold">Mandiri</p>
                      <p className="text-sm text-gray-600">
                        {bankAccounts.mandiri}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(bankAccounts.mandiri)}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <div>
                      <p className="font-semibold">BRI</p>
                      <p className="text-sm text-gray-600">
                        {bankAccounts.bri}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(bankAccounts.bri)}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-gray-100 rounded">
                  <p className="text-sm font-semibold">Jumlah Transfer:</p>
                  <p className="text-lg font-bold text-blue-600">
                    Rp {totalPrice.toLocaleString()}
                  </p>
                </div>

                <p className="text-xs text-blue-600 mt-2">
                  * Transfer sesuai nominal exact untuk mempercepat verifikasi
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "qris":
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCodeIcon className="h-5 w-5" />
                Pembayaran QRIS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="w-48 h-48 mx-auto mb-4 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  {/* QR Code placeholder - you can integrate with actual QR code generator */}
                  <div className="text-center">
                    <QrCodeIcon className="h-16 w-16 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">QR Code</p>
                    <p className="text-xs text-gray-400">Scan untuk bayar</p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded border">
                  <p className="text-sm font-semibold">Jumlah Pembayaran:</p>
                  <p className="text-xl font-bold text-green-600">
                    Rp {totalPrice.toLocaleString()}
                  </p>
                </div>

                <p className="text-xs text-green-600 mt-2">
                  Scan QR code dengan aplikasi mobile banking atau e-wallet Anda
                </p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Pilih Tanggal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Tanggal Selesai</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                min={
                  formData.startDate || new Date().toISOString().split("T")[0]
                }
              />
            </div>
          </div>

          {duration > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Durasi: <span className="font-semibold">{duration} hari</span>
              </p>
              <p className="text-sm text-blue-800">
                Total Biaya:{" "}
                <span className="font-semibold">
                  Rp {totalPrice.toLocaleString()}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Driver Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Pilih Driver
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.driverId}
            onValueChange={(value) => handleInputChange("driverId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih driver yang tersedia" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id.toString()}>
                  {driver.name} - {driver.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Metode Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.paymentMethod}
            onValueChange={(value) => handleInputChange("paymentMethod", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih metode pembayaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash (Bayar di Tempat)</SelectItem>
              <SelectItem value="transfer">Transfer Bank</SelectItem>
              <SelectItem value="qris">QRIS</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Payment Details */}
      {renderPaymentDetails()}

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Catatan Tambahan</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Masukkan catatan khusus atau permintaan tambahan"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={loading || car.status !== "tersedia"}
        size="lg"
      >
        {loading
          ? "Memproses..."
          : `Pesan Sekarang - Rp ${totalPrice.toLocaleString()}`}
      </Button>

      {car.status !== "tersedia" && (
        <Alert variant="destructive">
          <AlertDescription>
            Mobil ini sedang tidak tersedia untuk pemesanan.
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
