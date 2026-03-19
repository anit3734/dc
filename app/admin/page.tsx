"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScrape = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/scraper/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchQuery: query || "A" }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
      setResult({ message: "An error occurred during scraping" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-10">
      <h2 className="text-3xl font-bold tracking-tight">Admin Terminal</h2>
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Run ZaubaCorp Scraper Engine</CardTitle>
          <CardDescription>Enter a query to programmatically scrape company data via Playwright.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input 
              placeholder="Search Query (leave blank for default A-Z mock)" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={handleScrape} disabled={loading} className="w-[150px]">
              {loading ? "Scraping..." : "Run Scraper"}
            </Button>
          </div>
          {result && (
            <div className="mt-8 p-4 bg-zinc-100 rounded-md text-sm font-mono overflow-auto max-h-96">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
