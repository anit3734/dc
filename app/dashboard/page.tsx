"use client";

import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Download, RefreshCcw, MapPin, Mail, Phone, Globe, FileText, Sheet, Copy, Database, ChevronDown, Clock, Building2, CheckCircle2, MousePointerClick, Layers } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

// API Response Interface
interface Company {
  cin: string;
  name: string;
  state: string;
  status: "Active" | "Inactive" | "Amalgamated";
  registration_date: string;
  email?: string;
  address?: string;
  authorized_capital?: number;
  paid_up_capital?: number;
  roc?: string;
  website?: string;
  telephone?: string;
  age?: string;
  directors?: { name: string; designation?: string }[];
}

// Format Currency
const formatINR = (amount?: number) => {
  if (!amount) return "—";
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

// Clean Address
const cleanAddress = (addr: string, companyName: string) => {
  if (!addr) return "";
  const namePrefix = companyName.toUpperCase();
  const searchPattern = new RegExp(`${namePrefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\s+is\\s+`, "i");
  const match = addr.match(searchPattern);
  if (match && match.index !== undefined) return addr.substring(match.index + match[0].length).trim();
  const fallbackMatch = addr.match(/is\s+([0-9A-Z].*)/i);
  if (fallbackMatch && addr.toLowerCase().includes("registered address")) return fallbackMatch[1].trim();
  return addr;
};

// Custom Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rocFilter, setRocFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState<number>(0);

  // Debounced filters
  const debouncedSearch = useDebounce(search, 500);
  const debouncedState = useDebounce(stateFilter, 500);
  const debouncedStatus = useDebounce(statusFilter, 500);
  const debouncedRoc = useDebounce(rocFilter, 500);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setCompanies([]);
    setHasMore(true);
    fetchCompanies(1, true);
    // Also refresh active count
    fetch("/api/companies/stats")
      .then(r => r.json())
      .then(d => {
        setTotal(d.totalCompanies || 0);
        const activeEntry = (d.statusCounts || []).find((s: any) => s.status?.toLowerCase() === "active");
        setActiveCount(activeEntry?._count ?? 0);
      })
      .catch(() => {});
  }, [debouncedSearch, debouncedState, debouncedStatus, debouncedRoc]);

  // Fetch more when page changes
  useEffect(() => {
    if (page > 1) fetchCompanies(page, false);
  }, [page]);

  // Real-time stats polling for header counts
  useEffect(() => {
    const iv = setInterval(() => {
      fetch("/api/companies/stats")
        .then(r => r.json())
        .then(d => {
          setTotal(d.totalCompanies || 0);
          const activeEntry = (d.statusCounts || []).find((s: any) => s.status?.toLowerCase() === "active");
          setActiveCount(activeEntry?._count ?? 0);
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const fetchCompanies = async (pageToFetch: number, isInitial = false) => {
    if (loading && !isInitial) return;
    setLoading(true);
    if (isInitial) setInitialLoading(true);

    try {
      const query = new URLSearchParams({
        page: pageToFetch.toString(),
        limit: "20",
        search: debouncedSearch,
        state: debouncedState,
        status: debouncedStatus,
        roc: debouncedRoc,
      });
      const res = await fetch(`/api/companies?${query.toString()}`);
      const data = await res.json();
      setTotal(data.pagination?.total || 0);

      const newCompanies = data.companies || [];
      if (isInitial) {
        setCompanies(newCompanies);
      } else {
        setCompanies((prev) => {
          const existingCins = new Set(prev.map((c) => c.cin));
          return [...prev, ...newCompanies.filter((c: Company) => !existingCins.has(c.cin))];
        });
      }
      setHasMore(newCompanies.length === 20);
    } catch (e) {
      console.error(e);
    } finally {
      if (isInitial) setTimeout(() => setInitialLoading(false), 300); // 300ms min visual delay for loader
      else setInitialLoading(false);
      
      setTimeout(() => setLoading(false), 700); // Force 700ms spin animation on the refresh icon
    }
  };

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (loading || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setPage((p) => p + 1); },
      { threshold: 0.1 }
    );
    const target = document.querySelector("#scroll-sentinel");
    if (target) observer.observe(target);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  const toggleSelection = (cin: string) => {
    setSelectedIds((prev) => prev.includes(cin) ? prev.filter((id) => id !== cin) : [...prev, cin]);
  };

  const handleExport = async (format: "csv" | "excel") => {
    let payloadIds = selectedIds;
    if (selectedIds.length === 0) {
      if (!window.confirm("Export ALL entities?")) return;
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
        a.download = `zauba_matrix_${Date.now()}.${format === "excel" ? "xlsx" : "csv"}`;
        a.click();
      }
    } catch (e) { console.error(e); } finally { setExportLoading(false); }
  };

  const hasFilters = search || stateFilter || statusFilter || rocFilter;
  const allSelected = companies.length > 0 && selectedIds.length === companies.length;

  return (
    <div className="flex flex-col flex-1 text-[#2a3547] dark:text-[#e2e8f0] font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-thin::-webkit-scrollbar { width: 4px; height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #e5eaef; border-radius: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #707eae; }
      `}} />

      {/* Sticky Header Bundle */}
      <div className="sticky top-0 z-30 flex flex-col bg-white dark:bg-[#0f172a]">
        <header className="min-h-[56px] py-2 px-4 md:px-8 flex items-center justify-between shrink-0 border-b border-[#e5eaef] dark:border-[#334155]">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-[#0085db] shrink-0" />
            <h2 className="text-[14px] font-bold tracking-tight text-[#2a3547] dark:text-white hidden sm:block">Intelligence Matrix</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ecf2ff] dark:bg-[#0085db]/20 text-[#0085db] border border-[#d1e1ff] dark:border-[#0085db]/30 ml-1 shadow-sm whitespace-nowrap">
              {total.toLocaleString()} <span className="hidden xs:inline ml-1">Records</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => { setPage(1); fetchCompanies(1, true); }}
              disabled={loading}
              className="h-[34px] px-2.5 sm:px-3.5 rounded-xl text-[12px] font-bold text-[#707eae] bg-white dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] hover:bg-[#f9fafb] dark:hover:bg-[#0085db]/10 hover:text-[#2a3547] transition-all flex items-center gap-2 shadow-sm"
            >
              <RefreshCcw size={14} className={cn(loading && "animate-spin")} />
              <span className="hidden xs:block">Sync</span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={exportLoading}
                  className="h-[34px] px-3 sm:px-4 ml-1 rounded-xl text-[12px] font-bold bg-[#0085db] hover:bg-[#00509d] text-white transition-all flex items-center gap-2 disabled:opacity-50 shadow-[0_4px_12px_rgba(0,133,219,0.25)]"
                >
                  <Download size={14} className={cn(exportLoading && "animate-bounce", "shrink-0")} />
                  <span className="truncate max-w-[80px] sm:max-w-none">{selectedIds.length > 0 ? `Export (${selectedIds.length})` : "Export Data"}</span>
                  <ChevronDown size={11} className="opacity-70 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-[#1e293b] border-[#e5eaef] dark:border-[#334155] rounded-2xl p-2 shadow-2xl text-[#2a3547] dark:text-[#e2e8f0] border mt-1">
                <DropdownMenuItem onClick={() => handleExport("excel")} className="flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold rounded-xl hover:bg-[#f4f7fb] dark:hover:bg-[#0085db]/20 focus:bg-[#f4f7fb] dark:focus:bg-[#0085db]/20 cursor-pointer text-[#2a3547] dark:text-[#e2e8f0] transition-colors">
                  <div className="p-1.5 bg-green-50 dark:bg-green-500/10 rounded-lg"><Sheet size={14} className="text-green-600 dark:text-green-400" /></div> Excel Metadata
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")} className="flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold rounded-xl hover:bg-[#f4f7fb] dark:hover:bg-[#0085db]/20 focus:bg-[#f4f7fb] dark:focus:bg-[#0085db]/20 cursor-pointer text-[#2a3547] dark:text-[#e2e8f0] transition-colors">
                  <div className="p-1.5 bg-gray-50 dark:bg-slate-700 rounded-lg"><FileText size={14} className="text-gray-600 dark:text-slate-300" /></div> Raw CSV Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-1 pl-2 border-l border-[#e5eaef] dark:border-[#334155] h-6 flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </header>


        {/* ── Stats Cards Row ─── */}
        <div className="px-4 md:px-8 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f9fafb] dark:bg-[#1e293b] border-b border-[#e5eaef] dark:border-[#334155]">
          {[
            { label: "Total Entities", value: total.toLocaleString(), icon: Building2, iconClass: "text-[#0085db]", bg: "bg-[#ecf2ff]", border: "border-[#d1e1ff]", valueClass: "text-[#0085db]" },
            { label: "Active", value: activeCount, icon: CheckCircle2, iconClass: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", valueClass: "text-emerald-600" },
            { label: "Selected", value: selectedIds.length, icon: MousePointerClick, iconClass: "text-[#ffae1f]", bg: "bg-amber-50", border: "border-amber-100", valueClass: "text-[#ffae1f]" },
            { label: "This Session", value: companies.length, icon: Layers, iconClass: "text-[#707eae]", bg: "bg-[#f4f7fb]", border: "border-[#e5eaef]", valueClass: "text-[#2a3547]" },
          ].map(({ label, value, icon: Icon, iconClass, bg, border, valueClass }) => (
            <div key={label} className="bg-white dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#707eae] dark:text-slate-400 leading-none">{label}</span>
                <span className={`text-[20px] font-black leading-tight ${valueClass}`}>{value}</span>
              </div>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center border shrink-0 ${bg} ${border}`}>
                <Icon size={16} className={iconClass} />
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar - below stats */}
        <div className="px-4 md:px-8 py-3 flex flex-wrap items-center gap-3 bg-white dark:bg-[#0f172a] border-b border-[#e5eaef] dark:border-[#334155] w-full">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707eae]" />
            <input
              type="text"
              placeholder="Search Intelligence Database..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[38px] pl-10 pr-4 bg-[#f4f7fb] dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-xl text-[13px] text-[#2a3547] dark:text-[#e2e8f0] placeholder:text-[#707eae] focus:outline-none focus:border-[#0085db] focus:ring-4 focus:ring-[#0085db]/5 transition-all"
            />
          </div>

          {[
            { value: stateFilter, set: setStateFilter, placeholder: "Region (State)" },
            { value: rocFilter, set: setRocFilter, placeholder: "RoC Office" },
          ].map(({ value, set, placeholder }) => (
            <input
              key={placeholder}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => set(e.target.value)}
              className="flex-1 min-w-[140px] h-[38px] px-4 bg-[#f4f7fb] dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-xl text-[13px] text-[#2a3547] dark:text-[#e2e8f0] placeholder:text-[#707eae] focus:outline-none focus:border-[#0085db] focus:ring-4 focus:ring-[#0085db]/5 transition-all"
            />
          ))}

          <Select value={statusFilter || "all"} onValueChange={(val) => setStatusFilter(val === "all" ? "" : (val || ""))}>
            <SelectTrigger className="flex-1 min-w-[140px] h-[38px] bg-[#f4f7fb] dark:bg-[#1e293b] border border-[#e5eaef] dark:border-[#334155] rounded-xl text-[13px] text-[#2a3547] dark:text-[#e2e8f0] focus:ring-4 focus:ring-[#0085db]/5">
              <SelectValue placeholder="Company Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#1e293b] border-[#e5eaef] dark:border-[#334155] rounded-xl shadow-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Amalgamated">Amalgamated</SelectItem>
              <SelectItem value="Strike Off">Strike Off</SelectItem>
              <SelectItem value="Under Process">Under Process</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setStateFilter(""); setStatusFilter(""); setRocFilter(""); }}
              className="h-[38px] px-5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-[#fa896b] bg-[#fff5f2] hover:bg-[#ffece8] border border-[#ffdbdb] transition-all shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

    {/* Data Table Container - Docked */}
      <div className="flex-1 relative group/table overflow-hidden">
        <div className="bg-white dark:bg-[#0f172a] border-b border-[#e5eaef] dark:border-[#334155] min-h-full overflow-x-auto">
          <table className="w-full min-w-[1000px] table-fixed border-collapse">
            <thead>
            <tr className="bg-[#f9fafb] border-b border-[#e5eaef]">
                <th className="w-14 pr-4 pl-6 py-2.5 text-left">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(c) => setSelectedIds(c ? companies.map((x) => x.cin) : [])}
                    className="border-[#e5eaef] data-[state=checked]:bg-[#0085db] data-[state=checked]:border-[#0085db] rounded-md"
                  />
                </th>
                <th className="w-[34%] px-4 py-2.5 text-left text-[10px] font-bold text-[#707eae] uppercase tracking-widest leading-none">Entity Identity</th>
                <th className="w-[19%] px-4 py-2.5 text-left text-[10px] font-bold text-[#707eae] uppercase tracking-widest leading-none">Registry Comms</th>
                <th className="w-[24%] px-4 py-2.5 text-left text-[10px] font-bold text-[#707eae] uppercase tracking-widest leading-none">Registered HQ</th>
                <th className="w-[23%] px-6 py-2.5 text-right text-[10px] font-bold text-[#707eae] uppercase tracking-widest leading-none">Vital Stats</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#e5eaef]">
              {initialLoading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center bg-white">
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-2xl bg-[#ecf2ff] flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-500">
                        <RefreshCcw className="animate-spin h-6 w-6 text-[#0085db]" />
                      </div>
                      <span className="text-[13px] font-bold text-[#2a3547]">Synchronizing Corporate Matrix...</span>
                      <span className="text-[11px] text-[#707eae] mt-1 italic">Fetching real-time data indexed by RoC</span>
                    </div>
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-[13px] font-bold text-[#707eae] bg-white">
                    <Database className="h-10 w-10 text-slate-100 mx-auto mb-4 opacity-50" />
                    No corporate records aligned with your filters
                  </td>
                </tr>
              ) : (
                <>
                  {companies.map((c, i) => (
                    <TableRowItem key={c.cin} c={c} i={i} selected={selectedIds.includes(c.cin)} toggle={() => toggleSelection(c.cin)} />
                  ))}
                  
                  {/* Invisible sentinel for intersection observer */}
                  <tr id="scroll-sentinel" className="h-[70px]">
                    <td colSpan={5} className="text-center bg-white border-t border-slate-50">
                    {hasMore ? (
                        <div className="flex items-center justify-center gap-3 py-6">
                          <div className="h-2 w-2 rounded-full bg-[#0085db] animate-bounce [animation-delay:-0.3s]" />
                          <div className="h-2 w-2 rounded-full bg-[#0085db] animate-bounce [animation-delay:-0.15s]" />
                          <div className="h-2 w-2 rounded-full bg-[#0085db] animate-bounce" />
                        </div>
                      ) : (
                        <div className="py-6 flex flex-col items-center gap-1 opacity-40">
                          <div className="w-8 h-[1px] bg-slate-300" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#707eae]">Terminal Data Reached</span>
                        </div>
                      )}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* Extracted Table TableRow to handle render cleanly without cluttering the main return */
function TableRowItem({ c, i, selected, toggle }: { c: Company, i: number, selected: boolean, toggle: () => void }) {
  const statusColor = c.status === "Active" ? "text-emerald-500 border-emerald-100 bg-emerald-50" 
                    : c.status === "Amalgamated" ? "text-amber-500 border-amber-100 bg-amber-50" 
                    : "text-rose-500 border-rose-100 bg-rose-50";

  return (
    <tr 
      className={cn(
        "group hover:bg-[#f4f7fb] transition-all align-top animate-in fade-in slide-in-from-bottom-2 duration-300",
        selected && "bg-[#ecf2ff]/60 hover:bg-[#ecf2ff]/80"
      )}
      style={{ animationDelay: `${Math.min(i * 30, 600)}ms` }}
    >
      <td className="w-12 pr-4 pl-6 py-6 pt-[22px]">
        <Checkbox
          checked={selected}
          onCheckedChange={toggle}
          className="border-[#e5eaef] data-[state=checked]:bg-[#0085db] data-[state=checked]:border-[#0085db] rounded-md"
        />
      </td>

      <td className="w-[34%] px-4 py-6">
        <div className="flex flex-col gap-2 max-w-full overflow-hidden">
          <div className="flex items-center gap-2.5">
            <span className="text-[14px] font-bold text-[#2a3547] group-hover:text-[#0085db] transition-colors truncate">
              {c.name}
            </span>
            {c.status && (
              <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border leading-none shrink-0 tracking-widest", statusColor)}>
                {c.status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-[10px] font-mono font-bold bg-[#f4f7fb] text-[#0085db] px-2 py-0.5 rounded-lg border border-[#e5eaef] shrink-0">
              {c.cin}
            </code>
            {(c.paid_up_capital || c.authorized_capital) ? (
              <span className="text-[10px] bg-[#0085db] text-white px-2 py-0.5 rounded-lg font-bold shadow-sm shrink-0">
                {formatINR(c.paid_up_capital || c.authorized_capital)}
              </span>
            ) : null}
          </div>
          {c.directors && c.directors.length > 0 && (
            <span className="text-[12px] font-medium text-[#707eae] truncate mt-0.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#e5eaef]" /> Dir: {c.directors[0].name}
            </span>
          )}
        </div>
      </td>

      <td className="w-[19%] px-4 py-6">
        <div className="flex flex-col gap-3 overflow-hidden">
          {c.email ? (
            <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-[12px] font-medium text-[#707eae] hover:text-[#0085db] transition-colors w-fit max-w-full group/email">
              <Mail size={14} className="shrink-0 text-slate-300 group-hover/email:text-[#0085db] transition-colors" />
              <span className="truncate">{c.email}</span>
            </a>
          ) : (
            <span className="text-[11px] text-[#707eae] italic font-medium opacity-50">No comms index</span>
          )}
          
          <div className="flex flex-col gap-1.5">
            {c.telephone && (
              <span className="flex items-center gap-2 text-[12px] font-medium text-[#707eae] truncate">
                <Phone size={12} className="shrink-0 text-slate-300" />
                {c.telephone}
              </span>
            )}
            {c.website ? (
              <a href={c.website} target="_blank" className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#0085db] hover:text-[#00509d] tracking-widest focus:outline-none truncate w-fit bg-[#ecf2ff] px-2 py-1 rounded-md border border-[#d1e1ff]">
                <Globe size={11} /> Visit HQ Site
              </a>
            ) : null}
          </div>
        </div>
      </td>

      <td className="w-[24%] px-4 py-6">
        {c.address ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress(c.address, c.name))}`}
            target="_blank"
              className="flex items-start gap-2 text-[13px] leading-relaxed text-[#707eae] hover:text-[#0085db] transition-all focus:outline-none group/map font-medium"
            title={cleanAddress(c.address, c.name)}
          >
            <MapPin size={14} className="shrink-0 mt-1 text-slate-300 group-hover/map:text-[#0085db] transition-colors" />
            <span className="line-clamp-2">{cleanAddress(c.address, c.name)}</span>
          </a>
        ) : (
          <span className="text-[11px] text-[#707eae] italic font-medium opacity-50">Geography unmapped</span>
        )}
      </td>

      <td className="w-[23%] px-6 py-6 text-right">
        <div className="flex flex-col items-end gap-2.5">
          <span className="text-[14px] font-bold tabular-nums text-[#2a3547] flex items-center gap-2">
            <Clock size={12} className="text-slate-300" />
            {c.registration_date || "—"}
          </span>
          <div className="flex flex-col items-end gap-1.5">
            {c.state && (
              <span className="text-[10px] uppercase font-bold tracking-widest bg-white text-[#707eae] px-2.5 py-1 rounded-full border border-[#e5eaef] line-clamp-1 max-w-full">
                {c.state}
              </span>
            )}
            {c.age && (
              <span className="text-[10px] uppercase font-bold tracking-widest bg-[#ecf2ff] text-[#0085db] px-2.5 py-1 rounded-full border border-[#d1e1ff] line-clamp-1 max-w-full">
                {c.age}
              </span>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}