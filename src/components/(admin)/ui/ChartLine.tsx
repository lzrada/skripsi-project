// src/components/(admin)/ui/ChartLine.tsx
"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

export default function ChartLine() {
  const [monthlyOrders, setMonthlyOrders] = useState<number[]>(Array(12).fill(0));
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>(Array(12).fill(0));
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "orders"));
        const orders = snap.docs.map((d) => d.data());

        const ordersPerMonth = Array(12).fill(0);
        const revenuePerMonth = Array(12).fill(0);

        for (const order of orders) {
          if (!order.date) continue;
          const date = new Date(order.date);
          if (date.getFullYear() !== activeYear) continue;
          const month = date.getMonth(); // 0–11
          ordersPerMonth[month] += 1;
          // Hitung revenue hanya dari pesanan Selesai
          if (order.status === "Selesai") {
            revenuePerMonth[month] += order.total ?? 0;
          }
        }

        setMonthlyOrders(ordersPerMonth);
        setMonthlyRevenue(revenuePerMonth);
      } catch (err) {
        console.error("ChartLine fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeYear]);

  const totalOrders = monthlyOrders.reduce((a, b) => a + b, 0);
  const totalRevenue = monthlyRevenue.reduce((a, b) => a + b, 0);

  const formatRevenue = (val: number) => (val >= 1_000_000 ? `Rp ${(val / 1_000_000).toFixed(1)}jt` : `Rp ${(val / 1_000).toFixed(0)}rb`);

  const chartData = {
    labels: MONTH_LABELS,
    datasets: [
      {
        label: "Pesanan",
        data: monthlyOrders,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.08)",
        tension: 0.4,
        borderWidth: 3,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#3b82f6",
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#3b82f6",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "#1f2937",
        titleColor: "#fff",
        bodyColor: "#d1d5db",
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (ctx: any) => `${MONTH_LABELS[ctx[0].dataIndex]} ${activeYear}`,
          label: (ctx: any) => [`Pesanan: ${ctx.parsed.y}`, `Pendapatan: ${formatRevenue(monthlyRevenue[ctx.dataIndex])}`],
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#9ca3af", font: { size: 11 } },
      },
      y: {
        min: 0,
        ticks: {
          stepSize: 1,
          color: "#9ca3af",
          font: { size: 11 },
          callback: (v: number) => (Number.isInteger(v) ? v : ""),
        },
        grid: { color: "#f3f4f6" },
        border: { display: false },
      },
    },
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full p-6 bg-white rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div className="flex gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{loading ? "..." : totalOrders}</h2>
            <p className="text-sm text-gray-500">Total Pesanan {activeYear}</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{loading ? "..." : formatRevenue(totalRevenue)}</h2>
            <p className="text-sm text-gray-500">Pendapatan {activeYear}</p>
          </div>
        </div>

        {/* Pilih tahun */}
        <div className="relative">
          <select
            value={activeYear}
            onChange={(e) => setActiveYear(Number(e.target.value))}
            className="appearance-none text-sm text-gray-700 font-medium border border-gray-200 rounded-lg px-4 py-2 pr-8 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
        <span className="text-sm text-gray-600">Jumlah Pesanan per Bulan</span>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">Memuat data chart...</div>
      ) : (
        <div className="relative" style={{ height: "300px" }}>
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
