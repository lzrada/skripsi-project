import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

const ENABLED_PAYMENTS: Record<string, string[]> = {
  transfer: ["bca_va", "bni_va", "bri_va", "permata_va", "mandiri_bill", "other_va"],
  kartu: ["credit_card"],
  ewallet: ["gopay", "shopeepay", "dana", "ovo"],
};

function createSnapClient() {
  return new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
  });
}

function createCoreClient() {
  return new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
  });
}

// ── POST /api/midtrans → buat transaksi baru ──────────────────────────────────
export async function POST(req: Request) {
  try {
    const { items, user, totalPrice, paymentType, diskonKupon, couponCode, shippingFee } = await req.json();

    const snap = createSnapClient();

    // Hitung total dari item_details agar cocok dengan gross_amount Midtrans
    const itemDetails: any[] = items.map((item: any) => ({
      id: item.id,
      price: item.price,
      quantity: item.qty,
      name: item.name.substring(0, 50),
    }));

    // Tambahkan ongkir sebagai item jika ada
    if (shippingFee && shippingFee > 0) {
      itemDetails.push({
        id: "SHIPPING",
        price: shippingFee,
        quantity: 1,
        name: "Ongkos Kirim",
      });
    }

    // Tambahkan diskon kupon sebagai item negatif agar gross_amount cocok
    if (diskonKupon && diskonKupon > 0) {
      itemDetails.push({
        id: "COUPON",
        price: -diskonKupon,
        quantity: 1,
        name: couponCode ? `Diskon Kupon (${couponCode})`.substring(0, 50) : "Diskon Kupon",
      });
    }

    const parameter: any = {
      transaction_details: {
        order_id: `ORDER-${Date.now()}`,
        gross_amount: totalPrice,
      },
      credit_card: { secure: true },
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
      item_details: itemDetails,
    };

    if (paymentType && ENABLED_PAYMENTS[paymentType]) {
      parameter.enabled_payments = ENABLED_PAYMENTS[paymentType];
    }

    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({ token: transaction.token });
  } catch (error) {
    console.error("Midtrans POST Error:", error);
    return NextResponse.json({ error: "Gagal membuat transaksi" }, { status: 500 });
  }
}

// ── DELETE /api/midtrans → refund / batalkan transaksi ────────────────────────
export async function DELETE(req: Request) {
  try {
    const { orderId, amount, reason } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId wajib diisi" }, { status: 400 });
    }

    const core = createCoreClient();

    let result;
    try {
      result = await (core as any).refund(orderId, {
        refund_key: `REFUND-${orderId}-${Date.now()}`,
        amount: amount,
        reason: reason ?? "Pesanan dibatalkan oleh pelanggan",
      });
    } catch {
      // Fallback: cancel transaksi yang belum settlement
      result = await (core as any).transaction.cancel(orderId);
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Midtrans DELETE Error:", error);
    return NextResponse.json({ error: error?.message ?? "Gagal memproses refund" }, { status: 500 });
  }
}
