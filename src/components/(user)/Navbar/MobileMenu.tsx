import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBoxOpen, faHeart, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import NavbarSearch from "./NavbarSearch";
import { NAV_CATEGORIES } from "./Constants";

interface MobileMenuProps {
  isLoggedIn: boolean;
  userName: string;
  wishlistCount: number;
  selectedCategory: string;
  onClose: () => void;
  onLogout: () => void;
}

const MOBILE_LINKS = [
  { href: "/user/account", icon: faUser, label: "Profil Saya", count: 0 },
  { href: "/user/orders", icon: faBoxOpen, label: "Pesanan Saya", count: 0 },
] as const;

export default function MobileMenu({ isLoggedIn, userName, wishlistCount, selectedCategory, onClose, onLogout }: MobileMenuProps) {
  const initials = userName?.charAt(0)?.toUpperCase() || "U";

  return (
    <div
      className="md:hidden border-t border-gray-100 bg-white
        animate-slideDown max-h-[80vh] overflow-y-auto"
    >
      <div className="px-4 pt-3 pb-6 space-y-1">
        {/* Search — compact variant */}
        <NavbarSearch variant="compact" onSearch={onClose} />

        {/* Kategori */}
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 pt-3 pb-1">Kategori</p>
        {/* Grid 3 kolom — pas untuk HP 360-390px */}
        <div className="grid grid-cols-3 gap-1 mb-2">
          {NAV_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/user/products?category=${encodeURIComponent(cat.slug)}`}
              onClick={onClose}
              className={`px-2 py-2.5 text-xs rounded-xl font-medium text-center
                transition-colors active:scale-95
                ${selectedCategory === cat.slug ? "bg-orange-50 text-[#E85D04] font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
        <Link
          href="/user/products"
          onClick={onClose}
          className="block text-center px-3 py-2.5 text-sm font-semibold
            text-[#E85D04] hover:bg-orange-50 rounded-xl transition-colors"
        >
          Lihat Semua Produk →
        </Link>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-2 mt-1 space-y-0.5">
          {isLoggedIn ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-2.5 px-3 py-2">
                <div
                  className="w-9 h-9 rounded-full bg-[#1E2753] flex items-center
                  justify-center text-white text-sm font-bold shrink-0"
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{userName || "User"}</p>
                  <p className="text-[10px] text-gray-400">Login sebagai user</p>
                </div>
              </div>

              {/* Menu links */}
              {MOBILE_LINKS.map(({ href, icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-3 text-sm
                    text-gray-700 hover:bg-gray-50 rounded-xl transition-colors
                    active:bg-gray-100"
                >
                  <FontAwesomeIcon icon={icon} className="w-4 h-4 text-gray-400" />
                  {label}
                </Link>
              ))}

              {/* Wishlist */}
              <Link
                href="/user/wishlist"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 text-sm
                  text-gray-700 hover:bg-red-50 rounded-xl transition-colors active:bg-red-100"
              >
                <FontAwesomeIcon icon={faHeart} className="w-4 h-4 text-red-400" />
                Wishlist Saya
                {wishlistCount > 0 && (
                  <span
                    className="ml-auto text-xs bg-red-100 text-red-500
                    font-bold px-2 py-0.5 rounded-full"
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-3 text-sm
                  text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium
                  active:bg-red-100"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                Keluar
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 text-sm
                text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
            >
              <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-400" />
              Masuk / Daftar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
