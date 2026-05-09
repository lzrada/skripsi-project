"use client";

import { useEffect, useState } from "react";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiX, FiInfo } from "react-icons/fi";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// ─── Global event emitter (tanpa library) ───────────────────────────────────
type ToastListener = (toast: ToastItem) => void;
const listeners: ToastListener[] = [];

export const toast = {
  success: (message: string, duration = 3000) => emit({ message, type: "success", duration }),
  error:   (message: string, duration = 4000) => emit({ message, type: "error",   duration }),
  warning: (message: string, duration = 3500) => emit({ message, type: "warning", duration }),
  info:    (message: string, duration = 3000) => emit({ message, type: "info",    duration }),
};

function emit(opts: Omit<ToastItem, "id">) {
  const item: ToastItem = { ...opts, id: `${Date.now()}-${Math.random()}` };
  listeners.forEach((fn) => fn(item));
}

export function useToastListener(onToast: ToastListener) {
  useEffect(() => {
    listeners.push(onToast);
    return () => {
      const idx = listeners.indexOf(onToast);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, [onToast]);
}

// ─── Config visual per tipe ──────────────────────────────────────────────────
const config: Record<ToastType, { icon: React.ReactNode; bar: string; bg: string; border: string; text: string }> = {
  success: {
    icon:   <FiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    bar:    "bg-emerald-500",
    bg:     "bg-white",
    border: "border-emerald-100",
    text:   "text-gray-800",
  },
  error: {
    icon:   <FiXCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
    bar:    "bg-red-500",
    bg:     "bg-white",
    border: "border-red-100",
    text:   "text-gray-800",
  },
  warning: {
    icon:   <FiAlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    bar:    "bg-amber-400",
    bg:     "bg-white",
    border: "border-amber-100",
    text:   "text-gray-800",
  },
  info: {
    icon:   <FiInfo className="w-5 h-5 text-blue-500 flex-shrink-0" />,
    bar:    "bg-blue-500",
    bg:     "bg-white",
    border: "border-blue-100",
    text:   "text-gray-800",
  },
};

// ─── Single Toast ────────────────────────────────────────────────────────────
function ToastCard({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const c = config[item.type];

  useEffect(() => {
    // mount animation
    const t1 = setTimeout(() => setVisible(true), 10);
    // auto-dismiss
    const t2 = setTimeout(() => dismiss(), item.duration ?? 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(item.id), 300);
  };

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg border ${c.bg} ${c.border} min-w-[280px] max-w-[360px] overflow-hidden transition-all duration-300 ${
        visible && !leaving ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      }`}
    >
      {/* progress bar */}
      <span
        className={`absolute bottom-0 left-0 h-0.5 ${c.bar} transition-all`}
        style={{
          animation: `shrink ${item.duration ?? 3000}ms linear forwards`,
        }}
      />
      {c.icon}
      <p className={`text-sm font-medium flex-1 ${c.text}`}>{item.message}</p>
      <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 transition-colors mt-0.5">
        <FiX className="w-4 h-4" />
      </button>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// ─── Toast Container (taruh di layout.tsx) ───────────────────────────────────
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useToastListener((item) => setToasts((prev) => [...prev, item]));

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard item={t} onRemove={remove} />
        </div>
      ))}
    </div>
  );
}
