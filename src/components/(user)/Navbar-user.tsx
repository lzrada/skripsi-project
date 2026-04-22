"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars, faXmark, faMagnifyingGlass, faCartShopping,
  faUser, faRightFromBracket, faBoxOpen, faGear, faChevronDown, faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { FiHeart } from "react-icons/fi";
import { logout } from "@/service/auth.service";
import { subscribeToCartService, CartItem } from "@/service/cart.service";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getWishlistIds } from "@/service/wishlist.service";

export default function NavbarUser() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userName, setUserName] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";

  const categories = [
    { name: "Televisi", slug: "Televisi" },
    { name: "Kulkas", slug: "Kulkas" },
    { name: "Mesin Cuci", slug: "Mesin Cuci" },
    { name: "AC", slug: "AC" },
    { name: "Kipas Angin", slug: "Kipas Angin" },
    { name: "Audio", slug: "Audio" },
  ];

  const getUid = () =>
    document.cookie.split("; ").find((r) => r.startsWith("uid="))?.split("=")[1] ?? null;

  // Cek login + nama user
  useEffect(() => {
    const token = document.cookie.split("; ").find((r) => r.startsWith("firebaseToken="))?.split("=")[1];
    setIsLoggedIn(!!token);
    if (token) {
      const uid = getUid();
      if (uid) {
        getCurrentUser(uid).then((user) => {
          if (user?.fullName) setUserName(user.fullName);
        });
        // Hitung wishlist dari localStorage
        setWishlistCount(getWishlistIds(uid).length);
      }
    }
  }, []);

  // Subscribe cart
  useEffect(() => {
    const uid = getUid();
    if (!uid) return;
    const unsub = subscribeToCartService(uid, (items) => setCartItems(items));
    return () => unsub();
  }, []);

  // Sync wishlist count tiap halaman aktif (simpel: listen storage event)
  useEffect(() => {
    const syncWishlist = () => {
      const uid = getUid();
      if (uid) setWishlistCount(getWishlistIds(uid).length);
    };
    window.addEventListener("storage", syncWishlist);
    return () => window.removeEventListener("storage", syncWishlist);
  }, []);

  // Tutup dropdown klik luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.replace("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/user/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setMenuOpen(false);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar — hanya tampil kalau belum login */}
      {!isLoggedIn && (
        <div className="bg-[#1E2753] text-white text-xs py-1.5 px-6 flex justify-between items-center">
          <span>Gratis ongkir untuk wilayah Blitar dan sekitarnya!</span>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="hover:text-yellow-300 transition-colors">Masuk</Link>
            <span className="text-gray-400">|</span>
            <Link href="/register" className="hover:text-yellow-300 transition-colors">Daftar</Link>
          </div>
        </div>
      )}

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
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-colors duration-200 ${searchFocused ? "border-[#1E2753]" : "border-gray-200"} bg-gray-50`}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-3 text-gray-400 w-4 h-4 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk elektronik..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full py-2.5 px-3 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                />
                <button type="submit" className="bg-[#1E2753] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#2a3470] transition-colors flex-shrink-0">
                  Cari
                </button>
              </div>
            </form>

            {/* Right icons */}
            <div className="flex items-center gap-1">

              {/* ─── Wishlist ─── */}
              <Link href="/user/wishlist" className="relative flex px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-red-500 transition-colors" title="Wishlist">
                <FiHeart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* ─── Cart ─── */}
              <Link href="/user/cart" className="relative flex px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-[#1E2753] transition-colors" title="Keranjang">
                <FontAwesomeIcon icon={faCartShopping} className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#E85D04] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* ─── Akun dropdown ─── */}
              {isLoggedIn ? (
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-[#1E2753] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#1E2753] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {userName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium max-w-[80px] truncate">{userName || "Akun"}</span>
                    <FontAwesomeIcon icon={faChevronDown} className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Login sebagai</p>
                        <p className="text-sm font-semibold text-gray-700 truncate">{userName || "User"}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/user/account" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-400" />
                          Profil Saya
                        </Link>
                        <Link href="/user/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <FontAwesomeIcon icon={faBoxOpen} className="w-4 h-4 text-gray-400" />
                          Pesanan Saya
                        </Link>
                        {/* ── Wishlist di dropdown ── */}
                        <Link href="/user/wishlist" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <FontAwesomeIcon icon={faHeart} className="w-4 h-4 text-red-400" />
                          Wishlist Saya
                          {wishlistCount > 0 && (
                            <span className="ml-auto text-xs bg-red-100 text-red-500 font-bold px-1.5 py-0.5 rounded-full">{wishlistCount}</span>
                          )}
                        </Link>
                        <Link href="/user/account" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <FontAwesomeIcon icon={faGear} className="w-4 h-4 text-gray-400" />
                          Pengaturan
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                          Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-[#1E2753] transition-colors">
                  <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                  <span className="text-sm font-medium">Masuk</span>
                </Link>
              )}

              {/* Hamburger mobile */}
              <button
                className="md:hidden flex px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category nav desktop */}
        <div className="hidden md:block border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center overflow-x-auto">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/user/products?category=${encodeURIComponent(cat.slug)}`}
                  className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-all duration-150 border-b-2 ${
                    selectedCategory === cat.slug
                      ? "text-[#E85D04] border-[#E85D04]"
                      : "text-gray-600 border-transparent hover:text-[#1E2753] hover:border-[#1E2753]"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/user/products"
                className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-[#E85D04] border-b-2 border-transparent hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {/* Search mobile */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk..."
                className="flex-1 border-2 border-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E2753]"
              />
              <button type="submit" className="px-3 py-2 bg-[#1E2753] text-white rounded-xl text-sm font-medium">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
              </button>
            </form>

            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/user/products?category=${encodeURIComponent(cat.slug)}`}
                className={`block px-3 py-2.5 text-sm rounded-lg font-medium transition-all ${
                  selectedCategory === cat.slug ? "bg-orange-50 text-[#E85D04]" : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/user/products" className="block px-3 py-2.5 text-sm rounded-lg font-semibold text-[#E85D04] hover:bg-orange-50" onClick={() => setMenuOpen(false)}>
              Lihat Semua
            </Link>

            <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
              {isLoggedIn ? (
                <>
                  <div className="px-3 py-2 text-xs text-gray-400">
                    Login sebagai <span className="font-semibold text-gray-600">{userName || "User"}</span>
                  </div>
                  <Link href="/user/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                    <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-400" />
                    Profil Saya
                  </Link>
                  <Link href="/user/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                    <FontAwesomeIcon icon={faBoxOpen} className="w-4 h-4 text-gray-400" />
                    Pesanan Saya
                  </Link>
                  {/* ── Wishlist mobile ── */}
                  <Link href="/user/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-red-50 rounded-lg font-medium">
                    <FontAwesomeIcon icon={faHeart} className="w-4 h-4 text-red-400" />
                    Wishlist Saya
                    {wishlistCount > 0 && (
                      <span className="ml-auto text-xs bg-red-100 text-red-500 font-bold px-1.5 py-0.5 rounded-full">{wishlistCount}</span>
                    )}
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg font-medium">
                    <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                    Keluar
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-400" />
                  Masuk
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
