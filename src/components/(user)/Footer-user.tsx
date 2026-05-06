// src/components/(user)/Footer-user.tsx
"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faPhone, faEnvelope, faClock } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp, faInstagram } from "@fortawesome/free-brands-svg-icons";

export default function FooterUser() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1E2753] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Info Toko */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-bold mb-1">Rizky Elektronik</h3>
            <p className="text-white/60 text-xs mb-4">Toko elektronik terpercaya Blitar & sekitarnya</p>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 mt-0.5 text-yellow-400 shrink-0" />
                <span>Blitar, Jawa Timur</span>
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>0812-XXXX-XXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>rizky.elektronik@email.com</span>
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>Senin–Sabtu, 08.00–17.00 WIB</span>
              </li>
            </ul>
          </div>

          {/* Kategori Produk */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">Kategori Produk</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {["Televisi", "Kulkas", "Mesin Cuci", "AC", "Kipas Angin", "Audio"].map((cat) => (
                <li key={cat}>
                  <Link href={`/user/products?category=${cat}`} className="hover:text-yellow-400 transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Layanan */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">Layanan</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {[
                { label: "Semua Produk", href: "/user/products" },
                { label: "Keranjang Belanja", href: "/user/cart" },
                { label: "Riwayat Pesanan", href: "/user/orders" },
                { label: "Akun Saya", href: "/user/account" },
                { label: "Wishlist", href: "/user/wishlist" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-yellow-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sosial Media & Pembayaran */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">Hubungi Kami</h4>
            <div className="flex gap-3 mb-6">
              <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-green-500 hover:bg-green-400 rounded-xl flex items-center justify-center transition-colors" aria-label="WhatsApp">
                <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-linear-to-br from-pink-500 to-purple-600 hover:opacity-80 rounded-xl flex items-center justify-center transition-opacity"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-4 h-4" />
              </a>
            </div>

            <h4 className="font-semibold text-sm mb-3 text-white/90">Metode Pembayaran</h4>
            <div className="flex flex-wrap gap-2">
              {["Transfer Bank", "GoPay", "OVO", "DANA", "COD"].map((method) => (
                <span key={method} className="text-[10px] bg-white/10 text-white/70 px-2 py-1 rounded-lg font-medium">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <p>© {currentYear} Rizky Elektronik. Dikembangkan menggunakan Next.js & Firebase.</p>
          <p>Sistem E-Commerce — Universitas Islam Balitar, Teknik Informatika {currentYear}</p>
        </div>
      </div>
    </footer>
  );
}
