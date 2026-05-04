// src/components/(admin)/Navbar-admin.tsx
"use client";

import { JSX } from "react";
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

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-16 sm:w-60 bg-gray-800 min-h-screen flex flex-col p-3 sm:p-5 flex-shrink-0">
      {/* Logo / Brand */}
      <div className="my-4 text-white font-bold text-base sm:text-lg leading-tight hidden sm:block">
        Rizky Elektronik
        <span className="block text-xs text-gray-400 font-normal mt-0.5">Admin Panel</span>
      </div>
      {/* Icon only saat mobile */}
      <div className="my-4 flex justify-center sm:hidden">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">R</div>
      </div>

      <hr className="border-gray-600 mb-5" />

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? "bg-white text-gray-900" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
            >
              {item.icon}
              <span className="hidden sm:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout} className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200 mt-2">
        <FontAwesomeIcon icon={faRightFromBracket} className="text-lg flex-shrink-0 w-5 h-5" />
        <span className="hidden sm:block">Keluar</span>
      </button>
    </div>
  );
};

export default NavbarAdmin;
