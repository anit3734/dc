"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, Lock, BarChart3, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
           <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-4 rotate-3">
              <BarChart3 size={28} className="text-white" />
           </div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">
             Zauba<span className="text-indigo-600">Insights</span>
           </h1>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Intelligence Axis</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-10 rounded-[32px] shadow-2xl shadow-indigo-500/5 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />
          
          <div className="mb-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">System Authentication</h2>
            <p className="text-sm text-slate-500 font-medium">Access your corporate intelligence vault.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold px-4 py-3 rounded-xl flex items-center gap-2 animate-in shake duration-300">
                 <ShieldCheck size={14} /> {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Email Identity</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                   <input
                     type="email"
                     required
                     className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-slate-900 font-semibold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-sm"
                     placeholder="name@company.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                   />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Security Key</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                   <input
                     type="password"
                     required
                     className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-slate-900 font-semibold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-sm"
                     placeholder="••••••••"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                   />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group active:scale-95"
              disabled={loading}
            >
              {loading ? (
                <RefreshCcw className="animate-spin" size={18} />
              ) : (
                <>
                  Establish Connection
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            
            <div className="pt-4 text-center">
              <p className="text-[11px] font-bold text-slate-400">
                New to the Axis?{" "}
                <Link href="/register" className="text-indigo-600 hover:underline underline-offset-4 decoration-2">
                  Create Registry Account
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer Disclaimer */}
        <p className="mt-8 text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">
           Controlled Access • MCA Data Node 5.1
        </p>
      </div>
    </div>
  );
}

function RefreshCcw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}
