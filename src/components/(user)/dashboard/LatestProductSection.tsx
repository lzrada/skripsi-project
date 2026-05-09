import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ProductCard from "@/components/(user)/ui/ProductCard";
import { SkeletonGrid } from "@/components/(user)/ui/SkeletonProductCard";
import { Product } from "@/types/product";

interface LatestProductSectionProps {
  products: Product[];
  loading: boolean;
}

export default function LatestProductSection({ products, loading }: LatestProductSectionProps) {
  if (loading) {
    return (
      <section>
        <div className="h-5 bg-gray-200 rounded w-36 animate-pulse mb-4" />
        <SkeletonGrid count={4} />
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faTag} className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-gray-800">Produk Terbaru</h2>
        </div>
        <Link href="/user/products" className="text-xs text-[#1E2753] font-semibold flex items-center gap-1 hover:underline">
          Lihat Semua <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
