"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Settings2,
  CloudDownload,
  LogOut,
  Zap,
  ChevronRight,
  UserCircle2,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: BarChart3,
      href: "/dashboard",
    },
    {
      label: "Profile Hub",
      icon: UserCircle2,
      href: "/dashboard/profile",
    },
    {
      label: "Control Center",
      icon: Settings2,
      href: "/admin",
    },
    {
      label: "Export History",
      icon: CloudDownload,
      href: "/dashboard/downloads",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-sm">
      <div className="px-6 py-10 flex-1 overflow-y-auto">
        {/* Branding */}
        <Link href="/dashboard" className="flex items-center gap-2.5 mb-10 group px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-all duration-500 shadow-md shadow-indigo-500/10">
            <BarChart3 size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
              Zauba<span className="text-indigo-600">Insights</span>
            </h1>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Intelligence Suite</span>
          </div>
        </Link>

        {/* Navigation Axis */}
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group flex items-center p-3 w-full justify-start font-bold text-xs rounded-xl transition-all duration-200",
                pathname === route.href
                  ? "text-indigo-600 bg-indigo-50 border border-indigo-100 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-4 w-4 mr-3 transition-colors", pathname === route.href ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                <span className="tracking-tight">{route.label}</span>
              </div>
              {pathname === route.href && (
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
              )}
            </Link>
          ))}
        </div>

      </div>

      {/* User Console - Light Glassmorphism */}
      <div className="px-4 pb-12 pt-6 bg-slate-50 border-t border-slate-200 mt-auto">
        <div className="flex flex-col gap-4">
          <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all group/user">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover/user:scale-105 transition-transform">
              <UserCircle2 size={24} />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[11px] font-bold text-slate-900 uppercase truncate tracking-tight group-hover/user:text-indigo-600 transition-colors">{userEmail.split('@')[0]}</span>
              <span className="text-[9px] font-medium text-slate-400 truncate tracking-tight lowercase">{userEmail}</span>
            </div>
          </Link>

          <Button
            onClick={() => signOut({ callbackUrl: "/login" })}
            variant="outline"
            className="w-full justify-center gap-2 h-11 border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all rounded-xl font-bold text-[10px] uppercase tracking-[0.1em]"
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
