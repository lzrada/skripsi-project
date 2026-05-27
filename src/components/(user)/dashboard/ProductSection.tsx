"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import FlashSaleSection from "./FlashSaleSection";
import LatestProductSection from "./LatestProductSection";
import AllProductsSection from "./AllProductSection";

const ITEMS_PER_PAGE = 10;
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
  const [currentPage, setCurrentPage] = useState(1);

  const inStock = products.filter((p) => p.stock > 0);

  const flashSaleProducts = inStock.filter(isOnSale).slice(0, FLASH_SALE_LIMIT);
  const latestProducts = inStock.slice(0, TERBARU_LIMIT);

  const filteredProducts = activeTab === "Promo" ? inStock.filter(isOnSale) : activeTab === "New" ? inStock.filter(isNew) : activeTab === "Second" ? inStock.filter(isSecond) : inStock;

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  const pagedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    const el = document.getElementById("produk");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-10">
      <FlashSaleSection products={flashSaleProducts} loading={loading} />
      <LatestProductSection products={latestProducts} loading={loading} />
      <AllProductsSection products={pagedProducts} loading={loading} activeTab={activeTab} currentPage={currentPage} totalPages={totalPages} onTabChange={handleTabChange} onPageChange={handlePageChange} />
    </div>
  );
}
