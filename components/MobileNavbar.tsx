"use client";

import { Menu, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState } from "react";

export function MobileNavbar({ userEmail }: { userEmail: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 md:hidden bg-white dark:bg-[#0f172a] border-b border-[#e5eaef] dark:border-[#334155] shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger>
            <div className="text-[#707eae] dark:text-slate-400 hover:bg-[#ecf2ff] dark:hover:bg-[#0085db]/10 rounded-xl border border-[#e5eaef] dark:border-[#334155] h-10 w-10 flex items-center justify-center cursor-pointer">
              <Menu size={20} />
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-none w-[220px] bg-white dark:bg-[#1e293b]">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <Sidebar userEmail={userEmail} onNavigate={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2.5">
           <div className="w-9 h-9 bg-[#ecf2ff] dark:bg-[#0085db]/20 rounded-xl flex items-center justify-center border border-[#d1e1ff]">
             <BarChart3 size={18} className="text-[#0085db]" />
           </div>
           <span className="text-lg font-bold tracking-tight text-[#2a3547] dark:text-white leading-none">Zauba<span className="text-[#0085db]">Insights</span></span>
        </div>
      </div>

      <Link href="/dashboard/profile" className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-blue-300 hover:bg-white/10 transition-all shadow-lg">
         {userEmail.charAt(0).toUpperCase()}
      </Link>
    </div>
  );
}
