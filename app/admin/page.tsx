"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Play, RotateCcw, Database, ShieldAlert, BarChart3, 
  Settings2, Activity, HardDrive, Cpu, ArrowLeft, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [targetRoc, setTargetRoc] = useState("");

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/scraper/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const runScraper = async () => {
    setRunning(true);
    try {
      await fetch("/api/scraper/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roc: targetRoc }),
      });
      alert("Scraper sequence initiated.");
    } catch (err) { console.error(err); }
    finally { setRunning(false); }
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
             <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Control Center</h1>
             <p className="text-sm text-slate-500 italic">Manage scraper engine and intelligence telemetry.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-3 py-1">
              SYSTEM_READY
           </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: "Internal Dataset", val: stats?.totalCompanies || "0", icon: <Database size={16} />, sub: "Verified Entity Count" },
           { label: "Registry RoC", val: stats?.totalRocs || "0", icon: <Settings2 size={16} />, sub: "Active Retrieval Nodes" },
           { label: "Sync Engine", val: running ? "ACTIVE" : "STANDBY", icon: <Activity size={16} />, sub: "Live Protocol Status" },
           { label: "Data Integrity", val: "99.9%", icon: <ShieldAlert size={16} />, sub: "Verification Success" },
         ].map((stat, i) => (
           <Card key={i} className="shadow-sm border-slate-200">
              <CardContent className="p-5">
                 <div className="flex items-center justify-between mb-3 text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
                    {stat.icon}
                 </div>
                 <p className="text-2xl font-black text-slate-900 leading-none mb-1">{stat.val}</p>
                 <p className="text-[10px] text-slate-500 font-medium italic">{stat.sub}</p>
              </CardContent>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Scraper Controls */}
         <Card className="lg:col-span-2 shadow-sm border-slate-200">
            <CardHeader>
               <CardTitle className="text-md flex items-center gap-2">
                  <Cpu size={18} className="text-indigo-600" />
                  Engine Management
               </CardTitle>
               <CardDescription>Configure and initiate background extraction protocols.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Node (RoC)</label>
                     <Input 
                        placeholder="ENTER ROC NAME (E.G. CHANDIGARH)..." 
                        value={targetRoc} 
                        onChange={(e) => setTargetRoc(e.target.value)}
                        className="h-12 border-slate-200 uppercase font-mono font-bold"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batch Limit</label>
                     <Input 
                        type="number" 
                        placeholder="PER PAGE SCAN LIMIT (E.G. 20)..." 
                        defaultValue={20}
                        className="h-12 border-slate-200"
                     />
                  </div>
               </div>

               <div className="flex flex-col md:flex-row gap-4 pt-4 border-t">
                  <Button 
                    onClick={runScraper} 
                    disabled={running}
                    className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 font-bold"
                  >
                     <Play size={18} className="mr-3" />
                     {running ? "SCANNING ROC DATA..." : "INITIATE EXTRACTION"}
                  </Button>
                  <Button variant="outline" className="h-14 font-bold text-slate-600 hover:bg-slate-50 border-slate-200">
                     <RotateCcw size={18} className="mr-3 text-slate-400" />
                     RESET ENGINE
                  </Button>
               </div>
            </CardContent>
         </Card>

         {/* System Health */}
         <Card className="shadow-sm border-slate-200">
            <CardHeader>
               <CardTitle className="text-md flex items-center gap-2">
                  <HardDrive size={18} className="text-emerald-600" />
                  Storage & Health
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               {[
                 { l: "Core Memory", v: "1.2 GB / 4.0 GB", p: "33%" },
                 { l: "Database Latency", v: "42ms", p: "Healthy" },
                 { l: "Node Connectivity", v: "99.2%", p: "Optimal" },
               ].map((h, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                       <span className="text-slate-500">{h.l}</span>
                       <span className="text-emerald-600">{h.p}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 rounded-full" style={{ width: i === 0 ? h.p : '100%' }} />
                    </div>
                    <p className="text-[10px] text-slate-400 italic">{h.v}</p>
                 </div>
               ))}
               <div className="pt-4 border-t">
                  <Button variant="ghost" onClick={fetchStats} className="w-full text-xs font-bold text-indigo-600 hover:bg-indigo-50">
                     <RefreshCw size={14} className="mr-2" /> Force Refresh Stats
                  </Button>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
