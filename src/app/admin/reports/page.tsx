"use client";

import { useEffect, useState } from "react";
import { columns } from "@/components/reports/columns";
import { Report } from "@/types/report";
import { getAllReports } from "./action";
import { ReportDataTable } from "@/components/reports/data-table";
import { toast } from "sonner";

export default function ReportsPage() {
  const [data, setData] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const result = await getAllReports();

      if (!result || result.length === 0) {
        setData([]);
      } else {
        setData(result);
      }
    } catch (error: any) {
      console.error("Gagal memuat laporan:", error);
      toast.error("Terjadi kesalahan saat memuat laporan.");
      setError("Gagal memuat laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Laporan Pembayaran</h1>

      {loading ? (
        <p className="text-muted-foreground">Memuat laporan...</p>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <ReportDataTable columns={columns} data={data} />
      )}
    </div>
  );
}
