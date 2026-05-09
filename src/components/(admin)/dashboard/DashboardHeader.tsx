export function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Selamat datang kembali — berikut ringkasan toko hari ini.</p>
      </div>
      <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm text-sm text-slate-600 self-start sm:self-auto">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="font-medium">Live Update</span>
      </div>
    </div>
  );
}
