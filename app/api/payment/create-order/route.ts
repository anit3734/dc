import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock123",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret123",
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { amount = 500, type = "export", targetId = null } = await req.json().catch(() => ({}));

    // Create an order in Razorpay
    const options = {
      amount: amount * 100, // in paisa
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save pending payment record in db
    await prisma.payment.create({
      data: {
        id: order.id,
        amount: amount,
        status: "created",
        type: type,
        targetId: targetId,
        userId: (session.user as any)?.id,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
