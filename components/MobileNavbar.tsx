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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 md:hidden bg-[#0a0c10] border-b border-white/5 shadow-2xl">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-white/5 rounded-xl border border-white/5">
              <Menu size={20} />
            </Button>
          } />
          <SheetContent side="left" className="p-0 border-none w-72 bg-[#0a0c10]">
            <SheetHeader className="sr-only">
              <SheetTitle>Mission Navigation</SheetTitle>
            </SheetHeader>
            <Sidebar userEmail={userEmail} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2.5">
           <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <BarChart3 size={18} className="text-white" />
           </div>
           <span className="text-lg font-black tracking-tighter text-white uppercase italic leading-none">Zauba<span className="text-indigo-400">Scope</span></span>
        </div>
      </div>

      <Link href="/dashboard/profile" className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-indigo-400 hover:bg-white/10 transition-all shadow-lg">
         {userEmail.charAt(0).toUpperCase()}
      </Link>
    </div>
  );
}
