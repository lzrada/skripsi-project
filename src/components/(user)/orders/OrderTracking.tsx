"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { type OrderStatus, statusConfig, statusSteps } from "@/types/order";

interface OrderTrackingProps {
  status: OrderStatus;
}

export default function OrderTracking({ status }: OrderTrackingProps) {
  if (status === "Dibatalkan") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <FontAwesomeIcon icon={faCircleXmark} className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-red-600">Pesanan Dibatalkan</p>
          <p className="text-xs text-red-400">Pesanan ini telah dibatalkan</p>
        </div>
      </div>
    );
  }

  const currentIndex = statusSteps.indexOf(status);

  return (
    <div className="relative flex items-start justify-between">
      {statusSteps.map((step, i) => {
        const isDone = i <= currentIndex;
        const isActive = i === currentIndex;
        const cfg = statusConfig[step];

        return (
          <div key={step} className="flex flex-col items-center flex-1 relative">
            {/* Garis penghubung */}
            {i < statusSteps.length - 1 && <div className={`absolute top-4 left-1/2 w-full h-0.5 ${i < currentIndex ? "bg-[#1E2753]" : "bg-gray-200"}`} />}

            {/* Lingkaran step */}
            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isDone ? "bg-[#1E2753] border-[#1E2753]" : "bg-white border-gray-200"} ${isActive ? "ring-4 ring-[#1E2753]/20" : ""}`}
            >
              <FontAwesomeIcon icon={cfg.icon} className={`w-3.5 h-3.5 ${isDone ? "text-white" : "text-gray-300"}`} />
            </div>

            {/* Label */}
            <p className={`mt-2 text-[10px] font-semibold text-center leading-tight px-1 ${isDone ? "text-[#1E2753]" : "text-gray-300"}`}>{step}</p>
          </div>
        );
      })}
    </div>
  );
}
