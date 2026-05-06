// src/components/(admin)/Navbar-admin.tsx
"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IoHome } from "react-icons/io5";
import { FiList } from "react-icons/fi";
import { IoMdPricetag } from "react-icons/io";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { logout } from "@/service/auth.service";
import { RiCoupon3Line } from "react-icons/ri";
import { MdInventory } from "react-icons/md";

const NAV_ITEMS = [
  { href: "/admin/dashboard-admin", label: "Dashboard", icon: <IoHome className="text-xl flex-shrink-0" /> },
  { href: "/admin/product-management", label: "Manajemen Produk", icon: <IoMdPricetag className="text-xl flex-shrink-0" /> },
  { href: "/admin/orders-management", label: "Manajemen Pesanan", icon: <FiList className="text-xl flex-shrink-0" /> },
  { href: "/admin/inventory-monitoring", label: "Monitoring Stok", icon: <MdInventory className="text-xl flex-shrink-0" /> },
  { href: "/admin/coupon-management", label: "Manajemen Kupon", icon: <RiCoupon3Line className="text-xl flex-shrink-0" /> },
];

const NavbarAdmin = (): JSX.Element => {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } catch (err) {
      console.error(err);
      setLoggingOut(false);
    }
  };

  return (
    <div className="w-16 sm:w-60 bg-[#1a2035] min-h-screen flex flex-col p-3 sm:p-5 flex-shrink-0 shadow-xl">
      {/* Brand — desktop */}
      <div className="my-4 hidden sm:block">
        <p className="text-white font-bold text-base leading-tight">Rizky Elektronik</p>
        <span className="text-xs text-slate-400 font-normal mt-0.5 block">Admin Panel</span>
      </div>

      {/* Brand — mobile (icon only) */}
      <div className="my-4 flex justify-center sm:hidden">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">R</div>
      </div>

      <hr className="border-slate-600/50 mb-4" />

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          // Exact match untuk dashboard, startsWith untuk yang lain (ada sub-route)
          const isActive = item.href === "/admin/dashboard-admin" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}
            >
              <span className={isActive ? "text-slate-800" : "text-slate-400 group-hover:text-white"}>{item.icon}</span>
              <span className="hidden sm:block truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        title="Keluar"
        className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FontAwesomeIcon icon={faRightFromBracket} className={`text-lg flex-shrink-0 w-5 h-5 ${loggingOut ? "animate-pulse" : ""}`} />
        <span className="hidden sm:block">{loggingOut ? "Keluar..." : "Keluar"}</span>
      </button>
    </div>
  );
};

export default NavbarAdmin;
