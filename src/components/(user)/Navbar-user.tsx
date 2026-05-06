"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faMagnifyingGlass, faCartShopping, faUser, faRightFromBracket, faBoxOpen, faGear, faChevronDown, faHeart, faBolt } from "@fortawesome/free-solid-svg-icons";
import { FiHeart } from "react-icons/fi";
import { logout } from "@/service/auth.service";
import { subscribeToCartService, CartItem } from "@/service/cart.service";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getWishlistIds } from "@/service/wishlist.service";

// ─── Konstanta ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Televisi", slug: "Televisi" },
  { name: "Kulkas", slug: "Kulkas" },
  { name: "Mesin Cuci", slug: "Mesin Cuci" },
  { name: "AC", slug: "AC" },
  { name: "Kipas Angin", slug: "Kipas Angin" },
  { name: "Audio", slug: "Audio" },
];

// ─── Helper ──────────────────────────────────────────────────────────────────

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith(`${name}=`))
      ?.split("=")[1] ?? null
  );
}

// Badge angka untuk cart/wishlist
function CountBadge({ count, color = "bg-[#E85D04]" }: { count: number; color?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 ${color}
        text-white text-[10px] font-bold rounded-full flex items-center justify-center
        animate-bounceIn`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ─── Search Bar (pakai useSearchParams di dalam Suspense) ────────────────────

function SearchBarInner() {
  const { useSearchParams } = require("next/navigation");
  const searchParams = useSearchParams();
  return searchParams.get("search") ?? "";
}

export default function NavbarUser() {
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSelectedCategory(params.get("category") ?? "");
    }
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Tutup menu & dropdown saat navigasi ───────────────────────────────
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // ── Auth + data user ──────────────────────────────────────────────────
  useEffect(() => {
    const token = getCookieValue("firebaseToken");
    const uid = getCookieValue("uid");
    setIsLoggedIn(!!token);

    if (token && uid) {
      getCurrentUser(uid).then((user) => {
        if (user?.fullName) setUserName(user.fullName);
      });
      // Hitung wishlist awal
      setWishlistCount(getWishlistIds(uid).length);
    }
  }, []);

  // ── Subscribe cart realtime ──────────────────────────────────────────
  useEffect(() => {
    const uid = getCookieValue("uid");
    if (!uid) return;
    const unsub = subscribeToCartService(uid, setCartItems);
    return () => unsub();
  }, []);

  // ── Sync wishlist (localStorage events) ───────────────────────────────
  useEffect(() => {
    const sync = () => {
      const uid = getCookieValue("uid");
      if (uid) setWishlistCount(getWishlistIds(uid).length);
    };
    sync();
    window.addEventListener("wishlistUpdated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("wishlistUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.replace("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/user/products?search=${encodeURIComponent(q)}`);
    setMenuOpen(false);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const initials = userName?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      {/* Overlay backdrop untuk mobile menu */}
      {menuOpen && <div className="fixed inset-0 bg-black/30 z-[9998] md:hidden" onClick={() => setMenuOpen(false)} />}

      <header id="navbar-user" className={`fixed top-0 left-0 w-full z-[9999] bg-white transition-shadow duration-300 ${scrolled ? "shadow-[0_2px_20px_rgba(30,39,83,0.12)]" : ""}`}>
        {/* ── Top bar promo (hanya saat belum login) ── */}
        {!isLoggedIn && (
          <div className="bg-[#1E2753] text-white text-xs py-1.5 px-4 flex justify-between items-center">
            <span className="hidden sm:inline">🚚 Gratis ongkir untuk wilayah Blitar dan sekitarnya!</span>
            <span className="sm:hidden">🚚 Gratis ongkir wilayah Blitar</span>
            <div className="flex gap-4 items-center">
              <Link href="/login" className="hover:text-yellow-300 transition-colors">
                Masuk
              </Link>
              <span className="text-white/30">|</span>
              <Link href="/register" className="hover:text-yellow-300 transition-colors">
                Daftar
              </Link>
            </div>
          </div>
        )}

        {/* ── Main navbar ── */}
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 h-16">
              {/* Logo */}
              <Link href="/user/dashboard-user" className="flex-shrink-0 flex items-center gap-2 group">
                <div
                  className="w-9 h-9 bg-[#1E2753] rounded-xl flex items-center justify-center
                  group-hover:bg-[#2d3a8c] transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faBolt} className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="hidden sm:block leading-none">
                  <p className="text-[#1E2753] font-black text-base">Rizky</p>
                  <p className="text-[#E85D04] text-[10px] font-bold tracking-widest uppercase">Elektronik</p>
                </div>
              </Link>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="flex-1 min-w-0">
                <div
                  className={`flex items-center rounded-full border-2 transition-all duration-200 overflow-hidden
                    bg-gray-50 ${searchFocused ? "border-[#1E2753] bg-white shadow-[0_0_0_3px_rgba(30,39,83,0.08)]" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-4 text-gray-400 w-3.5 h-3.5 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari produk elektronik..."
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="flex-1 min-w-0 py-2.5 px-3 bg-transparent text-sm
                      text-gray-700 placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#1E2753] hover:bg-[#2d3a8c] text-white text-sm font-semibold
                      px-5 py-2.5 flex-shrink-0 transition-colors duration-150"
                  >
                    Cari
                  </button>
                </div>
              </form>

              {/* Icon actions */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {/* Wishlist */}
                <Link
                  href="/user/wishlist"
                  className="relative p-2.5 rounded-xl hover:bg-gray-100
                    text-gray-500 hover:text-red-500 transition-colors"
                  title="Wishlist"
                >
                  <FiHeart className="w-5 h-5" />
                  <CountBadge count={wishlistCount} color="bg-red-500" />
                </Link>

                {/* Cart */}
                <Link
                  href="/user/cart"
                  className="relative p-2.5 rounded-xl hover:bg-gray-100
                    text-gray-500 hover:text-[#1E2753] transition-colors"
                  title="Keranjang"
                >
                  <FontAwesomeIcon icon={faCartShopping} className="w-5 h-5" />
                  <CountBadge count={cartCount} />
                </Link>

                {/* User dropdown (desktop) */}
                <div className="relative hidden md:block" ref={dropdownRef}>
                  {isLoggedIn ? (
                    <>
                      <button
                        onClick={() => setDropdownOpen((v) => !v)}
                        className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl
                          hover:bg-gray-100 text-gray-600 transition-colors ml-1"
                      >
                        <div
                          className="w-8 h-8 rounded-full bg-[#1E2753] flex items-center
                          justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-white ring-offset-1"
                        >
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">{userName || "Akun"}</span>
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`w-3 h-3 text-gray-400 transition-transform duration-200
                            ${dropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {/* Dropdown */}
                      {dropdownOpen && (
                        <div
                          className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-2xl
                            shadow-xl shadow-black/10 border border-gray-100 overflow-hidden
                            animate-fadeIn z-[10000]"
                        >
                          {/* Header */}
                          <div className="px-4 py-3 bg-gradient-to-br from-[#1E2753] to-[#2d3a8c]">
                            <p className="text-white/60 text-[10px] uppercase tracking-wider">Login sebagai</p>
                            <p className="text-white text-sm font-semibold truncate mt-0.5">{userName || "User"}</p>
                          </div>

                          <div className="py-1">
                            {[
                              {
                                href: "/user/account",
                                icon: faUser,
                                label: "Profil Saya",
                              },
                              {
                                href: "/user/orders",
                                icon: faBoxOpen,
                                label: "Pesanan Saya",
                              },
                              {
                                href: "/user/account",
                                icon: faGear,
                                label: "Pengaturan",
                              },
                            ].map(({ href, icon, label }) => (
                              <Link
                                key={label}
                                href={href}
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm
                                  text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5 text-gray-400" />
                                {label}
                              </Link>
                            ))}
                            <Link
                              href="/user/wishlist"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm
                                text-gray-700 hover:bg-red-50 transition-colors"
                            >
                              <FontAwesomeIcon icon={faHeart} className="w-3.5 h-3.5 text-red-400" />
                              Wishlist Saya
                              {wishlistCount > 0 && (
                                <span
                                  className="ml-auto text-xs bg-red-100 text-red-500
                                  font-bold px-1.5 py-0.5 rounded-full"
                                >
                                  {wishlistCount}
                                </span>
                              )}
                            </Link>
                          </div>

                          <div className="border-t border-gray-100 py-1">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                                text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <FontAwesomeIcon icon={faRightFromBracket} className="w-3.5 h-3.5" />
                              Keluar
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl
                        hover:bg-gray-100 text-gray-600 hover:text-[#1E2753] transition-colors ml-1"
                    >
                      <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                      <span className="text-sm font-medium">Masuk</span>
                    </Link>
                  )}
                </div>

                {/* Hamburger (mobile) */}
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="md:hidden p-2.5 rounded-xl hover:bg-gray-100
                    text-gray-500 transition-colors ml-0.5"
                  aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
                >
                  <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Category bar (desktop) ── */}
          <div className="hidden md:block border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.slug;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/user/products?category=${encodeURIComponent(cat.slug)}`}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium
                        transition-colors duration-150 border-b-2 flex-shrink-0
                        ${active ? "text-[#E85D04] border-[#E85D04]" : "text-gray-500 border-transparent hover:text-[#1E2753] hover:border-[#1E2753]/40"}`}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
                <Link
                  href="/user/products"
                  onClick={() => setSelectedCategory("")}
                  className="whitespace-nowrap px-4 py-3 text-sm font-semibold
                    text-[#E85D04] border-b-2 border-transparent hover:border-[#E85D04]/40
                    transition-colors flex-shrink-0"
                >
                  Lihat Semua →
                </Link>
              </div>
            </div>
          </div>

          {/* ── Mobile menu (slide down) ── */}
          {menuOpen && (
            <div
              className="md:hidden border-t border-gray-100 bg-white
                animate-slideDown max-h-[80vh] overflow-y-auto"
            >
              <div className="px-4 pt-3 pb-4 space-y-1">
                {/* Search mobile */}
                <form onSubmit={handleSearch} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari produk..."
                    className="flex-1 border-2 border-gray-200 rounded-xl px-3.5 py-2.5
                      text-sm focus:outline-none focus:border-[#1E2753] bg-gray-50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-medium
                      hover:bg-[#2d3a8c] transition-colors"
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
                  </button>
                </form>

                {/* Kategori */}
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-1">Kategori</p>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/user/products?category=${encodeURIComponent(cat.slug)}`}
                      className={`px-2 py-2 text-xs rounded-lg font-medium text-center transition-colors
                        ${selectedCategory === cat.slug ? "bg-orange-50 text-[#E85D04] font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/user/products"
                  className="block text-center px-3 py-2 text-sm font-semibold
                    text-[#E85D04] hover:bg-orange-50 rounded-lg transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Lihat Semua Produk →
                </Link>

                <div className="border-t border-gray-100 pt-2 mt-1 space-y-0.5">
                  {isLoggedIn ? (
                    <>
                      <div className="flex items-center gap-2.5 px-3 py-2">
                        <div
                          className="w-8 h-8 rounded-full bg-[#1E2753] flex items-center
                          justify-center text-white text-xs font-bold flex-shrink-0"
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700">{userName || "User"}</p>
                          <p className="text-[10px] text-gray-400">Login sebagai user</p>
                        </div>
                      </div>
                      {[
                        {
                          href: "/user/account",
                          icon: faUser,
                          label: "Profil Saya",
                          count: 0,
                        },
                        {
                          href: "/user/orders",
                          icon: faBoxOpen,
                          label: "Pesanan Saya",
                          count: 0,
                        },
                        {
                          href: "/user/wishlist",
                          icon: faHeart,
                          label: "Wishlist Saya",
                          count: wishlistCount,
                        },
                      ].map(({ href, icon, label, count }) => (
                        <Link
                          key={label}
                          href={href}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm
                            text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          <FontAwesomeIcon icon={icon} className="w-4 h-4 text-gray-400" />
                          {label}
                          {count > 0 && (
                            <span
                              className="ml-auto text-xs bg-red-100 text-red-500
                              font-bold px-1.5 py-0.5 rounded-full"
                            >
                              {count}
                            </span>
                          )}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm
                          text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
                      >
                        <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                        Keluar
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm
                        text-gray-700 hover:bg-gray-50 rounded-xl font-medium"
                    >
                      <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-400" />
                      Masuk / Daftar
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Spacer agar konten tidak tertutup fixed navbar */}
      {/* Dipasang di layout, tapi kalau belum ada bisa uncomment di sini: */}
      {/* <div className="h-[calc(64px+40px)] md:h-[64px+40px]" /> */}
    </>
  );
}
