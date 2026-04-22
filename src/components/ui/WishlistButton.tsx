"use client";

import { useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { toggleWishlist, isWishlisted } from "@/service/wishlist.service";
import { toast } from "@/components/ui/Toast";

function getUid(): string | null {
  if (typeof document === "undefined") return null;
  return document.cookie.split("; ").find((r) => r.startsWith("uid="))?.split("=")[1] ?? null;
}

interface WishlistButtonProps {
  productId: string;
  productName: string;
  className?: string;
  size?: "sm" | "md";
}

export default function WishlistButton({ productId, productName, className = "", size = "md" }: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const u = getUid();
    setUid(u);
    if (u) setWishlisted(isWishlisted(u, productId));
  }, [productId]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!uid) {
      toast.warning("Login dulu untuk menyimpan wishlist!");
      return;
    }

    const added = toggleWishlist(uid, productId);
    setWishlisted(added);
    if (added) {
      toast.success(`${productName} ditambahkan ke wishlist ❤️`);
    } else {
      toast.info(`${productName} dihapus dari wishlist`);
    }
  };

  const s = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const icon = size === "sm" ? "text-sm" : "text-base";

  return (
    <button
      onClick={handleToggle}
      className={`${s} flex items-center justify-center rounded-full bg-white/90 shadow-sm hover:scale-110 transition-all duration-200 ${className}`}
      aria-label={wishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
    >
      {wishlisted ? (
        <FaHeart className={`${icon} text-red-500`} />
      ) : (
        <FiHeart className={`${icon} text-gray-400 hover:text-red-400`} />
      )}
    </button>
  );
}
