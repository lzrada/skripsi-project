"use client";

import { useEffect, useMemo, useState } from "react";
import CategoryGrid from "@/components/(user)/ui/CategoryGrid";
import ProductSection from "@/components/(user)/dashboard/ProductSection";
import { subscribeToProductsService } from "@/service/product.service";
import { Product } from "@/types/product";

export default function DashboardProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToProductsService((data) => {
      setProducts(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) {
      if (p.stock > 0) {
        map[p.category] = (map[p.category] ?? 0) + 1;
      }
    }
    return map;
  }, [products]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <CategoryGrid counts={counts} />

      <ProductSection products={products} loading={loading} />
    </div>
  );
}
