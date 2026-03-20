"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Search, Filter, Download as DownloadIcon, RefreshCcw, Building2, MapPin, Mail, Landmark, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Company {
  cin: string;
  name: string;
  state: string;
  status: string;
  registration_date: string;
  email?: string;
  address?: string;
  authorized_capital?: number;
  paid_up_capital?: number;
  roc?: string;
  website?: string;
  telephone?: string;
  listed?: string;
  llp_status?: string;
  age?: string;
  incorporation_date?: string;
  directors?: { name: string; designation?: string; }[];
  category?: string;
  sub_category?: string;
  class?: string;
}

const cleanAddress = (addr: string, companyName: string) => {
  if (!addr) return "";
  // Check for the pattern: "email. Registered address of COMPANY NAME is ADDRESS"
  const namePrefix = companyName.toUpperCase();
  const searchPattern = new RegExp(`${namePrefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s+is\\s+`, 'i');
  const match = addr.match(searchPattern);
  
  if (match && match.index !== undefined) {
    return addr.substring(match.index + match[0].length).trim();
  }
  
  // Fallback for "Registered address of ... is "
  const fallbackMatch = addr.match(/is\s+([0-9A-Z].*)/i);
  if (fallbackMatch && addr.toLowerCase().includes("registered address")) {
      return fallbackMatch[1].trim();
  }

  return addr;
};

