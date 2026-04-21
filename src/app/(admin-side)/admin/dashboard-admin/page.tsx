"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/config/firebase";
import { IoCartOutline } from "react-icons/io5";
import { FaAngleUp, FaBoxOpen, FaUsers } from "react-icons/fa";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import ChartLine from "@/components/(admin)/ui/ChartLine";
import { ChartOrange, ChartGreen, ChartBlue } from "@/components/(admin)/svg/Chart";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
}

export default function Dashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersSnap, productsSnap, usersSnap] = await Promise.all([getDocs(collection(db, "orders")), getDocs(collection(db, "products")), getDocs(query(collection(db, "users")))]);

        const orders = ordersSnap.docs.map((d) => d.data());
        const revenue = orders.filter((o) => o.status === "Selesai").reduce((acc, o) => acc + (o.total ?? 0), 0);
        const pending = orders.filter((o) => o.status === "Menunggu Konfirmasi").length;

        setTotalOrders(ordersSnap.size);
        setTotalRevenue(revenue);
        setPendingOrders(pending);
        setTotalProducts(productsSnap.size);
        setTotalUsers(usersSnap.size);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Pendapatan",
      value: loading ? "..." : formatPrice(totalRevenue),
      sub: "Dari pesanan selesai",
      icon: <span className="font-semibold text-blue-500">Rp</span>,
      bg: "bg-[#ECF2FF]",
      up: true,
    },
    {
      label: "Total Pesanan",
      value: loading ? "..." : totalOrders.toLocaleString("id-ID"),
      sub: `${pendingOrders} menunggu konfirmasi`,
      icon: <IoCartOutline className="text-blue-500" />,
      bg: "bg-[#ECF2FF]",
      up: true,
    },
    {
      label: "Total Produk",
      value: loading ? "..." : totalProducts.toLocaleString("id-ID"),
      sub: "Produk terdaftar",
      icon: <FaBoxOpen className="text-orange-500" />,
      bg: "bg-orange-100",
      up: true,
    },
    {
      label: "Total Pengguna",
      value: loading ? "..." : totalUsers.toLocaleString("id-ID"),
      sub: "Akun terdaftar",
      icon: <FaUsers className="text-green-500" />,
      bg: "bg-green-100",
      up: true,
    },
  ];

  return (
    <div className="flex flex-col p-7">
      <h1 className="font-bold text-2xl mb-1">Dashboard Admin</h1>
      <p className="text-sm text-gray-500 mb-5">Selamat datang kembali, berikut ringkasan toko hari ini.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="px-5 py-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
                <p className="font-bold text-xl text-gray-800 truncate">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{s.sub}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0 ml-3`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + sidebar */}
      <div className="flex gap-5 justify-between">
        <div className="w-3/4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <ChartLine />
        </div>
        <div className="flex gap-5 p-6 flex-col w-1/4 rounded-2xl bg-white shadow-sm border border-gray-100">
          <p className="font-bold text-gray-800">Ringkasan Bulan Ini</p>
          <div>
            <p className="font-bold text-2xl text-gray-800">{loading ? "..." : totalOrders}</p>
            <p className="text-sm text-gray-500">Total Pesanan</p>
          </div>
          <div>
            <p className="font-bold text-xl text-gray-800">{loading ? "..." : formatPrice(totalRevenue)}</p>
            <p className="text-sm text-gray-500">Total Pendapatan</p>
          </div>
          <div className="w-full h-px bg-gray-100" />
          <div>
            <p className="font-bold text-xl text-gray-800">{loading ? "..." : pendingOrders}</p>
            <p className="text-sm text-gray-500">Menunggu Konfirmasi</p>
          </div>
          <div>
            <p className="font-bold text-xl text-gray-800">{loading ? "..." : totalProducts}</p>
            <p className="text-sm text-gray-500">Produk Aktif</p>
          </div>
        </div>
      </div>
    </div>
  );
}
