"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faCartShopping, faUser, faBolt } from "@fortawesome/free-solid-svg-icons";
import { FiHeart } from "react-icons/fi";

import { logout } from "@/service/auth.service";
import { subscribeToCartService } from "@/service/cart.service";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getWishlistIds } from "@/service/wishlist.service";
import { getCookieValue } from "@/lib/format";
import { CartItem } from "@/types/cart";
import CountBadge from "./CountBadge";
import NavbarSearch from "./NavbarSearch";
import UserDropdown from "./UserDropdown";
import MobileMenu from "./MobileMenu";
import CategoryBar from "./CategoryBar";

export default function NavbarUser() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const headerRef = useRef<HTMLElement>(null);

  // ── Sync kategori aktif dari URL ──────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedCategory(params.get("category") ?? "");
  }, [pathname]);

  // ── Update CSS var untuk tinggi navbar (agar konten tidak tertutup) ───────
  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const h = headerRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty("--navbar-height", `${h}px`);
      }
    };
    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    if (headerRef.current) ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, [isLoggedIn, menuOpen]);

  // ── Tutup menu saat navigasi ──────────────────────────────────────────────
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // ── Scroll shadow ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Auth & data user ──────────────────────────────────────────────────────
  useEffect(() => {
    const token = getCookieValue("firebaseToken");
    const uid = getCookieValue("uid");
    setIsLoggedIn(!!token);
    if (!token || !uid) return;

    getCurrentUser(uid).then((user) => {
      if (user?.fullName) setUserName(user.fullName);
    });
    setWishlistCount(getWishlistIds(uid).length);
  }, []);

  // ── Cart realtime ─────────────────────────────────────────────────────────
  useEffect(() => {
    const uid = getCookieValue("uid");
    if (!uid) return;
    return subscribeToCartService(uid, setCartItems);
  }, []);

  // ── Wishlist sync (localStorage event) ───────────────────────────────────
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

  // ── Lock body scroll saat mobile menu terbuka ────────────────────────────
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
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

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  return (
    <>
      {menuOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setMenuOpen(false)} />}

      <header
        ref={headerRef}
        className={`fixed top-0 left-0 w-full z-50 bg-white transition-shadow duration-300
          ${scrolled ? "shadow-[0_2px_20px_rgba(30,39,83,0.12)]" : ""}`}
      >
        {!isLoggedIn && (
          <div className="bg-[#1E2753] text-white text-xs py-1.5 px-4 flex justify-between items-center">
            <span className="hidden sm:inline">🚚 Gratis ongkir untuk wilayah Blitar dan sekitarnya!</span>
            <span className="sm:hidden text-[11px]">🚚 Gratis ongkir wilayah Blitar</span>
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

        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-3 h-14 sm:h-16">
              {/* Logo */}
              <Link href="/user/dashboard-user" className="shrink-0 flex items-center gap-2 group">
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-[#1E2753] rounded-xl flex items-center
                  justify-center group-hover:bg-[#2d3a8c] transition-colors"
                >
                  <FontAwesomeIcon icon={faBolt} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                </div>

                <div className="hidden sm:block leading-none">
                  <p className="text-[#1E2753] font-black text-base">Rizqi</p>
                  <p className="text-[#E85D04] text-[10px] font-bold tracking-widest uppercase">Elektronik</p>
                </div>
              </Link>

              <NavbarSearch />

              <div className="flex items-center gap-0.5 shrink-0">
                <Link
                  href="/user/wishlist"
                  className="relative p-2 sm:p-2.5 rounded-xl hover:bg-gray-100
                    text-gray-500 hover:text-red-500 transition-colors"
                  aria-label="Wishlist"
                >
                  <FiHeart className="w-5 h-5" />
                  <CountBadge count={wishlistCount} color="bg-red-500" />
                </Link>

                <Link
                  href="/user/cart"
                  className="relative p-2 sm:p-2.5 rounded-xl hover:bg-gray-100
                    text-gray-500 hover:text-[#1E2753] transition-colors"
                  aria-label="Keranjang"
                >
                  <FontAwesomeIcon icon={faCartShopping} className="w-5 h-5" />
                  <CountBadge count={cartCount} />
                </Link>

                {isLoggedIn ? (
                  <UserDropdown userName={userName} wishlistCount={wishlistCount} open={dropdownOpen} onToggle={() => setDropdownOpen((v) => !v)} onClose={() => setDropdownOpen(false)} onLogout={handleLogout} />
                ) : (
                  <Link
                    href="/login"
                    className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl
                      hover:bg-gray-100 text-gray-600 hover:text-[#1E2753] transition-colors ml-1"
                  >
                    <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                    <span className="text-sm font-medium">Masuk</span>
                  </Link>
                )}

                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="md:hidden p-2 rounded-xl hover:bg-gray-100
                    text-gray-500 transition-colors ml-0.5 active:bg-gray-200"
                  aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
                  aria-expanded={menuOpen}
                >
                  <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Category bar — desktop only */}
          <CategoryBar selectedCategory={selectedCategory} />

          {/* Mobile menu */}
          {menuOpen && <MobileMenu isLoggedIn={isLoggedIn} userName={userName} wishlistCount={wishlistCount} selectedCategory={selectedCategory} onClose={() => setMenuOpen(false)} onLogout={handleLogout} />}
        </nav>
      </header>
    </>
  );
}
