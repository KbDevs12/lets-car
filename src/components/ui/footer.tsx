import { Car } from "lucide-react";
export default function Footer() {
  return (
    <>
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Car className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold">LetsCar</span>
              </div>
              <p className="text-gray-400 mb-4">
                Penyedia layanan rental mobil terpercaya dengan armada lengkap
                dan pelayanan terbaik.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Layanan</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Rental Harian</li>
                <li>Rental Mingguan</li>
                <li>Rental Bulanan</li>
                <li>Dengan Driver</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>FAQ</li>
                <li>Customer Service</li>
                <li>Panduan Booking</li>
                <li>Syarat & Ketentuan</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Kontak</h3>
              <ul className="space-y-2 text-gray-400">
                <li>+62 812-3456-7890</li>
                <li>info@letscar.com</li>
                <li>Jl. Sudirman No. 123</li>
                <li>Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 LetsCar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
