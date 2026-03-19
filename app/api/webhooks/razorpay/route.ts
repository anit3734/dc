import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret123";

    // Verify signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: razorpay_order_id },
      data: { status: "paid" },
    });

    return NextResponse.json({ message: "Payment verified successfully" });
  } catch (error) {
    console.error("Webhook Verification Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
