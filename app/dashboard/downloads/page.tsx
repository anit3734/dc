"use client";

import { useEffect, useState } from "react";
import { 
  CloudDownload, 
  FileSpreadsheet, 
  FileText, 
  Clock, 
  ChevronRight,
  ExternalLink,
  RefreshCcw,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface DownloadRecord {
  id: string;
  file: string;
  createdAt: string;
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
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
      setLoading(false);
    }
  };

  const filtered = downloads.filter(d => 
    d.file.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                 <CloudDownload size={20} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Export <span className="text-indigo-600">Archive</span></h1>
           </div>
           <p className="text-slate-500 font-medium max-w-lg">Track and retrieve your previously generated corporate intelligence datasets.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <Input 
                 placeholder="Search by filename..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-10 h-11 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl bg-white"
              />
           </div>
           <Button 
              variant="outline" 
              onClick={fetchDownloads}
              className="h-11 px-4 border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
           >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
           </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
             <RefreshCcw size={40} className="text-indigo-500 animate-spin" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Secure Vault...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center px-6">
             <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-dashed border-slate-200">
                <FileText size={32} className="text-slate-300" />
             </div>
             <h3 className="text-lg font-bold text-slate-900">No Export Logs Found</h3>
             <p className="text-slate-400 max-w-xs mt-2 text-sm">You haven't generated any intelligence exports yet. Start by selecting companies on the dashboard.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((download) => {
              const toExcel = download.file.endsWith('.xlsx');
              return (
                <div key={download.id} className="group hover:bg-slate-50 transition-colors p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5 min-w-0">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${toExcel ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                       {toExcel ? <FileSpreadsheet size={24} /> : <FileText size={24} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                       <span className="text-sm font-bold text-slate-900 truncate tracking-tight">{download.file}</span>
                       <div className="flex items-center gap-3 mt-1 underline-offset-4">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                             <Clock size={12} />
                             {new Date(download.createdAt).toLocaleDateString()} at {new Date(download.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="h-1 w-1 rounded-full bg-slate-200" />
                          <Badge variant="outline" className={`text-[9px] font-black uppercase px-2 py-0 border-0 ${toExcel ? 'text-emerald-600 bg-emerald-50' : 'text-indigo-600 bg-indigo-50'}`}>
                             {toExcel ? 'Microsoft Excel' : 'Standard CSV'}
                          </Badge>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pr-2">
                     <Button 
                        variant="ghost" 
                        className="h-10 px-4 gap-2 text-slate-600 hover:text-indigo-600 font-bold text-xs uppercase transition-all rounded-xl"
                        onClick={() => alert('Download triggers move to the cloud repository...')}
                     >
                        <ExternalLink size={14} /> View
                     </Button>
                     <div className="h-8 w-[1px] bg-slate-100 mx-1" />
                     <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md active:scale-95">
                        <ChevronRight size={18} />
                     </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats / Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Exports", value: downloads.length, color: "indigo" },
          { label: "Most Used Format", value: downloads.filter(d => d.file.endsWith('.xlsx')).length >= downloads.length/2 ? "Excel" : "CSV", color: "emerald" },
          { label: "Vault Security", value: "Locked", color: "amber" },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
             <span className={`text-[10px] font-black uppercase tracking-widest text-${stat.color}-500 mb-2 block`}>{stat.label}</span>
             <p className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
