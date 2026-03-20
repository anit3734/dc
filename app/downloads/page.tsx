"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  History, Download, FileText, Search, Clock, 
  ArrowLeft, RefreshCw, Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DownloadRecord {
  id: string;
  file: string;
  createdAt: string;
}

export default function DownloadsPage() {
  const router = useRouter();
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/downloads');
      const data = await res.json();
      setDownloads(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 p-8 space-y-8">
      {/* Simple Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')} className="h-9">
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <div className="space-y-1">
             <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <History className="text-slate-400" size={20} />
                Export History
             </h1>
             <p className="text-sm text-slate-500">Access and retrieve previously exported intelligence assets.</p>
          </div>
        </div>
        <Button onClick={fetchDownloads} variant="ghost" className="text-xs font-bold text-indigo-600 hover:bg-white border-slate-200">
           <RefreshCw size={14} className="mr-2" /> Refresh Manifest
        </Button>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
         <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <Input 
                 placeholder="Search export records..." 
                 className="pl-9 h-10 border-slate-200 bg-white"
               />
            </div>
            <div className="hidden md:flex items-center gap-3">
               <Badge className="bg-white/50 text-indigo-600 border border-indigo-100 font-bold">VAULT_PROTOCOL_v4</Badge>
            </div>
         </div>

         {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
               <RefreshCw className="animate-spin" size={24} />
               <p className="text-xs font-bold uppercase tracking-widest">Syncing Vault Manifest...</p>
            </div>
         ) : downloads.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12 text-center">
               <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 border border-slate-100">
                  <History size={40} />
               </div>
               <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 leading-none">Intelligence Vault Empty</h3>
                  <p className="text-sm text-slate-500 max-w-xs">No intelligence records have been exported for retrieval yet.</p>
               </div>
            </div>
         ) : (
            <div className="flex-1 overflow-x-auto">
               <Table className="standard-table">
                  <TableHeader>
                     <TableRow>
                        <TableHead className="w-[100px] font-bold text-slate-400 uppercase text-[9px]">Record ID</TableHead>
                        <TableHead className="font-bold text-slate-400 uppercase text-[9px]">Asset Identity</TableHead>
                        <TableHead className="font-bold text-slate-400 uppercase text-[9px]">Creation Date</TableHead>
                        <TableHead className="text-right pr-8 font-bold text-slate-400 uppercase text-[9px]">Action</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {downloads.map((d, i) => (
                        <TableRow key={d.id}>
                           <TableCell className="font-mono text-[10px] text-slate-400">#{d.id.slice(0, 8).toUpperCase()}</TableCell>
                           <TableCell>
                              <div className="flex items-center gap-3">
                                 <div className="h-9 w-9 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                    <FileText size={18} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900 uppercase italic tracking-tight">{d.file}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 leading-none">
                                       <Layers size={10} /> Verified Data Cluster
                                    </span>
                                 </div>
                              </div>
                           </TableCell>
                           <TableCell>
                              <div className="flex items-center gap-2 text-slate-600">
                                 <Clock size={14} className="text-slate-400" />
                                 <span className="text-xs font-bold">{new Date(d.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                           </TableCell>
                           <TableCell className="text-right pr-8">
                              <Button 
                                onClick={() => window.open(`/api/downloads/${d.id}`, '_blank')}
                                size="sm" 
                                className="h-9 px-6 bg-slate-900 hover:bg-black font-bold text-[10px] uppercase tracking-widest shadow-sm"
                              >
                                 Download Record
                                 <Download size={14} className="ml-2" />
                              </Button>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         )}

         {/* Simple Footer */}
         <div className="p-4 bg-slate-50 border-t flex justify-between items-center opacity-60">
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Secure Registry Sync Active</span>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Zauba Intelligence Suite v4.2</p>
         </div>
      </div>
    </div>
  );
}
