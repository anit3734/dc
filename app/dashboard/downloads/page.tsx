"use client";

import { useEffect, useState } from "react";
import { CloudDownload, FileSpreadsheet, FileText, Clock, RefreshCcw, Search, Activity, DatabaseZap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

interface DownloadRecord {
  id: string;
  file: string;
  createdAt: string;
}

const BAR_HEIGHTS = [20, 45, 80, 50, 95, 30, 65, 40, 85, 55, 70, 25, 90, 60, 35, 75, 45, 80, 50, 95, 30, 65, 40, 85, 55, 70, 25, 90, 60, 35, 100, 45];
const ANIM_DURATIONS = [1.2, 0.8, 1.5, 0.9, 1.1, 1.4, 0.7, 1.3, 0.85, 1.25, 1.0, 0.95, 1.4, 1.1, 0.8, 1.3, 1.2, 0.8, 1.5, 0.9, 1.1, 1.4, 0.7, 1.3, 0.85, 1.25, 1.0, 0.95, 1.4, 1.1, 0.8, 1.3];

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/downloads");
      if (res.ok) {
        const data = await res.json();
        setDownloads(data);
      }
    } catch (error) {
      console.error("Failed to fetch downloads", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const filtered = downloads.filter(d => 
    d.file.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] dark:bg-[#0f172a] text-[#2a3547] dark:text-[#e2e8f0] font-sans flex flex-col p-4 sm:p-6 pb-10 animate-in fade-in duration-300">
      
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-b border-[#e5eaef] pb-5 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#ecf2ff] border border-[#d1e1ff] rounded-2xl shadow-sm flex items-center justify-center">
            <CloudDownload size={22} className="text-[#0085db]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#2a3547] tracking-tight leading-none">Export Archive</h1>
            <p className="text-[11px] text-[#707eae] font-black uppercase tracking-[0.2em] mt-2 leading-none">Encrypted Payload Storage</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group w-full sm:w-auto">
             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707eae] group-focus-within:text-[#0085db] transition-colors" size={14} />
             <input 
                placeholder="Search filename..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 border border-[#e5eaef] text-[12px] font-bold rounded-xl bg-white w-full sm:w-[220px] text-[#2a3547] placeholder:text-[#707eae] focus:outline-none focus:border-[#0085db] focus:ring-4 focus:ring-[#0085db]/5 transition-all shadow-sm"
             />
          </div>
           <button 
              onClick={fetchDownloads}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] text-[#707eae] hover:text-[#0085db] hover:bg-[#ecf2ff] dark:hover:bg-[#0085db]/10 transition-all shadow-sm outline-none"
           >
              <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
           </button>

           <div className="ml-1 pl-2 border-l border-[#e5eaef] dark:border-[#334155] h-6 flex items-center">
             <ThemeToggle />
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 min-h-0">
        
        {/* Animated Graph & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
           {/* Graph Dashboard */}
           <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-[32px] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.03)] overflow-hidden h-[140px]">
              <div className="px-6 py-4 border-b border-[#e5eaef] dark:border-[#334155] bg-[#f9fafb] dark:bg-[#0f172a] flex items-center justify-between shrink-0">
                 <h2 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2.5 text-[#2a3547] leading-none">
                   <Activity size={14} className="text-[#0085db]" /> Extraction Throughput
                 </h2>
                 <span className="text-[9px] bg-[#ecf2ff] text-[#0085db] border border-[#d1e1ff] px-2.5 py-1 rounded-full uppercase font-black tracking-widest leading-none animate-pulse">
                   Live Telemetry
                 </span>
              </div>
              <div className="flex-1 p-4 flex items-end gap-1.5 bg-white">
                 {BAR_HEIGHTS.map((height, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-gradient-to-t from-[#0085db]/20 to-[#0085db] rounded-t-lg"
                      style={{ 
                         height: `${height}%`,
                         animation: `equalizer ${ANIM_DURATIONS[i]}s infinite alternate ease-in-out`,
                         opacity: 0.6 + ((i * 13) % 4) * 0.1
                      }}
                    />
                 ))}
              </div>
           </div>

           {/* Stats */}
           <div className="flex flex-col gap-4">
              <StatCard label="Archive Depth" value={downloads.length} sub="Total Files" color="text-[#0085db]" bg="bg-[#ecf2ff]" border="border-[#d1e1ff]" />
              <StatCard label="Dominant Format" value={downloads.filter(d => d.file.endsWith('.xlsx')).length >= downloads.length/2 ? "EXCEL" : "CSV"} sub="Matrix Encoded" color="text-[#13deb9]" bg="bg-[#ecfdf5]" border="border-[#d1fae5]" />
           </div>
        </div>

        {/* Main Vault Content */}
        <div className="bg-white dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.03)] flex-1 flex flex-col min-h-0 relative group/vault overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e5eaef] dark:border-[#334155] bg-[#f9fafb] dark:bg-[#0f172a] flex items-center justify-between shrink-0 relative z-[21]">
             <div className="flex items-center gap-2.5">
               <DatabaseZap size={14} className="text-[#ffae1f]" />
               <h3 className="text-[11px] font-black uppercase tracking-widest text-[#2a3547] dark:text-[#e2e8f0] leading-none">Vault Ledger</h3>
             </div>
             <span className="text-[10px] text-[#707eae] font-bold">{filtered.length} Objects Encoded</span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100 relative z-[10]">
            {loading ? (
               <div className="h-full flex flex-col items-center justify-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#ecf2ff] dark:bg-[#1e293b] flex items-center justify-center animate-bounce shadow-sm">
                    <RefreshCcw size={22} className="text-[#0085db] animate-spin" />
                  </div>
                  <p className="text-[#707eae] font-black uppercase tracking-widest text-[10px]">Decrypted Matrix Access...</p>
               </div>
            ) : filtered.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center px-10">
                  <div className="h-16 w-16 bg-[#f4f7fb] dark:bg-[#1e293b] rounded-[24px] flex items-center justify-center mb-6 border border-[#e5eaef] dark:border-[#334155] shadow-inner">
                     <FileText size={24} className="text-[#e5eaef]" />
                  </div>
                  <p className="text-[11px] font-black text-[#707eae] uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">No Archive Data.<br/>Generate queries to populate telemetry.</p>
               </div>
            ) : (
              <div className="divide-y divide-[#f4f7fb] dark:divide-[#334155]">
                 {filtered.map((d, i) => (
                    <DownloadRow key={d.id} download={d} index={i} mounted={mounted} />
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes equalizer {
          0% { transform: scaleY(0.7); }
          100% { transform: scaleY(1.05); }
        }
      `}} />
    </div>
  );
}

function StatCard({ label, value, sub, color, bg, border }: { label: string, value: string|number, sub: string, color: string, bg: string, border: string }) {
  return (
    <div className="bg-white dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-[24px] flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] p-4 h-[62px] transition-all hover:shadow-md">
       <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#707eae] leading-none">{label}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#2a3547] dark:text-[#e2e8f0] leading-none opacity-60">{sub}</span>
       </div>
       <div className={cn("px-3 py-1.5 rounded-xl font-black text-[18px] tracking-tight leading-none border shadow-sm", bg, border, color)}>
          {value}
       </div>
    </div>
  );
}

function DownloadRow({ download, index, mounted }: { download: DownloadRecord, index: number, mounted: boolean }) {
  const toExcel = download.file.endsWith('.xlsx');

  const handleDownload = () => {
    const content = toExcel 
      ? "\x50\x4B\x03\x04\x14" // Basic XLSX magic bytes stub for UI
      : "CIN,Company Name,Status\nSECURE_RECORD_01,Vault Payload Encrypted,Active\n";
    
    const blob = new Blob([content], { 
      type: toExcel 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        : 'text/csv' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = download.file;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="group hover:bg-[#f4f7fb] dark:hover:bg-[#334155]/50 transition-all px-6 py-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: `${Math.min(index * 30, 400)}ms` }}>
      <div className="flex items-center gap-4 min-w-0">
        <div className={cn("h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-110", toExcel ? 'bg-[#ecfdf5] dark:bg-[#13deb9]/10 border-[#d1fae5] dark:border-[#13deb9]/20 text-[#13deb9]' : 'bg-[#ecf2ff] dark:bg-[#0085db]/10 border-[#d1e1ff] dark:border-[#0085db]/20 text-[#0085db]')}>
           {toExcel ? <FileSpreadsheet size={18} /> : <FileText size={18} />}
        </div>
        <div className="flex flex-col min-w-0 gap-2">
           <span className="text-[14px] font-bold text-[#2a3547] dark:text-[#e2e8f0] truncate tracking-tight group-hover:text-[#0085db] transition-colors leading-none">{download.file}</span>
           <div className="flex items-center gap-2.5">
              <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 border rounded-lg leading-none shrink-0 tracking-widest shadow-sm", toExcel ? 'text-[#13deb9] bg-white dark:bg-[#1e293b] border-[#d1fae5] dark:border-[#13deb9]/30' : 'text-[#0085db] bg-white dark:bg-[#1e293b] border-[#d1e1ff] dark:border-[#0085db]/30')}>
                 {toExcel ? 'EXCEL' : 'CSV'}
              </span>
              <span className="text-[#e5eaef] leading-none text-[12px]">•</span>
              <span className="text-[10px] text-[#707eae] font-bold leading-none truncate opacity-80 flex items-center gap-1.5">
                 <Clock size={10} />
                 {mounted ? (
                   <>
                     {new Date(download.createdAt).toLocaleDateString()} at {new Date(download.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </>
                 ) : (
                   "Loading date..."
                 )}
              </span>
           </div>
        </div>
      </div>

      <button 
         onClick={handleDownload}
         className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#0f172a] border border-[#e5eaef] dark:border-[#334155] text-[#707eae] group-hover:bg-[#0085db] group-hover:text-white group-hover:border-[#0085db] group-hover:shadow-[0_4px_12px_rgba(0,133,219,0.3)] transition-all shrink-0 outline-none shadow-sm"
         title="Secure Download"
      >
         <CloudDownload size={16} />
      </button>
    </div>
  );
}
