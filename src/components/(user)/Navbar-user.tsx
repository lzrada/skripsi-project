"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faMagnifyingGlass, faCartShopping, faUser, faBell, faHeart } from "@fortawesome/free-solid-svg-icons";

export default function NavbarUser() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const categories = ["Televisi", "Kulkas", "Mesin Cuci", "AC", "Kipas Angin", "Laptop", "HP", "Audio"];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-[#1E2753] text-white text-xs py-1.5 px-6 flex justify-between items-center">
        <span>Gratis ongkir untuk wilayah Blitar dan sekitarnya!</span>
        <div className="flex gap-4">
          <Link href="/login" className="hover:text-yellow-300 transition-colors">
            Masuk
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/register" className="hover:text-yellow-300 transition-colors">
            Daftar
          </Link>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/user/dashboard-user" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-9 h-9 bg-[#1E2753] rounded-lg flex items-center justify-center">
                <span className="text-yellow-400 text-lg font-bold">R</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-[#1E2753] font-bold text-base leading-tight">Rizky</p>
                <p className="text-[#E85D04] text-xs font-semibold leading-tight tracking-wide">ELEKTRONIK</p>
              </div>
            </Link>

            {/* Search bar */}
            <div className="flex-1 max-w-xl">
              <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-colors duration-200 ${searchFocused ? "border-[#1E2753]" : "border-gray-200"} bg-gray-50`}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-3 text-gray-400 w-4 h-4 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Cari produk elektronik..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full py-2.5 px-3 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                />
                <button className="bg-[#1E2753] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#2a3470] transition-colors flex-shrink-0">Cari</button>
              </div>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <button className="hidden md:flex px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-[#1E2753] transition-colors">
                <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
              </button>
              <button className="hidden md:flex px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-red-500 transition-colors">
                <FontAwesomeIcon icon={faHeart} className="w-5 h-5" />
              </button>
              <Link href="/user/cart" className="relative flex px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-[#1E2753] transition-colors">
                <FontAwesomeIcon icon={faCartShopping} className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#E85D04] text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
              </Link>
              <Link href="/user/profile" className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-[#1E2753] transition-colors">
                <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                <span className="text-sm font-medium">Akun</span>
              </Link>
              <button className="md:hidden flex px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
                <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category nav — desktop */}
        <div className="hidden md:block border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center overflow-x-auto">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/user/product-detail/${cat.toLowerCase().replace(" ", "-")}`}
                  className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 hover:text-[#1E2753] hover:border-b-2 hover:border-[#1E2753] font-medium transition-all duration-150"
                >
                  {cat}
                </Link>
              ))}
              <Link href="#" className="whitespace-nowrap px-4 py-3 text-sm text-[#E85D04] font-semibold hover:underline">
                Lihat Semua
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {categories.map((cat) => (
              <Link key={cat} href={`/user/product-detail/${cat.toLowerCase()}`} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg hover:text-[#1E2753] font-medium" onClick={() => setMenuOpen(false)}>
                {cat}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
