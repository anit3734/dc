import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Script from "next/script";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const email = (session.user as any)?.email || "";

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Left Sidebar - Fixed */}
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[50]">
        <Sidebar userEmail={email} />
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="md:pl-72 flex flex-col flex-1 w-0 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 min-h-full">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
