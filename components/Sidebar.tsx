"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Settings2, CloudDownload, LogOut, UserCircle2, Menu, X, ShieldAlert, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const routes = [
  { label: "Dashboard",       icon: BarChart3,      href: "/dashboard"          },
  { label: "Profile Hub",     icon: UserCircle2,    href: "/dashboard/profile"  },
  { label: "Control Center",  icon: Settings2,      href: "/dashboard/admin"    },
  { label: "Export History",  icon: CloudDownload,  href: "/dashboard/downloads"},
];

interface SidebarProps { userEmail: string; }

function SidebarContent({ userEmail, onNavigate }: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = userEmail.split("@")[0] || "User";
  const initials = userName.substring(0, 2).toUpperCase();
  const isDark = theme === "dark";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e293b] font-sans selection:bg-[#0085db]/10 relative border-r border-[#e5eaef] dark:border-[#334155]">
      
      <div className="px-5 py-8 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-10 px-1">
          <div className="w-10 h-10 rounded-xl bg-[#ecf2ff] dark:bg-[#0085db]/20 flex items-center justify-center shadow-sm shrink-0">
            <ShieldAlert size={20} className="text-[#0085db]" />
          </div>
          <div className="flex flex-col truncate">
            <h1 className="text-[18px] font-bold tracking-tight text-[#2a3547] dark:text-white leading-none truncate">
              Zauba<span className="text-[#0085db]">Insights</span>
            </h1>
            <span className="text-[11px] font-medium text-[#707eae] dark:text-slate-400 truncate mt-1">Intelligence Suite</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="space-y-1.5">
          {routes.map((route) => {
            const active = pathname === route.href;
            return (
              <Link key={route.href} href={route.href} onClick={onNavigate}
                className={cn(
                  "group flex items-center h-11 px-4 w-full text-[14px] font-semibold transition-all relative rounded-xl",
                  active
                    ? "text-[#0085db] bg-[#ecf2ff] dark:bg-[#0085db]/20"
                    : "text-[#2a3547] dark:text-slate-300 hover:text-[#0085db] hover:bg-[#f6f9fc] dark:hover:bg-[#0085db]/10"
                )}
              >
                <route.icon className={cn("h-5 w-5 mr-3 transition-colors shrink-0", active ? "text-[#0085db]" : "text-[#2a3547] dark:text-slate-400 group-hover:text-[#0085db]")} />
                <span className="tracking-tight truncate">{route.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-4 border-t border-[#e5eaef] dark:border-[#334155] bg-[#f9fafb] dark:bg-[#1e293b] space-y-3">

        {/* User Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#e5eaef] dark:border-[#334155] shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-[#ecf2ff] dark:bg-[#0085db]/20 flex items-center justify-center shrink-0">
            <span className="text-[12px] font-bold text-[#0085db] tracking-wider">{initials}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-[#2a3547] dark:text-white truncate leading-tight capitalize">{userName}</span>
            <span className="text-[11px] text-[#707eae] dark:text-slate-400 truncate">{userEmail}</span>
          </div>
        </div>

        <button onClick={() => signOut({ callbackUrl: "/login" })} 
          className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-[13px] font-bold text-[#707eae] bg-white dark:bg-[#0f172a] hover:bg-red-50 hover:text-red-500 border border-[#e5eaef] dark:border-[#334155] hover:border-red-200 transition-all shadow-sm">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ userEmail }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Content Only */}
      <div className="flex flex-col h-full w-full">
        <SidebarContent userEmail={userEmail} />
      </div>
    </>
  );
}
