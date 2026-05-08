"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faUser, faBoxOpen, faGear, faHeart, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

interface UserDropdownProps {
  userName: string;
  wishlistCount: number;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
}

const MENU_ITEMS = [
  { href: "/user/account", icon: faUser, label: "Profil Saya" },
  { href: "/user/orders", icon: faBoxOpen, label: "Pesanan Saya" },
  { href: "/user/account", icon: faGear, label: "Pengaturan" },
] as const;

export default function UserDropdown({ userName, wishlistCount, open, onToggle, onClose, onLogout }: UserDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initials = userName?.charAt(0)?.toUpperCase() || "U";

  // Tutup saat klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl
          hover:bg-gray-100 text-gray-600 transition-colors ml-1"
      >
        <div
          className="w-8 h-8 rounded-full bg-[#1E2753] flex items-center
          justify-center text-white text-xs font-bold shrink-0 ring-2 ring-white ring-offset-1"
        >
          {initials}
        </div>
        <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">{userName || "Akun"}</span>
        <FontAwesomeIcon icon={faChevronDown} className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-2xl
          shadow-xl shadow-black/10 border border-gray-100 overflow-hidden animate-fadeIn z-60"
        >
          {/* Header dropdown */}
          <div className="px-4 py-3 bg-gradient-to-br from-[#1E2753] to-[#2d3a8c]">
            <p className="text-white/60 text-[10px] uppercase tracking-wider">Login sebagai</p>
            <p className="text-white text-sm font-semibold truncate mt-0.5">{userName || "User"}</p>
          </div>

          <div className="py-1">
            {MENU_ITEMS.map(({ href, icon, label }) => (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 text-sm
                  text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5 text-gray-400" />
                {label}
              </Link>
            ))}

            {/* Wishlist dengan badge count */}
            <Link
              href="/user/wishlist"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 text-sm
                text-gray-700 hover:bg-red-50 transition-colors"
            >
              <FontAwesomeIcon icon={faHeart} className="w-3.5 h-3.5 text-red-400" />
              Wishlist Saya
              {wishlistCount > 0 && <span className="ml-auto text-xs bg-red-100 text-red-500 font-bold px-1.5 py-0.5 rounded-full">{wishlistCount}</span>}
            </Link>
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                text-red-500 hover:bg-red-50 transition-colors"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
