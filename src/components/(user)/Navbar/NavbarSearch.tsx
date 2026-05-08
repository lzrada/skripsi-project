"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

interface NavbarSearchProps {
  variant?: "full" | "compact";
  onSearch?: () => void;
}

export default function NavbarSearch({ variant = "full", onSearch }: NavbarSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/user/products?search=${encodeURIComponent(q)}`);
    setQuery("");
    onSearch?.();
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari produk..."
          className="flex-1 border-2 border-gray-200 rounded-xl px-3.5 py-2.5
            text-sm focus:outline-none focus:border-[#1E2753] bg-gray-50"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm
            font-medium hover:bg-[#2d3a8c] transition-colors"
          aria-label="Cari"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 min-w-0">
      <div
        className={`flex items-center rounded-full border-2 transition-all duration-200
          overflow-hidden bg-gray-50
          ${focused ? "border-[#1E2753] bg-white shadow-[0_0_0_3px_rgba(30,39,83,0.08)]" : "border-gray-200 hover:border-gray-300"}`}
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-4 text-gray-400 w-3.5 h-3.5 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari produk elektronik..."
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 min-w-0 py-2.5 px-3 bg-transparent text-sm
            text-gray-700 placeholder-gray-400 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-[#1E2753] hover:bg-[#2d3a8c] text-white text-sm
            font-semibold px-5 py-2.5 shrink-0 transition-colors duration-150"
        >
          Cari
        </button>
      </div>
    </form>
  );
}
