import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

const ENABLED_PAYMENTS: Record<string, string[]> = {
  transfer: ["bca_va", "bni_va", "bri_va", "permata_va", "mandiri_bill", "other_va"],
  kartu: ["credit_card"],
  ewallet: ["gopay", "shopeepay", "dana", "ovo"],
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, user, totalPrice, paymentType } = body;

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

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
      item_details: items.map((item: any) => ({
        id: item.id,
        price: item.price,
        quantity: item.qty,
        name: item.name.substring(0, 50),
      })),
    };

    if (paymentType && ENABLED_PAYMENTS[paymentType]) {
      parameter.enabled_payments = ENABLED_PAYMENTS[paymentType];
    }

    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({ token: transaction.token });
  } catch (error) {
    console.error("Midtrans Error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
