"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getMyBookings, cancelBooking } from "./action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Car,
  User,
  Calendar,
  CreditCard,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  X,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";

type Booking = {
  id: number;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  durasi: number | null;
  biaya: number | null;
  status: "pending" | "confirmed" | "cancelled" | "completed" | null;
  cars: {
    id: number;
    no_plat: string | null;
    merk: string | null;
    model: string | null;
    tahun: number | null;
    warna: string | null;
    kapasitas: number | null;
    harga: number | null;
    foto_mobil: string | null;
  };
  drivers: {
    id: number;
    name: string | null;
    phone: string | null;
    photo: string | null;
  };
  payments: Array<{
    id: number;
    jumlah_pembayaran: number | null;
    metode_pembayaran: "cash" | "transfer" | "qris" | null;
    tanggal_pembayaran: string | null;
    status_pembayaran: "belum_bayar" | "sudah_bayar" | "pending" | null;
  }>;
};

export default function MyBookingsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBookings();
    }
  }, [status]);

  const fetchBookings = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const result: any = await getMyBookings(parseInt(session.user.id));

      if (result.success) {
        setBookings(result.data);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch bookings");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!session?.user?.id) return;

    try {
      setCancellingId(bookingId);
      const result = await cancelBooking(bookingId, parseInt(session.user.id));

      if (result.success) {
        toast.success("Booking cancelled successfully");
        fetchBookings(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to cancel booking");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <X className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Info className="w-3 h-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  const getPaymentStatusBadge = (status: string | null) => {
    switch (status) {
      case "sudah_bayar":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            Pending
          </Badge>
        );
      case "belum_bayar":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            Unpaid
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to view your bookings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">
          View and manage your car rental bookings
        </p>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't made any car rental bookings yet.
            </p>
            <Button>
              <Car className="h-4 w-4 mr-2" />
              Browse Cars
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Booking #{booking.id}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}
                    {booking.payments.length > 0 &&
                      getPaymentStatusBadge(
                        booking.payments[0].status_pembayaran
                      )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Car Information */}
                <div className="flex gap-4">
                  {booking.cars.foto_mobil ? (
                    <img
                      src={booking.cars.foto_mobil}
                      alt={`${booking.cars.merk} ${booking.cars.model}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                      <Car className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {booking.cars.merk} {booking.cars.model}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                      <div>License Plate: {booking.cars.no_plat || "N/A"}</div>
                      <div>Year: {booking.cars.tahun || "N/A"}</div>
                      <div>Color: {booking.cars.warna || "N/A"}</div>
                      <div>
                        Capacity: {booking.cars.kapasitas || "N/A"} people
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Driver Information */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={booking.drivers.photo || ""} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      Driver: {booking.drivers.name || "Not assigned"}
                    </h4>
                    {booking.drivers.phone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {booking.drivers.phone}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Booking Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Start Date</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(booking.tanggal_mulai)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">End Date</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(booking.tanggal_selesai)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Duration</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.durasi
                            ? `${booking.durasi} days`
                            : "Not set"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Total Cost</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(booking.biaya)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                {booking.payments.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payment Information
                      </h4>
                      {booking.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="bg-muted/50 p-3 rounded-lg"
                        >
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              Amount:{" "}
                              {formatCurrency(payment.jumlah_pembayaran)}
                            </div>
                            <div>
                              Method: {payment.metode_pembayaran || "N/A"}
                            </div>
                            <div>
                              Date: {formatDate(payment.tanggal_pembayaran)}
                            </div>
                            <div>
                              Status:{" "}
                              {getPaymentStatusBadge(payment.status_pembayaran)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Actions */}
                {(booking.status === "pending" ||
                  booking.status === "confirmed") && (
                  <>
                    <Separator />
                    <div className="flex justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={cancellingId === booking.id}
                          >
                            {cancellingId === booking.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 mr-2" />
                                Cancel Booking
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this booking? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelBooking(booking.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Yes, Cancel Booking
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
