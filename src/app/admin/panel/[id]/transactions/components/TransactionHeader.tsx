"use client";

import { useRouter } from "next/navigation";
import { CreditCard, ChevronLeft } from "lucide-react";

export default function TransactionHeader() {
  const router = useRouter();

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0">
      <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-gray-600 hover:text-primary transition-all duration-200 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <CreditCard className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold text-text-primary">
            Transactions
          </h1>
        </div>
      </div>
    </header>
  );
}
