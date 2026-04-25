"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Loader2, Search } from "lucide-react";
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
    if (query.length < 2) return;
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

  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      setOpen(false);
    }
  }

  function selectBill(bill: BillSearchResult) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/bill/${bill.id}`);
  }

  const partyColors: Record<string, string> = {
    D: "bg-blue-100 text-blue-800",
    R: "bg-red-100 text-red-800",
  };

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={'Search any bill - "infrastructure", "health care", "H.R. 1"...'}
          className="w-full rounded-2xl border border-white/20 bg-white/10 py-4 pl-12 pr-12 text-sm text-white shadow-lg backdrop-blur-sm placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {loading ? (
          <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-slate-400" />
        ) : null}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          {results.map((bill) => (
            <button
              key={bill.id}
              onClick={() => selectBill(bill)}
              className="group flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-indigo-50"
            >
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 group-hover:text-indigo-500" />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-gray-500">{bill.billNumber}</span>
                  {bill.sponsorParty && (
                    <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${partyColors[bill.sponsorParty] ?? "bg-gray-100 text-gray-700"}`}>
                      {bill.sponsorParty}
                    </span>
                  )}
                  {bill.policyArea && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {bill.policyArea}
                    </span>
                  )}
                </div>
                <p className="line-clamp-1 text-sm text-gray-800">{bill.title}</p>
                {bill.latestAction && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{bill.latestAction}</p>
                )}
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-300 group-hover:text-indigo-400" />
            </button>
          ))}
        </div>
      )}

      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500 shadow-xl">
          No bills found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
