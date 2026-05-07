const badges = [
  { icon: "🔒", text: "Transaksi Aman" },
  { icon: "✅", text: "Garansi Toko" },
  { icon: "🚚", text: "Gratis Ongkir" },
];

export default function TrustBadges() {
  return (
    <div className="bg-gray-50 rounded-2xl p-3 flex items-center justify-center gap-4 text-center">
      {badges.map((b) => (
        <div key={b.text} className="flex flex-col items-center gap-1">
          <span className="text-lg">{b.icon}</span>
          <span className="text-[10px] font-medium text-gray-500">{b.text}</span>
        </div>
      ))}
    </div>
  );
}
