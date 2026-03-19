"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, ShieldCheck, Mail, MapPin, Building2, TrendingUp, Handshake } from "lucide-react";

export default function CompanyProfilePage() {
  const { cin } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false); // In real app, check if user paid for this CIN
  const [unlockLoading, setUnlockLoading] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, [cin]);

  const fetchCompany = async () => {
    try {
      const res = await fetch(`/api/companies/${cin}`);
      const data = await res.json();
      setCompany(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    setUnlockLoading(true);
    // Mimic the Razorpay payment flow for profile unlock
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 199, type: "profile_unlock", targetId: cin }),
      });
      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "ZaubaScope Premium",
        description: `Unlock Full Profile for ${company?.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          setIsUnlocked(true);
          alert("Profile Unlocked Successfully!");
        },
        theme: { color: "#4f46e5" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error(e);
    } finally {
      setUnlockLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin" /></div>;
  if (!company) return <div className="text-center py-20">Company signal lost.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-2xl border shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{company.name}</h1>
            <Badge variant={company.status === "Active" ? "default" : "destructive"} className="uppercase tracking-wider px-3">
              {company.status}
            </Badge>
          </div>
          <p className="font-mono text-zinc-500 flex items-center gap-2">
            <Building2 size={16} /> {company.cin}
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>Back to Matrix</Button>
          {!isUnlocked && (
            <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-200 border-0" onClick={handleUnlock}>
               {unlockLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Lock className="mr-2" size={18} />}
               Unlock Full Intelligence (₹199)
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Main Stats & Contact */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border shadow-none rounded-2xl">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin size={18} /> Contact Matrix</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Base Registrar</label>
                <p className="text-sm font-medium">{company.state || "Unknown RoC"}</p>
              </div>
              <div className={!isUnlocked ? "blur-sm select-none opacity-50 relative pointer-events-none" : ""}>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Digital Signal</label>
                <p className="text-sm font-medium flex items-center gap-2 italic"><Mail size={14} /> {company.email || "N/A"}</p>
              </div>
              <div className={!isUnlocked ? "blur-sm select-none opacity-50 relative pointer-events-none" : ""}>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Registered HQ</label>
                <p className="text-sm border-l-2 border-indigo-100 pl-4 py-1 mt-1">{company.address || "Encrypted address detail"}</p>
              </div>
              {!isUnlocked && (
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold py-2">
                  <Lock size={12} /> Unlock profile to reveal contact details
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-none rounded-2xl bg-indigo-50/30">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp size={18} /> Financial Signals</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Auth Capital</label>
                  <p className="text-lg font-bold">₹{company.authorized_capital?.toLocaleString() || "0"}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Paid Capital</label>
                  <p className="text-lg font-bold">₹{company.paid_up_capital?.toLocaleString() || "0"}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Incorporation Date</label>
                <p className="text-sm font-medium">{company.registration_date || "Unknown"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Detailed Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="directors" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-xl bg-zinc-100 p-1">
              <TabsTrigger value="directors" className="rounded-lg">Board of Directors</TabsTrigger>
              <TabsTrigger value="legal" className="rounded-lg">Legal Charges</TabsTrigger>
              <TabsTrigger value="classification" className="rounded-lg">Classification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="directors" className="mt-6">
              <div className="border rounded-2xl bg-white overflow-hidden">
                <Table>
                  <TableHeader className="bg-zinc-50">
                    <TableRow>
                      <TableHead>DIN</TableHead>
                      <TableHead>Director Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Appointed On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {company.directors?.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-mono text-xs">{d.din}</TableCell>
                        <TableCell className="font-semibold text-zinc-800">{d.name}</TableCell>
                        <TableCell>{d.designation}</TableCell>
                        <TableCell className="text-zinc-500 text-sm">{d.appointment_date}</TableCell>
                      </TableRow>
                    ))}
                    {!company.directors?.length && (
                      <TableRow><TableCell colSpan={4} className="text-center py-6 text-zinc-400">No signals for board members found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="legal" className="mt-6">
              <div className={!isUnlocked ? "relative" : ""}>
                {!isUnlocked && (
                   <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-2xl p-6 text-center">
                      <Lock size={40} className="text-indigo-400 mb-2" />
                      <h4 className="text-lg font-bold">Legal Intelligence Obscured</h4>
                      <p className="text-sm text-zinc-500 max-w-sm mb-4">You need to unlock this profile to view the history of legal charges, liens, and corporate liabilities.</p>
                      <Button size="sm" onClick={handleUnlock}>Unlock Now</Button>
                   </div>
                )}
                <div className={`border rounded-2xl bg-white overflow-hidden ${!isUnlocked ? "blur-sm grayscale" : ""}`}>
                  <Table>
                    <TableHeader className="bg-zinc-50">
                      <TableRow>
                        <TableHead>Charge ID</TableHead>
                        <TableHead>Creation Date</TableHead>
                        <TableHead>Amount (₹)</TableHead>
                        <TableHead>Holder</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {company.charges?.map((c: any) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono text-xs">{c.charge_id}</TableCell>
                          <TableCell>{c.date}</TableCell>
                          <TableCell className="font-bold">₹{c.amount?.toLocaleString()}</TableCell>
                          <TableCell className="text-xs max-w-[150px] truncate">{c.holder}</TableCell>
                          <TableCell>
                             <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="classification" className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl border bg-white">
                    <label className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest">Category</label>
                    <p className="font-semibold text-zinc-800">{company.category || "N/A"}</p>
                 </div>
                 <div className="p-4 rounded-xl border bg-white">
                    <label className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest">Sub-Category</label>
                    <p className="font-semibold text-zinc-800">{company.sub_category || "N/A"}</p>
                 </div>
                 <div className="p-4 rounded-xl border bg-white">
                    <label className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest">Class</label>
                    <p className="font-semibold text-zinc-800">{company.class || "N/A"}</p>
                 </div>
                 <div className="p-4 rounded-xl border bg-white">
                    <label className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest">Industrial Matrix</label>
                    <p className="font-semibold text-zinc-800 text-sm">Maintained by official Registrar.</p>
                 </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
