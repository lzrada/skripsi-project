import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faFacebook, faWhatsapp } from "@fortawesome/free-brands-svg-icons";

export default function FooterUser() {
  return (
    <footer className="bg-[#1E2753] text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-[#1E2753] font-black text-sm">R</span>
              </div>
              <div>
                <p className="font-bold text-base leading-tight">Rizky</p>
                <p className="text-[#E85D04] text-xs font-semibold">ELEKTRONIK</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">Toko elektronik terpercaya di Blitar. Menyediakan produk elektronik baru & berkualitas dengan harga terjangkau.</p>
            {/* Social media */}
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-pink-500 rounded-lg flex items-center justify-center transition-colors">
                <FontAwesomeIcon icon={faInstagram} className="w-4 h-4" />
              </a>

              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <FontAwesomeIcon icon={faFacebook} className="w-4 h-4" />
              </a>

              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors">
                <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Kategori */}
          <div>
            <p className="font-semibold text-sm mb-4">Kategori</p>
            <ul className="space-y-2 text-xs text-gray-400">
              {["Televisi", "Kulkas", "AC", "Mesin Cuci", "Kipas Angin", "Audio"].map((cat) => (
                <li key={cat}>
                  <Link href={`/user/product-detail/${cat.toLowerCase()}`} className="hover:text-white transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Layanan */}
          <div>
            <p className="font-semibold text-sm mb-4">Layanan</p>
            <ul className="space-y-2 text-xs text-gray-400">
              {["Cara Pemesanan", "Cara Pembayaran", "Pengiriman", "Garansi & Return", "Tentang Kami", "Kontak"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <p className="font-semibold text-sm mb-4">Hubungi Kami</p>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-400" />
                <span>Ngrobong, Jiwut, Nglegok, Kab. Blitar, Jawa Timur 66181</span>
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="w-3 h-3 flex-shrink-0 text-yellow-400" />
                <a href="tel:+62" className="hover:text-white transition-colors">
                  +62 xxx-xxxx-xxxx
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 flex-shrink-0 text-yellow-400" />
                <a href="mailto:rizky@email.com" className="hover:text-white transition-colors">
                  rizky@email.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faWhatsapp} className="w-3 h-3 flex-shrink-0 text-green-400" />
                <a href="https://wa.me/62" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Chat via WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© 2025 Rizky Elektronik. All rights reserved.</p>
          <p>Dibuat dengan ❤️ menggunakan Next.js & Firebase</p>
        </div>
      </div>
    </footer>
  );
}
