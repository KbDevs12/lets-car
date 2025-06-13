import {
  getCarById,
  getAvailableDrivers,
  createBooking,
  checkCarAvailability,
} from "@/actions/car-actions";
import Image from "next/image";
import { notFound } from "next/navigation";
import BookingForm from "@/components/forms/booking-forms";

interface CarDetailPageProps {
  params: {
    id: string;
  };
  searchParams?: {
    start?: string;
    end?: string;
  };
}

export default async function CarBookingPage({
  params,
  searchParams,
}: CarDetailPageProps) {
  const car = await getCarById(Number(params.id));
  const drivers = await getAvailableDrivers();

  if (!car) return notFound();

  const start = searchParams?.start ? new Date(searchParams.start) : null;
  const end = searchParams?.end ? new Date(searchParams.end) : null;

  const dayMs = 1000 * 60 * 60 * 24;
  const diff =
    start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())
      ? Math.max(Math.ceil((end.getTime() - start.getTime()) / dayMs), 1)
      : 0;

  const totalHarga = diff * (car.harga || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Car Details Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Image
                src={car.foto_mobil || "/placeholder.jpg"}
                alt={`${car.merk} ${car.model}`}
                width={600}
                height={400}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {car.merk} {car.model}
                </h1>
                <p className="text-gray-600 mb-4">{car.deskripsi}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">No. Plat:</span>
                      <span className="font-medium">{car.no_plat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Warna:</span>
                      <span className="font-medium">{car.warna}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tahun:</span>
                      <span className="font-medium">{car.tahun}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Kapasitas:</span>
                      <span className="font-medium">{car.kapasitas} orang</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`font-medium ${
                          car.status === "tersedia"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {car.status === "tersedia"
                          ? "Tersedia"
                          : "Tidak Tersedia"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Harga/hari:</span>
                      <span className="font-bold text-blue-600">
                        Rp {car.harga?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            {diff > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Ringkasan Harga
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Harga per hari:</span>
                    <span>Rp {car.harga?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Durasi:</span>
                    <span>{diff} hari</span>
                  </div>
                  <div className="border-t border-blue-300 pt-2 flex justify-between font-bold text-blue-900">
                    <span>Total:</span>
                    <span>Rp {totalHarga.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Form Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Form Pemesanan
            </h2>
            <BookingForm
              car={car}
              drivers={drivers}
              initialStartDate={searchParams?.start}
              initialEndDate={searchParams?.end}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
