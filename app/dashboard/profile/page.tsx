"use client";

import { useSession, signOut } from "next-auth/react";
import { 
  UserCircle2, 
  LogOut, 
  ShieldCheck, 
  Mail, 
  Database, 
  Clock, 
  Key,
  CreditCard,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session) return null;

  const email = session.user?.email || "";
  const username = email.split("@")[0];
  const role = (session.user as any)?.role || "user";
  const initials = username.split(/[._\-]/).map(p => p[0]?.toUpperCase() || "").slice(0, 2).join("") || username[0]?.toUpperCase() || "U";

  return (
    <div className="max-w-xl mx-auto py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Centered Profile Card */}
      <div className="bg-white border border-slate-200 rounded-[32px] shadow-2xl shadow-indigo-500/5 overflow-hidden">
        
        {/* Header/Avatar Area */}
        <div className="p-10 pb-6 text-center">
           <div className="mx-auto h-24 w-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl mb-6 ring-8 ring-indigo-50">
             {initials}
           </div>
           <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tight">{username}</h2>
           <p className="text-slate-400 font-medium mt-1 leading-none">{email}</p>
           
           <div className="mt-4 flex justify-center">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                 <ShieldCheck size={12} className="mr-1.5" /> {role} Account
              </Badge>
           </div>
        </div>

        {/* Essential Info Grid */}
        <div className="px-10 py-8 border-t border-slate-50 grid grid-cols-2 gap-4">
           <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Status</span>
              <p className="font-bold text-slate-900 text-sm italic flex items-center gap-2">
                 <Target size={14} className="text-indigo-600 not-italic" /> Verified Access
              </p>
           </div>
           <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Member Since</span>
              <p className="font-bold text-slate-900 text-sm">
                 { (session.user as any).createdAt ? new Date((session.user as any).createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric', day: 'numeric' }) : 'Mar 20, 2026' }
              </p>
           </div>
        </div>

        {/* Actions Area */}
        <div className="p-10 pt-0 flex flex-col gap-3">
           <Button
             onClick={() => signOut({ callbackUrl: "/login" })}
             variant="outline"
             className="w-full h-14 font-black text-xs uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 rounded-2xl"
           >
             <LogOut size={16} className="mr-3" />
             Sign Out Account
           </Button>
           <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-4">
              ZaubaInsights Secure Console v6.0
           </p>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant, className }: any) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
