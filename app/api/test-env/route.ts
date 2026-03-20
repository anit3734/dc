import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = process.env.DATABASE_URL || "NOT_SET";
    
    let columns: any = null;
    let queryError: any = null;
    
    try {
      columns = await prisma.$queryRaw`SHOW COLUMNS FROM Company`;
    } catch (e: any) {
      queryError = e.message;
    }

    return NextResponse.json({
      DATABASE_URL: url.replace(/:[^:@]+@/, ":***@"), // hide password
      columns: columns?.map((c: any) => c.Field),
      queryError
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
