"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAvailableCars } from "@/actions/car-actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Grid3X3,
  List,
  Calendar,
  Users,
  Palette,
  ArrowRight,
  Car,
  Loader2,
} from "lucide-react";

interface Car {
  id: number;
  no_plat?: string;
  merk?: string;
  model?: string;
  tahun?: number;
  warna?: string;
  kapasitas?: number;
  harga?: number;
  status?: "tersedia" | "tidak_tersedia";
  foto_mobil?: string;
  deskripsi?: string;
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [filterBy, setFilterBy] = useState("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000000]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { data: session } = useSession();
  const router = useRouter();

  const handleCarClick = (carId: number) => {
    if (!session) {
      router.push("/login");
    } else {
      router.push(`/cars/${carId}`);
    }
  };

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const data: any = await getAvailableCars();
        setCars(data);
        setFilteredCars(data);

        // Set price range based on available cars
        if (data.length > 0) {
          const prices = data.map((car: Car) => car.harga).filter(Boolean);
          if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            setPriceRange([minPrice, maxPrice]);
          }
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  useEffect(() => {
    let filtered = cars.filter((car) => {
      const searchMatch = `${car.merk || ""} ${car.model || ""} ${
        car.warna || ""
      } ${car.tahun || ""} ${car.no_plat || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const priceMatch =
        !car.harga ||
        (car.harga >= priceRange[0] && car.harga <= priceRange[1]);

      const filterMatch =
        filterBy === "all" ||
        (filterBy === "luxury" && car.harga && car.harga > 500000) ||
        (filterBy === "economy" && car.harga && car.harga <= 500000) ||
        (filterBy === "available" && car.status === "tersedia") ||
        filterBy === car.merk?.toLowerCase();

      return searchMatch && priceMatch && filterMatch;
    });

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.harga || 0) - (b.harga || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.harga || 0) - (a.harga || 0));
        break;
      case "year-new":
        filtered.sort((a, b) => (b.tahun || 0) - (a.tahun || 0));
        break;
      case "year-old":
        filtered.sort((a, b) => (a.tahun || 0) - (b.tahun || 0));
        break;
      case "capacity":
        filtered.sort((a, b) => (b.kapasitas || 0) - (a.kapasitas || 0));
        break;
      case "merk":
        filtered.sort((a, b) => (a.merk || "").localeCompare(b.merk || ""));
        break;
      default:
        break;
    }

    setFilteredCars(filtered);
  }, [search, cars, sortBy, filterBy, priceRange]);

  const uniqueMerks = Array.from(
    new Set(cars.map((car) => car.merk).filter(Boolean))
  ) as string[];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Memuat data mobil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Daftar Mobil
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredCars.length} dari {cars.length} mobil tersedia
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center mt-4 md:mt-0 space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters & Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <Label htmlFor="search" className="text-sm font-medium">
                  Cari Mobil
                </Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Cari berdasarkan merk, model, warna, tahun, plat..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <Label className="text-sm font-medium">Urutkan</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Pilih urutan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="price-low">Harga Terendah</SelectItem>
                    <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                    <SelectItem value="year-new">Tahun Terbaru</SelectItem>
                    <SelectItem value="year-old">Tahun Terlama</SelectItem>
                    <SelectItem value="capacity">Kapasitas Terbesar</SelectItem>
                    <SelectItem value="merk">Merk A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter */}
              <div>
                <Label className="text-sm font-medium">Filter</Label>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Pilih filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="available">Tersedia</SelectItem>
                    <SelectItem value="luxury">Premium (&gt;500K)</SelectItem>
                    <SelectItem value="economy">Ekonomis (≤500K)</SelectItem>
                    {uniqueMerks.map((merk) => (
                      <SelectItem key={merk} value={merk?.toLowerCase()}>
                        {merk}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <Separator className="my-4" />
            <div>
              <Label className="text-sm font-medium">
                Rentang Harga: Rp {priceRange[0].toLocaleString()} - Rp{" "}
                {priceRange[1].toLocaleString()}
              </Label>
              <div className="mt-4">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={Math.max(
                    ...cars.map((car) => car.harga || 0).filter(Boolean)
                  )}
                  min={Math.min(
                    ...cars.map((car) => car.harga || 0).filter(Boolean)
                  )}
                  step={50000}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cars Display */}
        {filteredCars.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCars.map((car) => (
                <Card
                  key={car.id}
                  className="group hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={car.foto_mobil || "/placeholder-car.jpg"}
                      alt={`${car.merk} ${car.model}` || "Mobil"}
                      width={400}
                      height={250}
                      className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant={
                          car.status === "tersedia" ? "default" : "destructive"
                        }
                      >
                        {car.status === "tersedia"
                          ? "Tersedia"
                          : "Tidak Tersedia"}
                      </Badge>
                    </div>
                    {car.no_plat && (
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant="secondary"
                          className="bg-black/70 text-white"
                        >
                          {car.no_plat}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {car.merk} {car.model}
                    </h3>

                    <div className="space-y-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Tahun: {car.tahun || "-"}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Kapasitas: {car.kapasitas || "-"} orang
                      </div>
                      <div className="flex items-center">
                        <Palette className="w-4 h-4 mr-2" />
                        Warna: {car.warna || "-"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          Rp {car.harga?.toLocaleString() || "N/A"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /hari
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCarClick(car.id);
                      }}
                      className="w-full group"
                    >
                      Pesan Sekarang
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCars.map((car) => (
                <Card
                  key={car.id}
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-64 h-48 md:h-auto relative">
                      <Image
                        src={car.foto_mobil || "/placeholder-car.jpg"}
                        alt={`${car.merk} ${car.model}` || "Mobil"}
                        width={400}
                        height={250}
                        className="object-cover w-full h-full rounded-l-lg"
                      />
                      {car.no_plat && (
                        <div className="absolute top-3 left-3">
                          <Badge
                            variant="secondary"
                            className="bg-black/70 text-white"
                          >
                            {car.no_plat}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-xl font-semibold text-foreground mr-3">
                              {car.merk} {car.model}
                            </h3>
                            <Badge
                              variant={
                                car.status === "tersedia"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {car.status === "tersedia"
                                ? "Tersedia"
                                : "Tidak Tersedia"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                            <div>Tahun: {car.tahun || "-"}</div>
                            <div>Kapasitas: {car.kapasitas || "-"} orang</div>
                            <div>Warna: {car.warna || "-"}</div>
                          </div>

                          {car.deskripsi && (
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                              {car.deskripsi}
                            </p>
                          )}
                        </div>

                        <div className="md:ml-6 flex flex-col items-end">
                          <div className="text-right mb-4">
                            <span className="text-2xl font-bold text-green-600">
                              Rp {car.harga?.toLocaleString() || "N/A"}
                            </span>
                            <span className="text-sm text-muted-foreground block">
                              /hari
                            </span>
                          </div>

                          <Button
                            onClick={() => handleCarClick(car.id)}
                            className="group"
                          >
                            Pesan Sekarang
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-sm font-medium text-foreground mb-2">
                Tidak ada mobil ditemukan
              </h3>
              <p className="text-sm text-muted-foreground">
                Coba ubah kriteria pencarian atau filter Anda.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
