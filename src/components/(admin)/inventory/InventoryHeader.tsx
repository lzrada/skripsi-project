export function InventoryHeader() {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Monitoring Stok Inventori</h1>
      <p className="text-gray-500 text-sm mt-1">
        Pemantauan stok menggunakan metode <span className="font-semibold text-[#1E2753]">Reorder Point (ROP)</span> & algoritma <span className="font-semibold text-[#1E2753]">Inventory First</span>
      </p>
    </div>
  );
}
