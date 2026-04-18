import { faTv } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { BsFillSpeakerFill } from "react-icons/bs";
import { GiWashingMachine } from "react-icons/gi";
import { PiFan } from "react-icons/pi";
import { RiFridgeFill } from "react-icons/ri";
import { TbAirConditioning } from "react-icons/tb";

const categories = [
  { name: "Televisi", icon: <FontAwesomeIcon icon={faTv} />, count: 24 },
  { name: "Kulkas", icon: <RiFridgeFill className="text-3xl" />, count: 18 },
  { name: "AC", icon: <TbAirConditioning className="text-3xl" />, count: 15 },
  { name: "Mesin Cuci", icon: <GiWashingMachine />, count: 12 },
  { name: "Kipas Angin", icon: <PiFan />, count: 20 },
  { name: "Audio", icon: <BsFillSpeakerFill />, count: 16 },
];

export default function CategoryGrid() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Kategori Produk</h2>
        <Link href="#" className="text-sm text-[#1E2753] font-semibold hover:underline">
          Lihat Semua
        </Link>
      </div>

      {/* Grid kategori */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={`/user/product-detail/${cat.name.toLowerCase().replace(" ", "-")}`}
            className="group flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:border-[#1E2753] hover:shadow-md transition-all duration-200"
          >
            <span className="text-2xl group-hover:scale-125 transition-transform duration-200">{cat.icon}</span>
            <span className="text-xs text-gray-600 font-medium text-center group-hover:text-[#1E2753]">{cat.name}</span>
            <span className="text-[10px] text-gray-400">{cat.count} produk</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
