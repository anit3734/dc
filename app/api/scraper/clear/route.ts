import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Multi-tenant isolation: only clear data linked to THIS specific user
    const result = await prisma.userSavedEntity.deleteMany({
      where: { userId }
    });
    
    return NextResponse.json({ 
      message: "Personal archive cleared successfully", 
      count: result.count 
    });
  } catch (error) {
    console.error("Clear Error:", error);
    return NextResponse.json({ message: "Error clearing database" }, { status: 500 });
  }
}
