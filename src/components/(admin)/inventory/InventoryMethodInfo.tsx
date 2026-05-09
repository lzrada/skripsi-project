import { IoBarChartSharp } from "react-icons/io5";

export function InventoryMethodInfo() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3">
      <span className="text-2xl">
        <IoBarChartSharp />
      </span>
      <div>
        <p className="text-sm font-bold text-blue-800">Metode Reorder Point</p>
        <p className="text-xs text-blue-600 mt-0.5">
          Sistem akan memberi peringatan otomatis saat stok suatu produk menyentuh atau di bawah nilai ROP. <span className="font-semibold">Rumus: ROP = Rata-rata Penjualan Harian × Lead Time</span>. Klik tombol <strong>Atur ROP</strong>{" "}
          pada tiap produk untuk menyesuaikan nilainya.
        </p>
      </div>
    </div>
  );
}
