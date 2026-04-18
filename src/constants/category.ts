import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faTv, faSnowflake, faWind, faRotate, faFan, faVolumeHigh, faLaptop, faMobileScreen, faBox } from "@fortawesome/free-solid-svg-icons";

export const categoryIcon: Record<string, IconDefinition> = {
  Televisi: faTv,
  Kulkas: faSnowflake,
  AC: faWind,
  "Mesin Cuci": faRotate,
  "Kipas Angin": faFan,
  Audio: faVolumeHigh,
  Laptop: faLaptop,
  HP: faMobileScreen,
};

export const categoryGradient: Record<string, string> = {
  Televisi: "from-slate-700 to-slate-900",
  Kulkas: "from-cyan-600 to-blue-800",
  AC: "from-sky-500 to-blue-700",
  "Mesin Cuci": "from-teal-600 to-emerald-800",
  "Kipas Angin": "from-indigo-500 to-violet-700",
  Audio: "from-pink-600 to-rose-800",
  Laptop: "from-gray-700 to-gray-900",
  HP: "from-emerald-600 to-teal-800",
};

export const defaultCategoryIcon = faBox;
export const defaultGradient = "from-gray-600 to-gray-800";