export default function DashboardPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Advanced Filters
  const [stateFilter, setStateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [minCap, setMinCap] = useState("");
  const [rocFilter, setRocFilter] = useState("");

  // Re-fetch when filters change (Reset everything)
  useEffect(() => {
    setPage(1);
    setCompanies([]);
    setHasMore(true);
    fetchCompanies(1, true);
  }, [search, stateFilter, statusFilter, minCap, rocFilter]);

  // Load more when page changes (but not on first page which is handled by filter effect)
  useEffect(() => {
    if (page > 1) {
      fetchCompanies(page, false);
    }
  }, [page]);

  const fetchCompanies = async (pageToFetch: number, isInitial: boolean = false) => {
    if (loading && !isInitial) return; 
    setLoading(true);
    if (isInitial) setInitialLoading(true);

    try {
      const query = new URLSearchParams({
        page: pageToFetch.toString(),
        limit: "20",
        search,
        state: stateFilter,
        status: statusFilter,
        minCapital: minCap,
        roc: rocFilter
      });
      const res = await fetch(`/api/companies?${query.toString()}`);
      const data = await res.json();
      setTotal(data.pagination?.total || 0);
      
      const newCompanies = data.companies || [];
      
      if (isInitial) {
        setCompanies(newCompanies);
      } else {
        setCompanies(prev => {
           // DEDUPLICATION: Only add companies that aren't already in the list
           const existingCins = new Set(prev.map(c => c.cin));
           const uniqueNew = newCompanies.filter((c: Company) => !existingCins.has(c.cin));
           return [...prev, ...uniqueNew];
        });
      }

      setHasMore(newCompanies.length === 20);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    const target = document.querySelector("#scroll-sentinel");
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [loading, hasMore]);

  const toggleSelection = (cin: string) => {
    setSelectedIds(prev =>
      prev.includes(cin) ? prev.filter(id => id !== cin) : [...prev, cin]
    );
  };

  const handleExport = async (format: "csv" | "excel") => {
    let payloadIds = selectedIds;
    if (selectedIds.length === 0) {
      const confirmAll = window.confirm("You haven't selected specific companies. Do you want to instantly download ALL scraped companies in the database into one single file?");
      if (!confirmAll) return;
      payloadIds = []; 
    }
    setExportLoading(true);
    try {
       const res = await fetch("/api/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format, companyCins: payloadIds }),
       });
       if (res.ok) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `zauba_export_${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'}`;
          a.click();
       }
    } catch (e) { console.error(e); } finally { setExportLoading(false); }
  };

  return (
    <div className="space-y-6 pb-20 p-4 md:p-8 max-w-full overflow-x-hidden animate-in fade-in duration-700 scroll-smooth">
      {/* Refined Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight italic">
            Intelligence <span className="text-indigo-600">Matrix</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
           <Button variant="outline" onClick={() => { setPage(1); fetchCompanies(1, true); }} className="h-11 px-4 text-sm font-bold hover:bg-slate-50 border-slate-200 rounded-xl transition-all group">
              <RefreshCcw size={14} className={loading ? "animate-spin mr-2" : "mr-2 group-hover:rotate-180 transition-transform duration-500"} /> Refresh
           </Button>
           <Button 
            disabled={exportLoading} 
            onClick={() => handleExport("csv")}
            variant="outline"
            className={`h-11 px-6 font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all ${
              selectedIds.length > 0 
              ? "border-indigo-600 text-indigo-700 bg-indigo-50 shadow-sm" 
              : "border-slate-200 text-slate-500 bg-white"
            }`}
           >
              <DownloadIcon size={14} className="mr-2" /> 
              {selectedIds.length > 0 ? `CSV (${selectedIds.length})` : "Export CSV"}
           </Button>
           <Button 
            disabled={exportLoading} 
            onClick={() => handleExport("excel")}
            className={`h-11 px-6 font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 text-white ${
              selectedIds.length > 0 
              ? "bg-indigo-700 shadow-indigo-500/30" 
              : "bg-indigo-600 shadow-indigo-500/20"
            }`}
           >
              <DownloadIcon size={14} className="mr-2" /> 
              {selectedIds.length > 0 ? `Excel (${selectedIds.length})` : "Export Excel"}
           </Button>
        </div>
      </div>

      {/* Balanced Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm grid grid-cols-2 md:grid-cols-5 gap-4">
         <div className="relative col-span-2 md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Search CIN/Name..." 
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 border-slate-200 focus:ring-indigo-500 rounded-xl text-sm font-medium"
            />
         </div>
         <Input 
            placeholder="Min Capital" 
            type="number"
            value={minCap} onChange={(e) => setMinCap(e.target.value)}
            className="h-11 border-slate-200 focus:ring-indigo-500 rounded-xl text-sm font-medium"
         />
         <Input 
            placeholder="State/Region" 
            value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}
            className="h-11 border-slate-200 focus:ring-indigo-500 rounded-xl text-sm font-medium"
         />
         <div className="hidden md:block">
            <Input 
               placeholder="Active/Inactive" 
               value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
               className="h-11 border-slate-200 focus:ring-indigo-500 rounded-xl text-sm font-medium"
            />
         </div>
         <div className="hidden md:block">
            <Input 
               placeholder="RoC Location" 
               value={rocFilter} onChange={(e) => setRocFilter(e.target.value)}
               className="h-11 border-slate-200 focus:ring-indigo-500 rounded-xl text-sm font-medium"
            />
         </div>
      </div>


      {/* Professional Data Table - Compact Mode */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px] relative">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="w-12 pl-6">
                <Checkbox
                  checked={companies.length > 0 && selectedIds.length === companies.length}
                  onCheckedChange={(checked) => setSelectedIds(checked ? companies.map(c => c.cin) : [])}
                  className="rounded-md h-5 w-5"
                />
              </TableHead>
              <TableHead className="w-[45%] font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] px-4 py-4">Corporate Entity & Leadership</TableHead>
              <TableHead className="w-[35%] font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] px-4 py-4 hidden lg:table-cell">Capital & Region</TableHead>
              <TableHead className="w-[15%] font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] pr-8 py-4 text-right">Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-72"><RefreshCcw className="animate-spin mx-auto text-indigo-500 mb-10 h-16 w-16" /> <p className="text-sm font-black text-slate-300 uppercase tracking-[0.6em]">Initializing Core Grid...</p></TableCell></TableRow>
            ) : companies.length === 0 ? (
               <TableRow><TableCell colSpan={4} className="text-center py-72 text-slate-300 font-black uppercase tracking-[0.8em] text-sm">Matrix Is Empty. Start Scraper.</TableCell></TableRow>
            ) : (
              <>
                {companies.map((c) => (
                  <TableRow key={c.cin} className="group hover:bg-slate-50/50 transition-all border-b last:border-0">
                    <TableCell className="pl-6 py-5 align-top">
                      <Checkbox
                        checked={selectedIds.includes(c.cin)}
                        onCheckedChange={() => toggleSelection(c.cin)}
                        className="h-5 w-5 border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-5 overflow-hidden">
                       <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                             <span className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm md:text-base truncate max-w-[350px]" title={c.name}>{c.name}</span>
                             <div className="flex items-center gap-2">
                                {c.status && (
                                  <Badge className={`${c.status === 'Active' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-rose-500 text-white shadow-sm'} text-[9px] font-black uppercase tracking-widest px-2 py-0 border-0 h-5 shrink-0`}>
                                     {c.status}
                                   </Badge>
                                )}
                             </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                             <span className="text-[10px] font-black text-indigo-600/70 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/50">{c.cin}</span>
                             {c.directors && c.directors.length > 0 && (
                               <div className="flex items-start gap-1.5 border-l border-slate-200 pl-3">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mt-0.5">Board:</span>
                                  <span className="text-[11px] text-slate-600 font-bold uppercase leading-relaxed">
                                     {c.directors.slice(0, 3).map(d => d.name).join(", ")}{c.directors.length > 3 ? "..." : ""}
                                  </span>
                               </div>
                             )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-slate-500">
                             {c.category && (
                                <span className="text-[10px] font-bold uppercase tracking-wide italic border-r border-slate-200 pr-3">{c.category}</span>
                             )}
                             {c.age && (
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Age: {c.age}</span>
                             )}
                          </div>

                          {c.address && (
                             <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress(c.address, c.name))}`}
                                target="_blank"
                                className="mt-3 flex items-start gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-100/80 transition-all cursor-pointer group/map"
                             >
                                <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5 group-hover/map:text-indigo-500" />
                                <span className="text-[10px] text-slate-500 font-bold leading-relaxed">{cleanAddress(c.address, c.name)}</span>
                             </a>
                          )}
                       </div>
                    </TableCell>
                    <TableCell className="px-4 py-5 hidden lg:table-cell align-top">
                       <div className="flex flex-col gap-3">
                          {c.authorized_capital && c.authorized_capital > 0 ? (
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Authorized Capital</span>
                               <span className="text-sm font-black text-indigo-600 tracking-tight">₹{(c.authorized_capital).toLocaleString()}</span>
                            </div>
                          ) : null}
                          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 mt-1">
                             {c.email && (
                               <a 
                                  href={`mailto:${c.email}`}
                                  className="flex items-center gap-2 group/item hover:opacity-80 transition-all"
                               >
                                  <Mail size={12} className="text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                                  <span className="text-[11px] text-slate-500 font-bold truncate group-hover:text-slate-900 transition-colors" title={c.email}>{c.email}</span>
                               </a>
                             )}
                             {c.state && (
                                <div className="flex items-center gap-2">
                                   <MapPin size={12} className="text-slate-300 shrink-0" />
                                   <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{c.state}</span>
                                </div>
                             )}
                          </div>

                       </div>
                    </TableCell>
                    <TableCell className="pr-8 py-5 text-right align-top">
                       <div className="flex flex-col items-end gap-3">
                          <div className="flex flex-col items-end">
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Reg Date</span>
                             <span className="text-sm font-black text-slate-700 uppercase tracking-tighter">{c.registration_date || 'N/A'}</span>
                          </div>
                          {c.website && (
                             <a href={c.website} target="_blank" className="text-[10px] text-indigo-600 font-black uppercase tracking-widest hover:underline flex items-center gap-1 mt-1 justify-end">
                               <ExternalLink size={10} /> Website
                             </a>
                          )}
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Advanced Sentinel - Matrix Expansion Protocol */}
                <TableRow id="scroll-sentinel" className="hover:bg-transparent border-0 h-40">
                   <TableCell colSpan={4} className="text-center">
                      {hasMore ? (
                        <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-6">
                           <RefreshCcw className="animate-spin h-5 w-5 text-indigo-400" />
                           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Syncing Matrix...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-4 text-slate-200 opacity-60 py-6">
                           <div className="h-[1px] w-12 bg-slate-100" />
                           <span className="text-[10px] font-black uppercase tracking-[0.4em]">Grid End Reached</span>
                           <div className="h-[1px] w-12 bg-slate-100" />
                        </div>
                      )}
                   </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
