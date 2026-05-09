interface InventorySearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function InventorySearchBar({ search, onSearchChange }: InventorySearchBarProps) {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Cari nama produk..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full sm:w-80 border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
      />
    </div>
  );
}
