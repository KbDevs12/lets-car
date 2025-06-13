"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { columns, Booking } from "@/components/bookings/columns";
import { BookingDataTable } from "@/components/bookings/data-table";
import {
  getAllBookings,
  createBooking,
  updateBooking,
  getAllCars,
  getAllDrivers,
  getAllUsers,
} from "./action";

const bookingSchema = z.object({
  user_id: z.coerce
    .number()
    .int()
    .positive("User ID harus berupa angka positif"),
  car_id: z.coerce.number().int().positive("Car ID harus berupa angka positif"),
  driver_id: z.coerce
    .number()
    .int()
    .positive("Driver ID harus berupa angka positif"),
  tanggal_mulai: z.string().min(1, "Tanggal mulai harus diisi"),
  tanggal_selesai: z.string().min(1, "Tanggal selesai harus diisi"),
  durasi: z.coerce.number().min(1, "Durasi minimal 1 hari"),
  biaya: z.coerce.number().min(1000, "Biaya minimal Rp 1.000"),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  // Payment fields
  jumlah_pembayaran: z.coerce
    .number()
    .min(0, "Jumlah pembayaran tidak boleh negatif"),
  metode_pembayaran: z.enum(["cash", "transfer", "qris"]),
  tanggal_pembayaran: z.string().min(1, "Tanggal pembayaran harus diisi"),
  status_pembayaran: z.enum(["belum_bayar", "sudah_bayar", "pending"]),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface Car {
  id: number;
  merk: string;
  model: string;
  harga: number;
  no_plat: string;
}

interface Driver {
  id: number;
  name: string;
  nik: string;
  nomor_sim: string;
  phone: string;
}

interface User {
  id: number;
  username: string;
  profiles?: {
    full_name?: string;
    email?: string;
    phone?: string;
  }[];
}

export default function BookingsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    try {
      const data = await getAllBookings();
      const formatted = data.map((b) => ({
        ...b,
        tanggal_mulai: b.tanggal_mulai?.toISOString().split("T")[0] ?? "",
        tanggal_selesai: b.tanggal_selesai?.toISOString().split("T")[0] ?? "",
      }));
      setBookings(formatted);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil data booking");
    }
  };

  const fetchCars = async () => {
    try {
      const data: any = await getAllCars();
      setCars(data);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil data mobil");
    }
  };

  const fetchDrivers = async () => {
    try {
      const data: any = await getAllDrivers();
      setDrivers(data);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil data driver");
    }
  };

  const fetchUsers = async () => {
    try {
      const data: any = await getAllUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil data user");
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchCars();
    fetchDrivers();
    fetchUsers();
  }, []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      user_id: 0,
      car_id: 0,
      driver_id: 0,
      tanggal_mulai: "",
      tanggal_selesai: "",
      durasi: 1,
      biaya: 0,
      status: "pending",
      jumlah_pembayaran: 0,
      metode_pembayaran: "cash",
      tanggal_pembayaran: new Date().toISOString().split("T")[0],
      status_pembayaran: "belum_bayar",
    },
  });

  // Function to calculate duration in days
  const calculateDuration = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays || 1; // Minimum 1 day
  };

  // Function to calculate total cost
  const calculateTotalCost = (carId: number, duration: number): number => {
    const selectedCar = cars.find((car) => car.id === carId);
    if (!selectedCar || !selectedCar.harga || duration <= 0) return 0;

    return selectedCar.harga * duration;
  };

  useEffect(() => {
    const subscription = form.watch((values) => {
      const { tanggal_mulai, tanggal_selesai, car_id, durasi, biaya } = values;

      if (tanggal_mulai && tanggal_selesai) {
        const newDuration = calculateDuration(tanggal_mulai, tanggal_selesai);
        if (durasi !== newDuration) {
          form.setValue("durasi", newDuration);
        }

        if (car_id) {
          const newTotalCost = calculateTotalCost(car_id, newDuration);
          if (biaya !== newTotalCost) {
            form.setValue("biaya", newTotalCost);
            form.setValue("jumlah_pembayaran", newTotalCost);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [cars, form]);

  const onSubmit = async (data: BookingFormValues) => {
    try {
      if (editing) {
        await updateBooking(editing.id, data);
        toast.success("Booking diperbarui");
      } else {
        await createBooking(data);
        toast.success("Booking berhasil ditambahkan");
      }
      form.reset();
      setEditing(null);
      setSheetOpen(false);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan booking");
    }
  };

  const onEdit = (booking: Booking) => {
    setEditing(booking);
    form.reset({
      user_id: booking.user_id,
      car_id: booking.car_id,
      driver_id: booking.driver_id,
      tanggal_mulai: booking.tanggal_mulai || "",
      tanggal_selesai: booking.tanggal_selesai || "",
      durasi: booking.durasi || 1,
      biaya: booking.biaya || 0,
      status: booking.status || "pending",
      jumlah_pembayaran: booking.biaya || 0,
      metode_pembayaran: "cash",
      tanggal_pembayaran: new Date().toISOString().split("T")[0],
      status_pembayaran: "belum_bayar",
    });
    setSheetOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    form.reset();
    setSheetOpen(true);
  };

  const selectedCar = cars.find((car) => car.id === form.watch("car_id"));
  const selectedDriver = drivers.find(
    (driver) => driver.id === form.watch("driver_id")
  );
  const selectedUser = users.find((user) => user.id === form.watch("user_id"));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Manajemen Booking</h1>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleAdd}>Tambah Booking</Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:w-[600px] overflow-y-auto"
          >
            <div className="h-full pb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editing ? "Edit Booking" : "Booking Baru"}
              </h2>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* User Selection */}
                  <FormField
                    name="user_id"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pilih User</FormLabel>
                        <Select
                          value={field.value ? field.value.toString() : ""}
                          onValueChange={(value) => {
                            if (value && value !== "") {
                              field.onChange(parseInt(value, 10));
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users && users.length > 0 ? (
                              users.map((user) => (
                                <SelectItem
                                  key={user.id}
                                  value={user.id.toString()}
                                >
                                  {user.username}
                                  {user.profiles &&
                                    user.profiles[0]?.full_name &&
                                    ` - ${user.profiles[0].full_name}`}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                Memuat data user...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedUser && (
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="text-sm text-green-700">
                        <strong>User Dipilih:</strong> {selectedUser.username}
                      </p>
                      {selectedUser.profiles && selectedUser.profiles[0] && (
                        <>
                          {selectedUser.profiles[0].full_name && (
                            <p className="text-sm text-green-700">
                              <strong>Nama:</strong>{" "}
                              {selectedUser.profiles[0].full_name}
                            </p>
                          )}
                          {selectedUser.profiles[0].phone && (
                            <p className="text-sm text-green-700">
                              <strong>Telepon:</strong>{" "}
                              {selectedUser.profiles[0].phone}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Car Selection */}
                  <FormField
                    name="car_id"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pilih Mobil</FormLabel>
                        <Select
                          value={field.value ? field.value.toString() : ""}
                          onValueChange={(value) => {
                            if (value && value !== "") {
                              field.onChange(parseInt(value, 10));
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih mobil" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cars && cars.length > 0 ? (
                              cars.map((car) => (
                                <SelectItem
                                  key={car.id}
                                  value={car.id.toString()}
                                >
                                  {car.merk} {car.model} - {car.no_plat} (Rp{" "}
                                  {car.harga
                                    ? car.harga.toLocaleString("id-ID")
                                    : "0"}
                                  /hari)
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                Memuat data mobil...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedCar && (
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-700">
                        <strong>Mobil Dipilih:</strong> {selectedCar.merk}{" "}
                        {selectedCar.model}
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Tarif:</strong> Rp{" "}
                        {selectedCar.harga?.toLocaleString("id-ID")}/hari
                      </p>
                    </div>
                  )}

                  {/* Driver Selection */}
                  <FormField
                    name="driver_id"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pilih Driver</FormLabel>
                        <Select
                          value={field.value ? field.value.toString() : ""}
                          onValueChange={(value) => {
                            if (value && value !== "") {
                              field.onChange(parseInt(value, 10));
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih driver" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {drivers && drivers.length > 0 ? (
                              drivers.map((driver) => (
                                <SelectItem
                                  key={driver.id}
                                  value={driver.id.toString()}
                                >
                                  {driver.name} - {driver.nomor_sim}
                                  {driver.phone && ` (${driver.phone})`}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                Memuat data driver...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedDriver && (
                    <div className="p-3 bg-purple-50 rounded-md">
                      <p className="text-sm text-purple-700">
                        <strong>Driver Dipilih:</strong> {selectedDriver.name}
                      </p>
                      <p className="text-sm text-purple-700">
                        <strong>No. SIM:</strong> {selectedDriver.nomor_sim}
                      </p>
                      {selectedDriver.phone && (
                        <p className="text-sm text-purple-700">
                          <strong>Telepon:</strong> {selectedDriver.phone}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Date Fields */}
                  <FormField
                    name="tanggal_mulai"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Mulai</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="tanggal_selesai"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Selesai</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="durasi"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durasi (hari)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            readOnly
                            className="bg-gray-50"
                            placeholder="Otomatis terhitung"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="biaya"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Biaya (Rp)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            readOnly
                            className="bg-gray-50"
                            placeholder="Otomatis terhitung"
                          />
                        </FormControl>
                        <FormMessage />
                        {field.value > 0 && (
                          <p className="text-sm text-green-600">
                            Rp {field.value.toLocaleString("id-ID")}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Booking</FormLabel>
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
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Payment Section */}
                  <div className="border-t pt-4 mt-6">
                    <h3 className="text-md font-semibold mb-4 text-orange-700">
                      Informasi Pembayaran
                    </h3>

                    <FormField
                      name="jumlah_pembayaran"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah Pembayaran (Rp)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              placeholder="Masukkan jumlah pembayaran"
                            />
                          </FormControl>
                          <FormMessage />
                          {field.value > 0 && (
                            <p className="text-sm text-green-600">
                              Rp {field.value.toLocaleString("id-ID")}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="metode_pembayaran"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metode Pembayaran</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih metode pembayaran" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="transfer">
                                Transfer Bank
                              </SelectItem>
                              <SelectItem value="qris">QRIS</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="tanggal_pembayaran"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Pembayaran</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="status_pembayaran"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Pembayaran</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status pembayaran" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="belum_bayar">
                                Belum Bayar
                              </SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="sudah_bayar">
                                Sudah Bayar
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    {editing ? "Update Booking" : "Simpan Booking"}
                  </Button>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <BookingDataTable
        columns={columns({ onEdit, onRefresh: fetchBookings })}
        data={bookings}
      />
    </div>
  );
}
