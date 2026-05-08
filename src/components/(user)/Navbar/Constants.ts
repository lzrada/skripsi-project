export const NAV_CATEGORIES = [
  { name: "Televisi", slug: "Televisi" },
  { name: "Kulkas", slug: "Kulkas" },
  { name: "Mesin Cuci", slug: "Mesin Cuci" },
  { name: "AC", slug: "AC" },
  { name: "Kipas Angin", slug: "Kipas Angin" },
  { name: "Audio", slug: "Audio" },
] as const;

export const NAV_USER_MENU = [
  { href: "/user/account", label: "Profil Saya" },
  { href: "/user/orders", label: "Pesanan Saya" },
  { href: "/user/account", label: "Pengaturan" },
  { href: "/user/wishlist", label: "Wishlist Saya" },
] as const;
