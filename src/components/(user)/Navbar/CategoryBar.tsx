import Link from "next/link";
import { NAV_CATEGORIES } from "./Constants";

interface CategoryBarProps {
  selectedCategory: string;
  onCategoryClick?: (slug: string) => void;
}

export default function CategoryBar({ selectedCategory }: CategoryBarProps) {
  return (
    <div className="hidden md:block border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center overflow-x-auto [scrollbar-width:none]
          [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {NAV_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={`/user/products?category=${encodeURIComponent(cat.slug)}`}
                className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium
                  transition-colors duration-150 border-b-2 shrink-0
                  ${active ? "text-[#E85D04] border-[#E85D04]" : "text-gray-500 border-transparent hover:text-[#1E2753] hover:border-[#1E2753]/40"}`}
              >
                {cat.name}
              </Link>
            );
          })}
          <Link
            href="/user/products"
            className="whitespace-nowrap px-4 py-3 text-sm font-semibold
              text-[#E85D04] border-b-2 border-transparent hover:border-[#E85D04]/40
              transition-colors shrink-0"
          >
            Lihat Semua →
          </Link>
        </div>
      </div>
    </div>
  );
}
