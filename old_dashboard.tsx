"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

interface Company {
  cin: string;
  name: string;
  state: string;
  status: string;
  registration_date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [page, search]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies?page=${page}&limit=10&search=${search}`);
      const data = await res.json();
      setCompanies(data.companies || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (cin: string) => {
    setSelectedIds(prev =>
      prev.includes(cin) ? prev.filter(id => id !== cin) : [...prev, cin]
    );
  };

  const handleExport = async (format: "csv" | "excel") => {
    if (selectedIds.length === 0) return alert("Select at least one company");
    setExportLoading(true);

    try {
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 50 * selectedIds.length }), 
      });
      const orderData = await orderRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock123",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ZaubaCorp Scraper API",
        description: `Export ${format.toUpperCase()} Data`,
        order_id: orderData.id,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/webhooks/razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          
          if (verifyRes.ok) {
            const exportRes = await fetch("/api/export", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ format, paymentId: orderData.id, companyCins: selectedIds }),
            });
            
            if (exportRes.ok) {
              const blob = await exportRes.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `companies_${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'}`;
              a.click();
              alert("Download successful!");
            } else {
              alert("Failed to generate export");
            }
          }
        },
        theme: { color: "#4f46e5" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error(e);
      alert("Error initiating export flow");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Companies</h2>
        <div className="flex gap-3">
          <Button disabled={exportLoading || selectedIds.length === 0} onClick={() => handleExport("csv")} variant="outline">
            Export CSV
          </Button>
          <Button disabled={exportLoading || selectedIds.length === 0} onClick={() => handleExport("excel")} className="bg-green-600 hover:bg-green-700 text-white">
            Export Excel
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Input 
          placeholder="Search records in local database..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="max-w-md bg-white"
        />
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={companies.length > 0 && selectedIds.length === companies.length}
                  onCheckedChange={(checked) => setSelectedIds(checked ? companies.map(c => c.cin) : [])}
                />
              </TableHead>
              <TableHead>CIN</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reg Date</TableHead>
              <TableHead className="text-right pr-6">Profile</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : companies.length === 0 ? (
               <TableRow><TableCell colSpan={7} className="text-center py-6 text-zinc-500">No companies found in database.</TableCell></TableRow>
            ) : (
              companies.map((c) => (
                <TableRow key={c.cin} className="hover:bg-zinc-50/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(c.cin)}
                      onCheckedChange={() => toggleSelection(c.cin)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.cin}</TableCell>
                  <TableCell className="font-medium text-sm">{c.name}</TableCell>
                  <TableCell>{c.state}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.status || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm">{c.registration_date}</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="link" className="text-indigo-600 font-bold h-auto p-0" onClick={() => router.push(`/dashboard/company/${c.cin}`)}>
                      Explore
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">Showing page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      </div>
    </div>
  );
}
