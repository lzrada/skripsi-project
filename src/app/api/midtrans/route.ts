import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { items, user, totalPrice } = body;

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

    const orderId = `ORDER-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalPrice,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
      item_details: items.map((item: any) => ({
        id: item.id,
        price: item.price,
        quantity: item.qty,
        name: item.name,
      })),
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      orderId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
