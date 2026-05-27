import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faTableCells, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import ProductCard from "@/components/(user)/ui/ProductCard";
import { SkeletonGrid } from "@/components/(user)/ui/SkeletonProductCard";
import { Product } from "@/types/product";

const TABS = ["Semua", "Promo", "New", "Second"] as const;
type Tab = (typeof TABS)[number];

interface AllProductsSectionProps {
  products: Product[];
  loading: boolean;
  activeTab: Tab;
  currentPage: number;
  totalPages: number;
  onTabChange: (tab: Tab) => void;
  onPageChange: (page: number) => void;
}

export default function AllProductsSection({ products, loading, activeTab, currentPage, totalPages, onTabChange, onPageChange }: AllProductsSectionProps) {
  // Buat array nomor halaman yang ditampilkan (maksimal 5 tombol)
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <section id="produk">
      <div className="flex items-center gap-2 mb-4">
        <FontAwesomeIcon icon={faTableCells} className="w-5 h-5 text-[#1E2753]" />
        <h2 className="text-lg font-bold text-gray-800">Semua Produk</h2>
      </div>

      {/* Tab Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${activeTab === tab ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E2753]"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid Produk */}
      {loading ? (
        <SkeletonGrid count={10} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" />
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>

          {/* Pagination */}

          <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
            {/* Tombol Prev */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:border-[#1E2753] hover:text-[#1E2753] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Halaman sebelumnya"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
            </button>

            {/* Nomor Halaman */}
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`dots-${idx}`} className="flex items-center justify-center w-9 h-9 text-gray-400 text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`flex items-center justify-center w-9 h-9 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                    currentPage === page ? "bg-[#1E2753] text-white border-[#1E2753] shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E2753] hover:text-[#1E2753]"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            {/* Tombol Next */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:border-[#1E2753] hover:text-[#1E2753] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Halaman berikutnya"
            >
              <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
            </button>
          </div>

          {/* Info halaman */}
          <p className="text-center text-xs text-gray-400 mt-2">
            Halaman {currentPage} dari {totalPages}
          </p>
        </>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">
            <FontAwesomeIcon icon={faBox} className="w-10 h-10 text-[#1E2753]" />
          </p>
          <p className="font-medium">Tidak ada produk ditemukan</p>
          <p className="text-sm mt-1">Coba tab lain atau cari produk berbeda</p>
        </div>
      )}
    </section>
  );
}
