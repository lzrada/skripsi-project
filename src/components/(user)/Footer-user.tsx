import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faPhone, faEnvelope, faClock } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp, faInstagram } from "@fortawesome/free-brands-svg-icons";

const FOOTER_CATEGORIES = ["Televisi", "Kulkas", "Mesin Cuci", "AC", "Kipas Angin", "Audio"];

const FOOTER_LINKS = [
  { label: "Semua Produk", href: "/user/products" },
  { label: "Keranjang", href: "/user/cart" },
  { label: "Riwayat Pesanan", href: "/user/orders" },
  { label: "Akun Saya", href: "/user/account" },
  { label: "Wishlist", href: "/user/wishlist" },
];

const PAYMENT_METHODS = ["Transfer Bank", "GoPay", "OVO", "DANA", "COD"];

export default function FooterUser() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1E2753] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-bold mb-1">Rizqi Elektronik</h3>
            <p className="text-white/60 text-xs mb-4">Toko elektronik terpercaya Blitar & sekitarnya</p>
            <ul className="space-y-2.5 text-sm text-white/70">
              {[
                { icon: faLocationDot, text: "Blitar, Jawa Timur" },
                { icon: faPhone, text: "0857-3532-8348" },
                { icon: faEnvelope, text: "rizqielektronik@email.com" },
                { icon: faClock, text: "Senin–Sabtu, 08.00–17.00 WIB" },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-2">
                  <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5 mt-0.5 text-yellow-400 shrink-0" />
                  <span className="text-xs sm:text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 sm:mb-4 text-white/90">Kategori Produk</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {FOOTER_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link href={`/user/products?category=${cat}`} className="hover:text-yellow-400 transition-colors text-xs sm:text-sm">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 sm:mb-4 text-white/90">Layanan</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {FOOTER_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-yellow-400 transition-colors text-xs sm:text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-semibold text-sm mb-3 sm:mb-4 text-white/90">Hubungi Kami</h4>
            <div className="flex gap-3 mb-5">
              <a
                href="https://wa.me/6285735328348"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 bg-green-500 hover:bg-green-400 rounded-xl
                  flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 bg-gradient-to-br from-pink-500 to-purple-600
                  hover:opacity-80 rounded-xl flex items-center justify-center transition-opacity"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-4 h-4" />
              </a>
            </div>

            <h4 className="font-semibold text-sm mb-2 text-white/90">Metode Pembayaran</h4>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_METHODS.map((m) => (
                <span key={m} className="text-[10px] bg-white/10 text-white/70 px-2 py-1 rounded-lg font-medium">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="border-t border-white/10 mt-8 sm:mt-10 pt-5 sm:pt-6
          flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40"
        >
          <p>© {year} Rizqi Elektronik.</p>
          {/* <p className="text-center sm:text-right">Sistem E-Commerce — Universitas Islam Balitar, Teknik Informatika {year}</p> */}
        </div>
      </div>
    </footer>
  );
}
