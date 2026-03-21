import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { exec } from "child_process";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { type = "state", query = "", roc = "", limit = 20 } = await req.json().catch(() => ({}));

    // Start background extraction using the highly-reliable terminal scraper
    const scraperPath = path.join(process.cwd(), "targeted_scraper.js");
    const userId = (session.user as any).id;
    
    // Command generation: pass arguments so targeted_scraper.js knows what to do
    // Wrap arguments in quotes to handle spaces
    const targetType = type === "state" ? `--state="${roc || query}"` : `--company="${query}"`;
    const targetLimit = `--limit=${limit}`;
    const targetUser = `--userId="${userId}"`;
    
    const cmd = `node "${scraperPath}" ${targetType} ${targetLimit} ${targetUser}`;
    
    // Spawn the background process. We don't wait for it to finish!
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
         console.error(`[Scraper Background Error]: ${error.message}`);
         return;
      }
      if (stderr) console.error(`[Scraper Background Stderr]: ${stderr}`);
      console.log(`[Scraper Background Output]: ${stdout}`);
    });

    // Return to the client immediately so Next.js doesn't timeout
    return NextResponse.json({ 
      message: "Extraction sequence initiated in the background. Matrix data will populate in real-time.",
      status: "started"
    }, { status: 200 });

  } catch (error) {
    console.error("Scraper initiation failed:", error);
    return NextResponse.json({ message: "Engine Failure" }, { status: 500 });
  }
}
