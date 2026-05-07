"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/user/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-400 w-4 h-4 shrink-0" />
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari produk elektronik... (TV, AC, Kulkas, dll)" className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent" />
      <button type="submit" className="bg-[#1E2753] text-white text-xs font-semibold px-4 py-1.5 rounded-xl hover:bg-[#2d3a8c] transition-colors shrink-0">
        Cari
      </button>
    </form>
  );
}
