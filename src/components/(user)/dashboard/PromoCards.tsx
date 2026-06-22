import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRecycle, faTruckFast, faShield } from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface PromoCard {
  title: string;
  desc: string;
  icon: IconDefinition;
  color: string;
}

const PROMO_CARDS: PromoCard[] = [
  {
    title: "Barang Elektronik Berkualitas",
    desc: "Produk original & second terawat dengan harga bersahabat",
    icon: faRecycle,
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Gratis Ongkir wilayah Blitar ",
    desc: "Pengiriman gratis untuk area Blitar",
    icon: faTruckFast,
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Garansi Toko Rizqi",
    desc: "Setiap produk dilengkapi garansi resmi dari toko",
    icon: faShield,
    color: "from-[#1E2753] to-[#2d3a8c]",
  },
];

export default function PromoCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {PROMO_CARDS.map((p) => (
        <div
          key={p.title}
          className={`bg-linear-to-br ${p.color} rounded-2xl p-4 sm:p-5
            flex items-center gap-3 sm:gap-4`}
        >
          {/* Icon lebih kecil di mobile agar tidak dominan */}
          <FontAwesomeIcon icon={p.icon} className="text-3xl sm:text-4xl text-black/20 shrink-0" />
          <div>
            <p className="text-white font-bold text-sm leading-snug">{p.title}</p>
            <p className="text-white/70 text-xs mt-0.5 leading-relaxed">{p.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
