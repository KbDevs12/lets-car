export type Report = {
  id: number;
  payment_id: number;
  user_id: number;
  laporan: string | null;
  tanggal_laporan: string;
  user: {
    username: string;
  };
  payment: {
    jumlah_pembayaran: number | null;
    metode_pembayaran: "cash" | "transfer" | "qris" | null;
    status_pembayaran: "belum_bayar" | "sudah_bayar" | "pending" | null;
  };
};
