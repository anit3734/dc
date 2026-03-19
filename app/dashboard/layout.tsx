import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Script from "next/script";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <nav className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <Link href="/dashboard" className="font-bold text-2xl text-indigo-700">
          Zauba Dashboard
        </Link>
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-zinc-600 hidden md:inline-block">
            {(session.user as any)?.email}
          </span>
          <Link href="/admin"><Button variant="ghost">Admin</Button></Link>
          <Link href="/downloads"><Button variant="ghost">Downloads</Button></Link>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
