"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Phone,
  Mail,
  MapPin,
  Car,
  Shield,
  Clock,
  Award,
  Heart,
  Eye,
  Palette,
  ArrowRight,
} from "lucide-react";
import { getCars } from "@/actions/car-actions";

// Type definitions based on Prisma schema
type CarStatus = "tersedia" | "tidak_tersedia";

interface Car {
  id: number;
  no_plat: string | null;
  merk: string | null;
  model: string | null;
  tahun: number | null;
  warna: string | null;
  kapasitas: number | null;
  harga: number | null;
  status: CarStatus | null;
  foto_mobil: string | null;
  deskripsi: string | null;
}

const CarRentalLanding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState(new Set<number>());
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  // Fetch cars data from database
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const carsData = await getCars();
        setCars(carsData);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Carousel images
  const carouselImages = [
    {
      url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=600&fit=crop",
      title: "Rental Mobil Terpercaya",
      subtitle:
        "Dapatkan pengalaman berkendara terbaik dengan armada mobil terlengkap",
    },
    {
      url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=600&fit=crop",
      title: "Harga Terjangkau",
      subtitle: "Nikmati tarif kompetitif dengan pelayanan premium",
    },
    {
      url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&h=600&fit=crop",
      title: "Driver Berpengalaman",
      subtitle: "Sopir profesional siap mengantar perjalanan Anda",
    },
  ];

  const features = [
    {
      icon: <Car className="w-8 h-8 text-blue-600" />,
      title: "Armada Lengkap",
      description: "Berbagai jenis mobil dari ekonomi hingga premium",
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Asuransi Lengkap",
      description: "Perlindungan menyeluruh untuk keamanan perjalanan",
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-600" />,
      title: "24/7 Support",
      description: "Layanan pelanggan siap membantu kapan saja",
    },
    {
      icon: <Award className="w-8 h-8 text-purple-600" />,
      title: "Terpercaya",
      description: "Ribuan pelanggan puas dengan layanan kami",
    },
  ];

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselImages.length) % carouselImages.length
    );
  };

  const handleCarClick = (carId: number) => {
    if (!session) {
      router.push("/login");
    } else {
      router.push(`/cars/${carId}`);
    }
  };

  const toggleFavorite = (carId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(carId)) {
        newFavorites.delete(carId);
      } else {
        newFavorites.add(carId);
      }
      return newFavorites;
    });
  };

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getColorBadge = (color: string) => {
    const colorMap: Record<string, string> = {
      Putih: "bg-gray-100 text-gray-800",
      Hitam: "bg-gray-800 text-white",
      Silver: "bg-gray-300 text-gray-800",
      Merah: "bg-red-100 text-red-800",
      Biru: "bg-blue-100 text-blue-800",
      "Abu-abu": "bg-gray-200 text-gray-800",
      Kuning: "bg-yellow-200 text-yellow-800",
    };
    return colorMap[color] || "bg-gray-100 text-gray-800";
  };

  const getDefaultCarImage = () => {
    return "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&h=300&fit=crop";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel Section */}
      <section id="home" className="relative h-[70vh] overflow-hidden">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
              index === currentSlide
                ? "translate-x-0"
                : index < currentSlide
                ? "-translate-x-full"
                : "translate-x-full"
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center relative"
              style={{ backgroundImage: `url(${image.url})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fade-in">
                    {image.title}
                  </h1>
                  <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl">
                    {image.subtitle}
                  </p>
                  <div className="space-x-4">
                    <button
                      onClick={() =>
                        document
                          .getElementById("cars")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="bg-blue-600 text-white px-6 md:px-8 py-3 rounded-lg text-base md:text-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all"
                    >
                      Lihat Mobil
                    </button>
                    <button
                      onClick={() =>
                        document
                          .getElementById("contact")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="border-2 border-white text-white px-6 md:px-8 py-3 rounded-lg text-base md:text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all"
                    >
                      Hubungi Kami
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mengapa Pilih Kami?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Kami berkomitmen memberikan pelayanan terbaik dengan standar
              kualitas tinggi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cars Section */}
      <section id="cars" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pilihan Mobil Kami
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Dari mobil ekonomis hingga premium, temukan kendaraan yang sesuai
              kebutuhan Anda
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cars.map((car) => (
                <div
                  key={car.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
                  onClick={() => handleCarClick(car.id)}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={car.foto_mobil || getDefaultCarImage()}
                      alt={`${car.merk} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getDefaultCarImage();
                      }}
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                          car.status === "tersedia"
                            ? "bg-green-500/90 text-white"
                            : "bg-red-500/90 text-white"
                        }`}
                      >
                        {car.status === "tersedia"
                          ? "Tersedia"
                          : "Tidak Tersedia"}
                      </span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(car.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-sm"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favorites.has(car.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600"
                        }`}
                      />
                    </button>

                    {/* View Details Button */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCarClick(car.id);
                        }}
                        className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white transition-all"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Detail</span>
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Header */}
                    <div className="mb-3">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {car.merk} {car.model}
                        </h3>
                        {car.tahun && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {car.tahun}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {car.deskripsi && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {car.deskripsi}
                        </p>
                      )}
                    </div>

                    {/* Car Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {car.kapasitas && (
                        <div className="flex items-center space-x-2 text-xs">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {car.kapasitas} kursi
                          </span>
                        </div>
                      )}
                      {car.warna && (
                        <div className="flex items-center space-x-2 text-xs">
                          <Palette className="w-4 h-4 text-gray-400" />
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${getColorBadge(
                              car.warna
                            )}`}
                          >
                            {car.warna}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {car.harga ? (
                          <>
                            <span className="text-xl font-bold text-blue-600">
                              {formatCurrency(car.harga)}
                            </span>
                            <span className="text-xs text-gray-500">/hari</span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Hubungi untuk harga
                          </span>
                        )}
                      </div>

                      <button
                        className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCarClick(car.id);
                        }}
                        disabled={car.status !== "tersedia"}
                      >
                        <span>
                          {!session
                            ? "Login"
                            : car.status === "tersedia"
                            ? "Pesan"
                            : "Tidak Tersedia"}
                        </span>
                        {car.status === "tersedia" && (
                          <ArrowRight className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* License Plate */}
                    {car.no_plat && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500 font-mono">
                          {car.no_plat}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && cars.length === 0 && (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Mobil Tersedia
              </h3>
              <p className="text-gray-600">
                Mobil akan segera ditambahkan. Silakan cek kembali nanti.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {cars.length}+
              </div>
              <div className="text-blue-100 text-sm md:text-base">
                Mobil Tersedia
              </div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-3xl md:text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100 text-sm md:text-base">
                Pelanggan Puas
              </div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-3xl md:text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100 text-sm md:text-base">
                Driver Profesional
              </div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100 text-sm md:text-base">
                Customer Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hubungi Kami
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Siap membantu Anda 24/7. Hubungi kami untuk reservasi atau
              pertanyaan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 md:p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
              <Phone className="w-10 md:w-12 h-10 md:h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Telepon</h3>
              <p className="text-gray-600">+62 812-3456-7890</p>
            </div>
            <div className="bg-gray-50 p-6 md:p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
              <Mail className="w-10 md:w-12 h-10 md:h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Email</h3>
              <p className="text-gray-600">info@letscar.com</p>
            </div>
            <div className="bg-gray-50 p-6 md:p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
              <MapPin className="w-10 md:w-12 h-10 md:h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Alamat</h3>
              <p className="text-gray-600">Jl. Sudirman No. 123, Jakarta</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarRentalLanding;
