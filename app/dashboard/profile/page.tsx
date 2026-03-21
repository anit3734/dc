"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  UserCircle2, ShieldCheck, LogOut, Download, Building2,
  FileSpreadsheet, FileText, CheckCircle2, Clock4, MapPin, Phone,
  PieChart as PieChartIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ThemeToggle } from "@/components/theme-toggle";

// Circular Progress Component for Quotas
function CircularProgress({ value, max, label, color, bg }: { value: number, max: number, label: string, color: string, bg: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="40" cy="40" r={radius} className="fill-none stroke-[#f4f7fb] dark:stroke-[#334155]" strokeWidth="6" />
          <circle 
            cx="40" 
            cy="40" 
            r={radius} 
            className={cn("fill-none transition-all duration-1000 ease-out", color)} 
            strokeWidth="6" 
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[14px] font-black text-[#2a3547] dark:text-[#e2e8f0]">{Math.round(pct)}%</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-[#707eae] uppercase tracking-widest leading-none">{label}</span>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-[16px] font-black text-[#2a3547] dark:text-[#e2e8f0] leading-none">{value}</span>
          <span className="text-[10px] text-[#707eae] font-bold">/ {max}</span>
        </div>
      </div>
    </div>
  );
}

interface DownloadRecord {
  id: string;
  file: string;
  createdAt: string;
}

export default function ProfileHub() {
  const { data: session } = useSession();

  const [downloads, setDownloads]   = useState<DownloadRecord[]>([]);
  const [totalEntities, setTotal]   = useState(0);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dlRes, statsRes] = await Promise.all([
          fetch("/api/downloads"),
          fetch("/api/companies/stats"),
        ]);
        const dl    = await dlRes.json();
        const stats = await statsRes.json();
        if (Array.isArray(dl)) setDownloads(dl);
        if (stats?.totalCompanies) setTotal(stats.totalCompanies);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  if (!session) return null;

  const email        = session.user?.email || "user@example.com";
  const username     = email.split("@")[0];
  const role         = (session.user as any)?.role || "User";
  const initials     = username.substring(0, 2).toUpperCase();
  const excelCount   = downloads.filter(d => d.file?.endsWith(".xlsx")).length;
  const csvCount     = downloads.filter(d => d.file?.endsWith(".csv")).length;
  const totalExports = downloads.length;
  const recentDls    = [...downloads].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const joinDate = (session.user as any)?.createdAt
    ? new Date((session.user as any).createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "Mar 2026";

  const val = (v: number | string) =>
    loading
      ? <span className="inline-block w-8 h-5 bg-[#e5eaef] dark:bg-slate-700 rounded animate-pulse" />
      : v;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#f4f7fb] dark:bg-[#0f172a]">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b border-[#e5eaef] dark:border-[#334155] py-3 px-4 sm:px-8 bg-white dark:bg-[#0f172a] shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 bg-[#ecf2ff] dark:bg-[#0085db]/10 border border-[#d1e1ff] dark:border-[#0085db]/30 rounded-lg">
            <UserCircle2 size={16} className="text-[#0085db]" />
          </div>
          <h1 className="text-[14px] font-bold text-[#2a3547] dark:text-[#e2e8f0] leading-none">Profile Hub</h1>
          <span className="text-[11px] text-[#707eae] dark:text-slate-400 hidden xs:inline">/ Account overview & export activity</span>
        </div>
        <div className="ml-auto pl-2 border-l border-[#e5eaef] dark:border-[#334155] h-6 flex items-center">
          <ThemeToggle />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* ══ LEFT COLUMN ══════════════════════════ */}
          <div className="col-span-full lg:col-span-4 flex flex-col gap-3">

            {/* User Card */}
            <div className="bg-white dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-2xl shrink-0">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e5eaef] dark:border-[#334155] bg-gradient-to-r from-[#ecf2ff] to-white dark:from-[#0085db]/10 dark:to-[#1e293b]">
                <div className="h-10 w-10 rounded-xl bg-[#0085db] flex items-center justify-center text-white text-[14px] font-black shrink-0 shadow-md shadow-[#0085db]/20">
                  {initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-bold text-[#2a3547] dark:text-[#e2e8f0] capitalize truncate leading-none">{username}</span>
                  <span className="text-[11px] text-[#707eae] truncate mt-0.5">{email}</span>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="flex items-center gap-1 bg-[#ecf2ff] text-[#0085db] border border-[#d1e1ff] px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide">
                      <ShieldCheck size={9} /> {role}
                    </span>
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide">
                      <CheckCircle2 size={9} /> Verified
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#e5eaef] dark:divide-[#334155] px-4 py-2.5">
                <div className="pr-3">
                  <span className="text-[9px] font-black text-[#707eae] uppercase tracking-widest block">Plan</span>
                  <span className="text-[12px] font-black text-[#2a3547] dark:text-[#e2e8f0] mt-0.5 block">{role === "Admin" ? "Enterprise" : "Standard"}</span>
                </div>
                <div className="pl-3">
                  <span className="text-[9px] font-black text-[#707eae] uppercase tracking-widest block">Member Since</span>
                  <span className="text-[12px] font-black text-[#2a3547] dark:text-[#e2e8f0] mt-0.5 block">{joinDate}</span>
                </div>
              </div>
            </div>

            {/* Account Details — all derived from session or environment */}
            <div className="bg-white dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-2xl shrink-0 overflow-hidden">
              <div className="px-5 py-2.5 border-b border-[#e5eaef] dark:border-[#334155] bg-[#f9fafb] dark:bg-[#0f172a]">
                <span className="text-[9px] font-black text-[#707eae] uppercase tracking-[0.15em]">Account Details</span>
              </div>
              {[
                { icon: UserCircle2, label: "Username",    value: username },
                { icon: MapPin,      label: "Email",       value: email },
                { icon: Phone,       label: "Role",        value: role },
                { icon: Clock4,      label: "Timezone",    value: "Asia/Kolkata (IST)" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5 px-4 py-2 border-b last:border-0 border-[#e5eaef] dark:border-[#334155]">
                  <div className="h-6 w-6 rounded-lg bg-[#ecf2ff] border border-[#d1e1ff] flex items-center justify-center shrink-0">
                    <Icon size={11} className="text-[#0085db]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-black text-[#707eae] uppercase tracking-widest block leading-none">{label}</span>
                    <span className="text-[11px] font-bold text-[#2a3547] dark:text-[#e2e8f0] truncate block mt-0.5">{value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Session Info + Sign Out — grows to fill remaining space */}
            <div className="bg-white dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-2xl flex-1 overflow-hidden flex flex-col">
              <div className="px-5 py-2.5 border-b border-[#e5eaef] dark:border-[#334155] bg-[#f9fafb] dark:bg-[#0f172a] shrink-0">
                <span className="text-[9px] font-black text-[#707eae] uppercase tracking-[0.15em]">Session Info</span>
              </div>

              {/* Branding graphic fills the flex-1 space */}
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5">
                <div className="h-14 w-14 rounded-2xl bg-[#ecf2ff] dark:bg-[#0085db]/20 border border-[#d1e1ff] dark:border-[#0085db]/30 flex items-center justify-center shadow-sm">
                  <ShieldCheck size={26} className="text-[#0085db]" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-black text-[#2a3547] dark:text-[#e2e8f0]">Session Active</p>
                  <p className="text-[11px] text-[#707eae] mt-1">Logged in as <span className="font-bold capitalize">{username}</span></p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full mt-1">
                  <div className="bg-[#f4f7fb] dark:bg-[#0f172a] border border-[#e5eaef] dark:border-[#334155] rounded-xl px-3 py-2.5 text-center">
                    <span className="text-[9px] font-black text-[#707eae] uppercase tracking-widest block">Role</span>
                    <span className="text-[12px] font-black text-[#0085db] capitalize mt-0.5 block">{role}</span>
                  </div>
                  <div className="bg-[#f4f7fb] dark:bg-[#0f172a] border border-[#e5eaef] dark:border-[#334155] rounded-xl px-3 py-2.5 text-center">
                    <span className="text-[9px] font-black text-[#707eae] uppercase tracking-widest block">Exports</span>
                    <span className="text-[12px] font-black text-emerald-500 mt-0.5 block">{totalExports}</span>
                  </div>
                </div>
              </div>

              {/* Sign Out at bottom */}
              <div className="px-5 py-4 border-t border-[#e5eaef] dark:border-[#334155] shrink-0">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full h-9 flex items-center justify-center gap-2 rounded-xl text-[12px] font-bold text-[#707eae] bg-white dark:bg-[#0f172a] hover:bg-red-50 hover:text-red-500 border border-[#e5eaef] dark:border-[#334155] hover:border-red-200 transition-all"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* ══ RIGHT COLUMN ════════════════════════ */}
          <div className="col-span-full lg:col-span-8 flex flex-col gap-4">

            {/* Overview Stats with Chart */}
            <div className="bg-white dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-2xl flex-1 overflow-hidden flex flex-col">
               <div className="px-5 py-3 border-b border-[#e5eaef] dark:border-[#334155] bg-[#f9fafb] dark:bg-[#0f172a] shrink-0">
                <span className="text-[9px] font-black text-[#707eae] uppercase tracking-[0.15em]">Overview Data</span>
              </div>
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-between p-6 gap-8">
                
                {/* Left Side: Semi-Circle Gauge for Entities */}
                <div className="w-full sm:w-1/2 h-[160px] flex items-end justify-center relative pb-2 group">
                   {totalEntities > 0 ? (
                     <ResponsiveContainer width="100%" height={160}>
                       <PieChart>
                         <Pie
                           data={[
                             { name: 'Secured Entities', value: totalEntities, color: '#0085db' },
                             { name: 'Database Capacity', value: Math.max((Math.ceil(totalEntities / 1000) * 1000) - totalEntities, 0), color: '#f4f7fb' }
                           ]}
                           cx="50%"
                           cy="85%"
                           startAngle={180}
                           endAngle={0}
                           innerRadius={70}
                           outerRadius={95}
                           paddingAngle={0}
                           dataKey="value"
                           stroke="none"
                         >
                           <Cell fill="#0085db" />
                           <Cell className="fill-[#e5eaef] dark:fill-[#334155]/50" />
                         </Pie>
                         <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e5eaef', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#2a3547' }}
                            cursor={false}
                         />
                       </PieChart>
                     </ResponsiveContainer>
                   ) : (
                     <div className="flex flex-col items-center justify-center text-center opacity-40 h-full">
                        <Building2 size={48} className="text-[#707eae] mb-2" />
                        <span className="text-[11px] font-bold text-[#707eae] uppercase tracking-widest block">Awaiting Data</span>
                     </div>
                   )}
                   
                   {/* Centered Total inside Gauge */}
                   {totalEntities >= 0 && (
                     <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center justify-center pointer-events-none transition-transform group-hover:scale-105">
                       <span className="text-[28px] font-black text-[#2a3547] dark:text-[#e2e8f0] leading-none tracking-tight">{val(totalEntities.toLocaleString())}</span>
                       <span className="text-[9px] font-black text-[#707eae] uppercase tracking-widest mt-1.5 flex items-center gap-1"><Building2 size={10} className="text-[#0085db]" /> Total Matrix</span>
                     </div>
                   )}
                </div>

                {/* Right Side: Export Distribution Chart */}
                <div className="w-full sm:w-1/2 h-full flex items-center justify-center relative">
                   {totalExports > 0 ? (
                     <ResponsiveContainer width="100%" height={160}>
                       <PieChart>
                         <Pie
                           data={[
                             { name: 'Excel Exports', value: excelCount, color: '#10b981' },
                             { name: 'CSV Exports', value: csvCount, color: '#0085db' }
                           ]}
                           cx="50%"
                           cy="50%"
                           innerRadius={50}
                           outerRadius={75}
                           paddingAngle={4}
                           dataKey="value"
                           stroke="none"
                         >
                           <Cell fill="#10b981" />
                           <Cell fill="#0085db" />
                         </Pie>
                         <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e5eaef', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#2a3547' }}
                         />
                       </PieChart>
                     </ResponsiveContainer>
                   ) : (
                     <div className="flex flex-col items-center justify-center text-center opacity-40">
                        <PieChartIcon size={64} className="text-[#707eae] mb-2" />
                        <span className="text-[11px] font-bold text-[#707eae] uppercase tracking-widest block">No Telemetry</span>
                     </div>
                   )}
                   {/* Centered Total inside Doughnut */}
                   {totalExports > 0 && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-[20px] font-black text-[#2a3547] dark:text-[#e2e8f0] leading-none">{totalExports}</span>
                       <span className="text-[8px] font-black text-[#707eae] uppercase tracking-widest mt-0.5">Exports</span>
                     </div>
                   )}
                </div>

              </div>
            </div>

            {/* Export Quota — real counts */}
            <div className="bg-white dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-2xl shrink-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-[#e5eaef] dark:border-[#334155] bg-[#f9fafb] dark:bg-[#0f172a] shrink-0">
                <span className="text-[9px] font-black text-[#707eae] uppercase tracking-[0.15em]">System Quota & Usage</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-8 py-6 gap-8 lg:gap-6">
                {/* Replaced linear bars with Circular rings */}
                <CircularProgress value={excelCount} max={500} label="Excel Payload" color="stroke-amber-500" bg="" />
                <CircularProgress value={csvCount} max={500} label="CSV Matrices" color="stroke-purple-500" bg="" />
                <CircularProgress value={totalExports} max={1000} label="Total Exports" color="stroke-[#0085db]" bg="" />
              </div>
              <div className="px-6 pb-6 pt-2 shrink-0 flex items-center justify-between border-t border-[#f4f7fb] dark:border-[#334155]/50 mt-auto">
                <span className="text-[10px] text-[#707eae] font-mono tracking-[0.2em] uppercase">Intelligence Suite Active</span>
                <span className="text-[10px] bg-[#ecfdf5] dark:bg-[#13deb9]/10 text-[#13deb9] px-2 py-0.5 rounded border border-[#d1fae5] dark:border-[#13deb9]/20 font-black uppercase tracking-widest">v6.0</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
