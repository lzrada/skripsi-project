import { faBoltLightning, faStore, faTv } from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface Slide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  bg: string;
  accentBg: string;
  accentText: string;
  icon: IconDefinition;
  tag: string;
}

export const slides: Slide[] = [
  {
    id: 1,
    title: "Selamat Datang di Rizky Elektronik",
    subtitle: "Toko elektronik terpercaya Blitar & sekitarnya — kini hadir online",
    cta: "Belanja Sekarang",
    href: "/user/products",
    bg: "from-[#1E2753] to-[#2d3a8c]",
    accentBg: "bg-yellow-400",
    accentText: "text-yellow-400",
    icon: faStore,
    tag: "RESMI ONLINE",
  },
  {
    id: 2,
    title: "Promo Elektronik Pilihan",
    subtitle: "Diskon spesial untuk TV, Kipas Angin, Kulkas, dan Mesin Cuci berkualitas",
    cta: "Lihat Promo",
    href: "/user/products",
    bg: "from-[#0f4c75] to-[#1b6ca8]",
    accentBg: "bg-sky-300",
    accentText: "text-sky-300",
    icon: faTv,
    tag: "DISKON SPESIAL",
  },
  {
    id: 3,
    title: "Stok Terjaga, Harga Transparan",
    subtitle: "Cek ketersediaan barang secara real-time — tidak perlu telepon toko",
    cta: "Cek Produk",
    href: "/user/products",
    bg: "from-[#1a1a2e] to-[#16213e]",
    accentBg: "bg-emerald-400",
    accentText: "text-emerald-400",
    icon: faBoltLightning,
    tag: "STOK REAL-TIME",
  },
];
