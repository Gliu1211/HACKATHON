"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ArrowRight, FileText } from "lucide-react";
import { BillSearchResult } from "@/lib/congress";

export function BillSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BillSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/bills/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectBill(bill: BillSearchResult) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/bill/${bill.id}`);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      setOpen(false);
    }
  }

  const partyColors: Record<string, string> = {
    D: "bg-blue-100 text-blue-800",
    R: "bg-red-100 text-red-800",
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search any bill — e.g. &quot;infrastructure&quot;, &quot;health care&quot;, &quot;H.R. 1&quot;"
          className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          {results.map((bill) => (
            <button
              key={bill.id}
              onClick={() => selectBill(bill)}
              className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-0 flex items-start gap-3 group"
            >
              <FileText className="h-4 w-4 text-gray-400 shrink-0 mt-0.5 group-hover:text-indigo-500" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-mono text-xs text-gray-500">{bill.billNumber}</span>
                  {bill.sponsorParty && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${partyColors[bill.sponsorParty] ?? "bg-gray-100 text-gray-700"}`}>
                      {bill.sponsorParty}
                    </span>
                  )}
                  {bill.policyArea && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                      {bill.policyArea}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-800 line-clamp-1">{bill.title}</p>
                {bill.latestAction && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{bill.latestAction}</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-400 shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      )}

      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl px-4 py-6 text-center text-sm text-gray-500">
          No bills found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
