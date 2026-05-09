import { FaBox, FaBoxOpen, FaLayerGroup } from "react-icons/fa";
import { Product } from "@/types/product";

interface ProductStatsProps {
  products: Product[];
  loading: boolean;
}

export function ProductStats({ products, loading }: ProductStatsProps) {
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const totalCategories = new Set(products.map((product) => product.category)).size;

  const stats = [
    { label: "Total Produk", value: products.length, icon: <FaBox /> },
    { label: "Total Kategori", value: totalCategories, icon: <FaLayerGroup /> },
    { label: "Total Stok", value: totalStock, icon: <FaBoxOpen /> },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            <h2 className="mt-1 text-3xl font-black text-slate-800">{loading ? "—" : stat.value}</h2>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-[#1E2753] bg-[#1E2753]/10">{stat.icon}</div>
        </div>
      ))}
    </div>
  );
}
