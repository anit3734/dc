"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Cpu, RefreshCw, Layers, CheckCircle2, XCircle, Zap, History, Trash2, Settings2, Activity, TerminalSquare } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const ROC_LIST = ["Delhi","Mumbai","Kolkata","Bangalore","Chennai","Hyderabad","Ahmedabad","Pune","Jaipur","Chandigarh","Lucknow","Patna","Gwalior","Shillong","Cuttack"];

export default function AdminPage() {
  const [stats, setStats]             = useState<any>(null);
  const [running, setRunning]         = useState(false);
  const [logs, setLogs]               = useState<any[]>([]);
  const [scrapeType, setScrapeType]   = useState<"company"|"state">("state");
  const [targetState, setTargetState] = useState("Delhi");
  const [targetQuery, setTargetQuery] = useState("");
  const [batchLimit, setBatchLimit]   = useState(20);

  const fetchStats = async () => { try { setStats(await (await fetch("/api/scraper/stats")).json()); } catch {} };
  const fetchLogs  = async () => { try { const d = await (await fetch("/api/scraper/logs")).json(); if (Array.isArray(d)) setLogs(d); } catch {} };

  useEffect(() => {
    fetchStats(); fetchLogs();
    const iv = setInterval(() => { fetchStats(); fetchLogs(); }, 3000);
    return () => clearInterval(iv);
  }, []);

  const runScraper = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/scraper/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: scrapeType, query: targetQuery, roc: targetState, limit: batchLimit }),
      });
      const r = await res.json();
      // Keep running state for at least 60 seconds to show active harvesting
      setTimeout(() => setRunning(false), 60000);
      fetchStats(); fetchLogs(); 
    } catch { 
      alert("Connection Error."); 
      setRunning(false); 
    }
  };

  const clearDatabase = async () => {
    if (!confirm("Clear ALL data? Cannot be undone.")) return;
    try { await fetch("/api/scraper/clear", { method: "POST" }); alert("Cleared."); fetchStats(); fetchLogs(); } catch {}
  };

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-[#0f172a] animate-in fade-in duration-300">

      {/* ── Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5eaef] dark:border-[#334155] py-4 px-4 md:px-8 bg-white dark:bg-[#0f172a] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#ecf2ff] border border-[#d1e1ff] rounded-xl flex items-center justify-center">
            <Cpu size={18} className="text-[#0085db]" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-[#2a3547] leading-none">Control Center</h1>
            <p className="text-[11px] text-[#707eae] font-bold uppercase tracking-widest mt-1 leading-none">Extraction Engine v2.0</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f9fafb] border border-[#e5eaef] px-3 py-1.5 rounded-xl">
            <div className={cn("h-2 w-2 rounded-full shrink-0", running ? "bg-[#13deb9] animate-pulse" : "bg-[#0085db]")} />
            <span className={cn("text-[10px] font-black tracking-widest uppercase", running ? "text-[#13deb9]" : "text-[#0085db]")}>
              {running ? "ACTIVE" : "IDLE"}
            </span>
          </div>
          <div className="ml-1 pl-2 border-l border-[#e5eaef] dark:border-[#334155] h-6 flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ── Body ── fills full remaining height */}
      <div className="flex-1 overflow-hidden flex flex-col gap-4 px-6 py-4">

        {/* ── Stats Row ── shrink-0 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
          {[
            { label: "Data Secured",  val: stats?.successCount ?? "—", icon: <CheckCircle2 size={16} className="text-[#13deb9]" />, c: "text-[#13deb9]", bg: "bg-[#ecfdf5]", border: "border-[#d1fae5]" },
            { label: "Failed Locks",  val: stats?.failedCount  ?? "—", icon: <XCircle      size={16} className="text-[#fa896b]" />, c: "text-[#fa896b]", bg: "bg-[#fff5f2]", border: "border-[#ffdbdb]" },
            { label: "Total Handled", val: stats?.totalScraped ?? "—", icon: <Layers        size={16} className="text-[#0085db]" />, c: "text-[#0085db]", bg: "bg-[#ecf2ff]", border: "border-[#d1e1ff]" },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#707eae] uppercase tracking-widest leading-none">{s.label}</span>
                <span className={cn("text-2xl font-black leading-tight tracking-tight", s.c)}>{s.val}</span>
              </div>
              <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center border shrink-0", s.bg, s.border)}>
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── fills remaining height */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">

          {/* Orchestration Panel — fills height */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 min-h-0">
            <div className="bg-white dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0">
              {/* Card Header */}
              <div className="bg-[#f9fafb] dark:bg-[#0f172a] border-b border-[#e5eaef] dark:border-[#334155] px-5 py-3 flex items-center justify-between">
                <h2 className="text-[11px] font-black text-[#2a3547] uppercase tracking-widest flex items-center gap-2 leading-none">
                  <Settings2 size={13} className="text-[#0085db]" /> ORCHESTRATION ENGINE
                </h2>
                <span className="text-[9px] text-[#0085db] font-black tracking-widest uppercase bg-[#ecf2ff] border border-[#d1e1ff] px-2 py-0.5 rounded-full leading-none">
                  STRICT PROTOCOL
                </span>
              </div>

              <div className="p-4 flex flex-col gap-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Target Vector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#707eae] uppercase tracking-widest flex items-center gap-1.5">
                      <TerminalSquare size={11} className="text-[#0085db]" /> Target Vector
                    </label>
                    <Select value={scrapeType} onValueChange={(v) => setScrapeType(v as "company"|"state")}>
                      <SelectTrigger className="w-full h-9 bg-[#f4f7fb] dark:bg-[#0f172a] border-[#e5eaef] dark:border-[#334155] text-[12px] font-bold text-[#2a3547] dark:text-[#e2e8f0] hover:border-[#0085db] transition-all rounded-lg focus:ring-2 focus:ring-[#0085db]/10 shadow-none">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#1e293b] border-[#e5eaef] dark:border-[#334155] text-[#2a3547] dark:text-[#e2e8f0] rounded-xl shadow-xl">
                        <SelectItem value="state" className="text-[12px] font-bold focus:bg-[#f4f7fb] dark:focus:bg-[#0085db]/20">Bulk State Capture</SelectItem>
                        <SelectItem value="company" className="text-[12px] font-bold focus:bg-[#f4f7fb] dark:focus:bg-[#0085db]/20">Specific Node Search</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Region / Query Input */}
                  <div className="space-y-2">
                    {scrapeType === "state" ? (
                      <>
                        <label className="text-[10px] font-black text-[#707eae] uppercase tracking-widest">Regional Center</label>
                        <Select value={targetState} onValueChange={(v) => setTargetState(v||"")}>
                          <SelectTrigger className="w-full h-9 bg-[#f4f7fb] dark:bg-[#0f172a] border-[#e5eaef] dark:border-[#334155] text-[12px] font-bold text-[#2a3547] dark:text-[#e2e8f0] hover:border-[#0085db] transition-all rounded-lg focus:ring-2 focus:ring-[#0085db]/10 shadow-none">
                            <SelectValue placeholder="Select RoC" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#1e293b] border-[#e5eaef] dark:border-[#334155] text-[#2a3547] dark:text-[#e2e8f0] max-h-[220px] rounded-xl shadow-xl">
                            {ROC_LIST.map(r => <SelectItem key={r} value={r} className="text-[12px] font-bold focus:bg-[#f4f7fb] dark:focus:bg-[#0085db]/20">RoC — {r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <>
                        <label className="text-[10px] font-black text-[#707eae] uppercase tracking-widest">CIN / Entity Name</label>
                        <input
                          type="text"
                          placeholder="Enter CIN or company name..."
                          value={targetQuery}
                          onChange={(e) => setTargetQuery(e.target.value)}
                          className="w-full h-9 px-3 bg-[#f4f7fb] dark:bg-[#0f172a] border border-[#e5eaef] dark:border-[#334155] rounded-lg text-[12px] font-bold text-[#2a3547] dark:text-[#e2e8f0] placeholder:text-[#707eae] focus:outline-none focus:border-[#0085db] focus:ring-2 focus:ring-[#0085db]/10 transition-all"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Intensity Selector */}
                <div className="rounded-xl border border-[#e5eaef] dark:border-[#334155] border-dashed bg-[#f9fafb] dark:bg-[#0f172a] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={12} className="text-[#ffae1f] fill-[#ffae1f]" />
                    <span className="text-[10px] font-black text-[#707eae] uppercase tracking-widest">Extraction Intensity</span>
                  </div>
                  <div className="flex gap-3">
                    {[20, 50].map(n => (
                      <button key={n} onClick={() => setBatchLimit(n)}
                        className={cn("flex-1 h-8 text-[11px] font-black rounded-lg transition-all uppercase tracking-widest border",
                          batchLimit === n ? "bg-[#0085db] text-white border-[#0085db] shadow-sm" : "bg-white text-[#707eae] border-[#e5eaef] hover:border-[#0085db] hover:text-[#0085db]"
                        )}>
                        {n} Nodes
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={runScraper} disabled={running}
                    className="flex-1 h-10 rounded-xl bg-[#0085db] hover:bg-[#00509d] disabled:bg-[#707eae] disabled:cursor-not-allowed text-white font-black text-[11px] tracking-[0.2em] uppercase shadow-[0_4px_12px_rgba(0,133,219,0.25)] transition-all flex items-center justify-center gap-2"
                  >
                    {running ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                    {running ? "EXTRACTING..." : "ENGAGE EXTRACTION"}
                  </button>
                  <button onClick={fetchStats} title="Refresh"
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-[#707eae] hover:text-[#0085db] hover:bg-[#ecf2ff] border border-[#e5eaef] transition-all shadow-sm"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>

                {/* Engine Status — fills remaining card space */}
                <div className="flex-1 min-h-0 rounded-xl border border-[#e5eaef] dark:border-[#334155] bg-[#f9fafb] dark:bg-[#0f172a] flex flex-col overflow-hidden">
                  <div className="px-4 py-2 border-b border-[#e5eaef] dark:border-[#334155] flex items-center gap-2 shrink-0">
                    <Activity size={11} className="text-[#0085db]" />
                    <span className="text-[9px] font-black text-[#707eae] uppercase tracking-[0.15em]">Engine Status</span>
                    <div className={cn("ml-auto h-1.5 w-1.5 rounded-full", running ? "bg-[#13deb9] animate-pulse" : "bg-[#0085db]/40")} />
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-[#e5eaef] dark:divide-[#334155] shrink-0">
                    {[
                      { label: "Secured", val: stats?.successCount ?? "—", c: "text-[#13deb9]" },
                      { label: "Failed",  val: stats?.failedCount  ?? "—", c: "text-[#fa896b]" },
                      { label: "Total",   val: stats?.totalScraped ?? "—", c: "text-[#0085db]" },
                    ].map(({ label, val, c }) => (
                      <div key={label} className="flex flex-col items-center py-3 gap-0.5">
                        <span className="text-[9px] font-black text-[#707eae] uppercase tracking-widest">{label}</span>
                        <span className={cn("text-[20px] font-black leading-none", c)}>{val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4">
                    <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center border", running ? "bg-[#ecfdf5] border-[#d1fae5]" : "bg-[#ecf2ff] border-[#d1e1ff]")}>
                      {running ? <RefreshCw size={18} className="text-[#13deb9] animate-spin" /> : <Zap size={18} className="text-[#0085db]" />}
                    </div>
                    <p className="text-[12px] font-black text-[#2a3547] dark:text-[#e2e8f0]">{running ? "Extraction Running" : "Engine Ready"}</p>
                    <p className="text-[10px] text-[#707eae] text-center">{running ? "Harvesting corporate data..." : "Configure and engage extraction above."}</p>
                  </div>

                  <div className="px-4 pb-3 shrink-0">
                    <button onClick={clearDatabase}
                      className="flex items-center justify-center gap-2 w-full h-8 rounded-xl border border-dashed border-[#fa896b]/30 text-[10px] font-black text-[#fa896b]/60 hover:text-[#fa896b] hover:border-[#fa896b] hover:bg-[#fff5f2] uppercase tracking-[0.15em] transition-all"
                    >
                      <Trash2 size={11} /> Purge Matrix Dataset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Feed — fills height */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-2xl overflow-hidden min-h-0">
            <div className="py-3 px-5 border-b border-[#e5eaef] dark:border-[#334155] bg-[#f9fafb] dark:bg-[#0f172a] flex items-center justify-between shrink-0">
              <h2 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-[#707eae] leading-none">
                <History size={13} className="text-[#13deb9]" /> Telemetry Feed
              </h2>
              <span className="text-[9px] bg-[#ecfdf5] text-[#13deb9] border border-[#d1fae5] px-2 py-0.5 rounded-full uppercase font-black tracking-widest leading-none">
                {running ? "Live" : `${logs.length} logs`}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100">
              {logs.length > 0 ? (
                logs.map((log: any, idx: number) => (
                  <div key={idx} className="px-4 py-3 flex items-center justify-between border-b border-[#f4f7fb] dark:border-[#334155] hover:bg-[#f9fafb] dark:hover:bg-[#0085db]/10 transition-colors group">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-[12px] font-bold text-[#2a3547] dark:text-[#e2e8f0] truncate flex items-center gap-2 leading-none">
                        <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", running ? "bg-[#13deb9] animate-pulse" : "bg-[#0085db]/30")} />
                        {log.name}
                      </span>
                      <span className="text-[10px] text-[#707eae] dark:text-slate-400 font-mono mt-1.5 leading-none">{log.cin}</span>
                    </div>
                    <span className="text-[9px] font-black text-[#0085db] bg-[#ecf2ff] border border-[#d1e1ff] py-0.5 px-2 rounded-md shrink-0 leading-none tracking-widest">
                      {log.state?.split("-")[1] || log.state || "ROC"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50 p-6 text-center">
                  <Activity size={28} className="text-[#e5eaef]" />
                  <p className="text-[10px] text-[#707eae] font-black uppercase tracking-[0.15em]">No Telemetry</p>
                  <p className="text-[10px] text-[#707eae] italic">Awaiting extraction run.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
