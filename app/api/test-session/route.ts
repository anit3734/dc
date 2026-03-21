import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const cookies = req.headers.get("cookie");
  
  return NextResponse.json({
    hasSession: !!session,
    user: session?.user?.email || null,
    rawCookies: cookies,
    userAgent: req.headers.get("user-agent"),
    nextAuthUrl: process.env.NEXTAUTH_URL,
  });
}
