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
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res  = await fetch(`/api/bills/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch { setResults([]); }
      finally  { setLoading(false); }
    }, 400);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectBill(bill: BillSearchResult) {
    setOpen(false); setQuery("");
    router.push(`/bill/${bill.id}`);
  }

  const partyColors: Record<string, string> = {
    D: "bg-blue-500 text-white",
    R: "bg-red-500 text-white",
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder='Search any bill — "infrastructure", "health care", "H.R. 1"…'
          className="w-full pl-12 pr-12 py-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm shadow-lg"
        />
        {loading
          ? <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 animate-spin" />
          : query && <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 opacity-0" />
        }
      </div>

      {/* dropdown */}
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
          {results.map(bill => (
            <button
              key={bill.id}
              onClick={() => selectBill(bill)}
              className="w-full text-left px-4 py-3.5 hover:bg-indigo-50 transition-colors border-b border-slate-100 last:border-0 flex items-start gap-3 group"
            >
              <div className="h-8 w-8 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                <FileText className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-mono text-xs font-bold text-slate-400">{bill.billNumber}</span>
                  {bill.sponsorParty && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-black ${partyColors[bill.sponsorParty] ?? "bg-slate-200 text-slate-700"}`}>
                      {bill.sponsorParty}
                    </span>
                  )}
                  {bill.policyArea && (
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{bill.policyArea}</span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-800 line-clamp-1">{bill.title}</p>
                {bill.latestAction && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{bill.latestAction}</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 shrink-0 mt-1 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl px-4 py-8 text-center">
          <p className="text-sm font-medium text-slate-500">No bills found for &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-slate-400 mt-1">Try a different keyword or bill number</p>
        </div>
      )}
    </div>
  );
}
