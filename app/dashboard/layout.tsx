import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MobileNavbar } from "@/components/MobileNavbar";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const email = (session.user as any)?.email || "";

  return (
    <div className="h-screen flex bg-background overflow-hidden relative">

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-[220px] flex-col shrink-0 z-[50]">
        <Sidebar userEmail={email} />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <MobileNavbar userEmail={email} />
        <main className="flex-1 relative overflow-y-auto focus:outline-none flex flex-col">
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
