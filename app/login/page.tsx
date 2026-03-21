"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Mail, Lock, Loader2, TerminalSquare, Activity, Globe, Database } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [telemetry, setTelemetry] = useState("0x0000"); // Stable initial state

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTelemetry("0x" + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, "0"));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) { 
      setError("Authentication Refused: Invalid Signatures"); 
      setLoading(false); 
    }
    else router.push("/dashboard");
  };

  // Removed: if (!mounted) return null; // Prevents white screen on mobile

  return (
    <div className="h-screen w-full bg-white text-[#2a3547] font-sans overflow-hidden relative grid grid-cols-1 lg:grid-cols-2">
      
      {/* 1. Branding Panel (Left) - Hidden on mobile, visible on LG+ */}
      <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-[#0085db]">
        {/* Abstract Circles / Decorations */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full border-[40px] border-white/5 pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[300px] h-[300px] rounded-full border-[30px] border-white/5 pointer-events-none" />
        <div className="absolute top-[20%] right-[10%] w-24 h-24 rounded-full bg-white/5 animate-pulse" />
        
        <div className="relative z-10 text-center px-12 max-w-[500px]">
          <div className="mb-10 inline-flex items-center gap-3">
             <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
               <ShieldCheck size={28} className="text-white" />
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-white italic uppercase">Zauba<span className="opacity-80 font-light">Insights</span></h1>
          </div>
          
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">Welcome to the Intelligence Portal</h2>
          <p className="text-white/70 text-lg font-medium mb-10 leading-relaxed">
            Experience next-generation data extraction and analysis with our professional administrative suite.
          </p>
          
          <Link href="/" className="inline-flex items-center justify-center px-8 h-12 bg-white text-[#0085db] font-bold rounded-[32px] hover:bg-opacity-90 transition-all shadow-lg active:scale-95">
            Learn More
          </Link>
        </div>

        {/* Floating Animation Elements */}
        <div className="absolute bottom-10 left-10 flex flex-col gap-4 opacity-30">
           <div className="flex items-center gap-3">
              <Globe size={16} className="text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Global Network</span>
           </div>
           <div className="flex items-center gap-3">
              <Database size={16} className="text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Encrypted Vault</span>
           </div>
        </div>
      </div>

      {/* 2. Login Form Panel (Right) */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-[#f4f7fb]">
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-right duration-700">
           <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-[#e5eaef]">
              
              <div className="mb-10 text-center lg:text-left">
                <h3 className="text-2xl font-bold text-[#2a3547] mb-2 leading-none">Sign In</h3>
                <p className="text-[#707eae] text-sm font-medium">Your account to manage everything</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-[#fff1f2] border border-[#ffe4e6] text-[#e11d48] text-[11px] font-bold px-4 py-3 rounded-xl flex items-center gap-3 animate-shake">
                    <ShieldCheck size={16} /> {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-2 group">
                    <label className="text-[12px] font-bold text-[#2a3547] ml-1 transition-colors group-focus-within:text-[#0085db]">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707eae] group-focus-within:text-[#0085db] transition-colors" size={18} />
                      <input
                        type="email" required
                        className="block w-full h-12 bg-white border border-[#e5eaef] rounded-xl pl-12 pr-4 text-[14px] text-[#2a3547] placeholder:text-[#707eae]/50 focus:outline-none focus:border-[#0085db] focus:ring-4 focus:ring-[#0085db]/5 transition-all font-medium"
                        placeholder="john@example.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[12px] font-bold text-[#2a3547] transition-colors group-focus-within:text-[#0085db]">Password</label>
                      <button type="button" className="text-[11px] font-bold text-[#0085db] hover:underline">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707eae] group-focus-within:text-[#0085db] transition-colors" size={18} />
                      <input
                        type="password" required
                        className="block w-full h-12 bg-white border border-[#e5eaef] rounded-xl pl-12 pr-4 text-[14px] text-[#2a3547] placeholder:text-[#707eae]/50 focus:outline-none focus:border-[#0085db] focus:ring-4 focus:ring-[#0085db]/5 transition-all font-medium"
                        placeholder="••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit" disabled={loading}
                    className="w-full h-12 bg-[#0085db] hover:bg-[#0074c0] active:scale-[0.98] disabled:bg-[#f4f7fb] disabled:text-[#707eae] text-white font-bold text-[14px] rounded-xl shadow-lg shadow-[#0085db]/20 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
                  </button>
                </div>

                <div className="text-center pt-4">
                  <p className="text-[13px] font-medium text-[#707eae]">
                    New to ZaubaInsights?{" "}
                    <Link href="/register" className="text-[#0085db] font-bold hover:underline">
                      Create an account
                    </Link>
                  </p>
                </div>
              </form>
           </div>
           
           <div className="mt-8 text-center text-[11px] text-[#707eae] font-medium">
             &copy; 2026 ZaubaCorp Data Solutions. All rights reserved.
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
      `}} />
    </div>
  );
}
