"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import FlashSaleSection from "./FlashSaleSection";
import LatestProductSection from "./LatestProductSection";
import AllProductsSection from "./AllProductSection";

const LOAD_MORE_STEP = 10;
const FLASH_SALE_LIMIT = 4;
const TERBARU_LIMIT = 4;

type Tab = "Semua" | "Promo" | "New" | "Second";

function isOnSale(p: Product) {
  return !!p.originalPrice && p.originalPrice > p.price;
}

function isNew(p: Product) {
  return p.condition?.toLowerCase() === "baru";
}

function isSecond(p: Product) {
  return p.condition?.toLowerCase() === "bekas";
}

export interface ProductSectionProps {
  products: Product[];
  loading: boolean;
}

export default function ProductSection({ products, loading }: ProductSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Semua");
  const [visibleCount, setVisibleCount] = useState(LOAD_MORE_STEP);

  // Semua produk yang masih ada stok
  const inStock = products.filter((p) => p.stock > 0);

  // Derivasi data per section
  const flashSaleProducts = inStock.filter(isOnSale).slice(0, FLASH_SALE_LIMIT);
  const latestProducts = inStock.slice(0, TERBARU_LIMIT);

  const filteredProducts = activeTab === "Promo" ? inStock.filter(isOnSale) : activeTab === "New" ? inStock.filter(isNew) : activeTab === "Second" ? inStock.filter(isSecond) : inStock;

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setVisibleCount(LOAD_MORE_STEP); // Reset pagination saat ganti tab
  };

  return (
    <div className="space-y-10">
      <FlashSaleSection products={flashSaleProducts} loading={loading} />
      <LatestProductSection products={latestProducts} loading={loading} />
      <AllProductsSection products={filteredProducts} loading={loading} activeTab={activeTab} visibleCount={visibleCount} onTabChange={handleTabChange} onLoadMore={() => setVisibleCount((v) => v + LOAD_MORE_STEP)} />
    </div>
  );
}
