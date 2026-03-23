import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Fetch latest 10 logs specific to the user
    const savedEntities = await prisma.userSavedEntity.findMany({
      where: { userId },
      take: 10,
      orderBy: { savedAt: 'desc' },
      include: {
        company: {
          select: {
            cin: true,
            name: true,
            state: true,
            registration_date: true
          }
        }
      }
    });

    const latestCompanies = savedEntities.map(entity => entity.company);
    return NextResponse.json(latestCompanies);
  } catch (error) {
    console.error("Logs Error:", error);
    return NextResponse.json({ message: "Error fetching logs" }, { status: 500 });
  }
}
