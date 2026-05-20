import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faTableCells } from "@fortawesome/free-solid-svg-icons";
import ProductCard from "@/components/(user)/ui/ProductCard";
import { SkeletonGrid } from "@/components/(user)/ui/SkeletonProductCard";
import { Product } from "@/types/product";

const TABS = ["Semua", "Promo", "New", "Second"] as const;
type Tab = (typeof TABS)[number];

interface AllProductsSectionProps {
  products: Product[];
  loading: boolean;
  activeTab: Tab;
  visibleCount: number;
  onTabChange: (tab: Tab) => void;
  onLoadMore: () => void;
}

export default function AllProductsSection({ products, loading, activeTab, visibleCount, onTabChange, onLoadMore }: AllProductsSectionProps) {
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
            {products.slice(0, visibleCount).map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>

          {visibleCount < products.length && (
            <div className="flex justify-center mt-8">
              <button onClick={onLoadMore} className="px-8 py-2.5 border-2 border-[#1E2753] text-[#1E2753] rounded-xl font-semibold text-sm hover:bg-[#1E2753] hover:text-white transition-all duration-200">
                Muat Lebih Banyak
              </button>
            </div>
          )}
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
