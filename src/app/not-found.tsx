import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Ilustrasi */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-40 h-40 bg-gradient-to-br from-[#1E2753] to-[#2d3a8c] rounded-full opacity-10 absolute" />
          <span className="text-8xl relative">📦</span>
        </div>

        <h1 className="text-7xl font-black text-[#1E2753] mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Sepertinya halaman yang kamu cari sudah dipindahkan, dihapus, atau mungkin tidak pernah ada.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/user/dashboard-user"
            className="px-6 py-3 bg-[#1E2753] text-white rounded-xl font-semibold text-sm hover:bg-[#2d3a8c] transition-colors"
          >
            🏠 Kembali ke Beranda
          </Link>
          <Link
            href="/user/products"
            className="px-6 py-3 border-2 border-[#1E2753] text-[#1E2753] rounded-xl font-semibold text-sm hover:bg-[#1E2753] hover:text-white transition-all"
          >
            🛍️ Lihat Produk
          </Link>
        </div>

        {/* Dekorasi */}
        <p className="mt-10 text-xs text-gray-300">Rizky Elektronik — Toko Elektronik Terpercaya</p>
      </div>
    </div>
  );
}
