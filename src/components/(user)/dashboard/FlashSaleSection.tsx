import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ProductCard from "@/components/(user)/ui/ProductCard";
import { SkeletonGrid } from "@/components/(user)/ui/SkeletonProductCard";
import { Product } from "@/types/product";

interface FlashSaleSectionProps {
  products: Product[];
  loading: boolean;
}

export default function FlashSaleSection({ products, loading }: FlashSaleSectionProps) {
  if (loading) {
    return (
      <section>
        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse mb-4" />
        <SkeletonGrid count={4} />
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faFire} className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold text-gray-800">Flash Sale</h2>
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">DISKON</span>
        </div>
        <Link href="/user/products" className="text-xs text-[#1E2753] font-semibold flex items-center gap-1 hover:underline">
          Lihat Semua <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 4} />
        ))}
      </div>
    </section>
  );
}
