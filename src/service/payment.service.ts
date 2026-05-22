export const createMidtransTransaction = async (payload: {
  items: any[];
  user: { name: string; email: string };
  totalPrice: number;
  paymentType?: "transfer" | "kartu" | "ewallet";
  diskonKupon?: number;
  couponCode?: string;
  shippingFee?: number;
}) => {
  const res = await fetch("/api/midtrans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Gagal create transaksi");

  return res.json();
};

export type SnapResult = { status: "success"; result: Record<string, any> } | { status: "pending"; result: Record<string, any> } | { status: "close" } | { status: "error" };

export const openMidtransSnap = (token: string): Promise<SnapResult> => {
  return new Promise((resolve) => {
    window.snap.pay(token, {
      onSuccess: (result: Record<string, any>) => {
        resolve({ status: "success", result });
      },
      onPending: (result: Record<string, any>) => {
        resolve({ status: "pending", result });
      },
      onClose: () => {
        resolve({ status: "close" });
      },
      onError: () => {
        resolve({ status: "error" });
      },
    });
  });
};
