// components/ui/Loading.tsx
"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-20 h-20 border-4 border-gray-300 border-t-blue-600 rounded-full mb-6"
      />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-semibold"
      >
        Memuat Mobil...
      </motion.p>
    </div>
  );
}
