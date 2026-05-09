import Image from "next/image";
import { FaEdit, FaTrash, FaFire } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Product } from "@/types/product";
import { categoryGradient, categoryIcon, defaultCategoryIcon, defaultGradient } from "@/constants/category";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Habis
      </span>
    );
  }

  if (stock <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
        <FaFire className="w-2.5 h-2.5" />
        Hampir Habis! Sisa {stock}
      </span>
    );
  }

  if (stock <= 10) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Terbatas ({stock})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Stok {stock}
    </span>
  );
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const discountPct = product.originalPrice && product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
  const hasImage = !!product.images?.[0];
  const imageUrl = product.images?.[0] ?? "";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#1E2753]/20 transition-all duration-200 overflow-hidden flex flex-col group">
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {hasImage ? (
          <Image src={imageUrl} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${categoryGradient[product.category] ?? defaultGradient} flex items-center justify-center`}>
            <FontAwesomeIcon icon={categoryIcon[product.category] ?? defaultCategoryIcon} className="w-12 h-12 text-white/50" />
          </div>
        )}

        {discountPct && discountPct > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg z-10">-{discountPct}%</span>
        )}

        {product.images?.length > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">+{product.images.length - 1} foto</span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-[#1E2753] uppercase tracking-wide">{product.category}</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">{product.condition ?? "Bekas"}</span>
        </div>

        <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 flex-1 mb-2">{product.name}</h3>

        <div className="mt-auto space-y-2">
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-xs text-slate-400 line-through">{formatPrice(product.originalPrice)}</p>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-black text-[#1E2753]">{formatPrice(product.price)}</span>
            <StockBadge stock={product.stock} />
          </div>

          {product.stock <= (product.reorderPoint ?? 5) && product.stock > 0 && (
            <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">⚠️ Di bawah Reorder Point ({product.reorderPoint ?? 5})</p>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-[#1E2753]/20 text-[#1E2753] text-xs font-bold hover:bg-[#1E2753] hover:text-white transition"
          >
            <FaEdit /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 border-2 border-red-100 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition"
          >
            <FaTrash /> Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
