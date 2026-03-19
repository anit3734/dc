"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Download {
  id: string;
  file: string;
  createdAt: string;
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDownloads() {
      try {
        const res = await fetch("/api/downloads");
        const data = await res.json();
        setDownloads(data.downloads || []);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDownloads();
  }, []);

  return (
    <div className="space-y-6 pt-10 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight">Export History</h2>
      <p className="text-zinc-500">View your previously purchased data exports.</p>
      
      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead>Export ID</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>Date Generated</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : downloads.length === 0 ? (
               <TableRow><TableCell colSpan={4} className="text-center py-6 text-zinc-500">No exports found.</TableCell></TableRow>
            ) : (
              downloads.map((d) => (
                <TableRow key={d.id} className="hover:bg-zinc-50/50">
                  <TableCell className="font-mono text-xs">{d.id}</TableCell>
                  <TableCell className="font-medium text-indigo-600">{d.file}</TableCell>
                  <TableCell className="text-zinc-500 text-sm">{new Date(d.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <a href={`#`} onClick={() => alert("File stored securely. (Mock Download Link)")} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                      Download Again
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
