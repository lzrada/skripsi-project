// src/service/payment.service.ts

export const createMidtransTransaction = async (payload: {
  items: any[];
  user: { name: string; email: string };
  totalPrice: number;
  paymentType?: "transfer" | "kartu" | "ewallet"; // tambahan: filter popup Midtrans
}) => {
  const res = await fetch("/api/midtrans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Gagal create transaksi");

  return res.json();
};
