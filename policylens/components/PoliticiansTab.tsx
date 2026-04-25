"use client";

import { useEffect, useState } from "react";
import { Loader2, ThumbsUp, ThumbsDown, Minus, AlertCircle } from "lucide-react";
import { PoliticiansResult, PoliticianPosition } from "@/app/api/politicians/[id]/route";

const PARTY_COLORS: Record<string, string> = {
  D: "bg-blue-100 text-blue-800",
  R: "bg-red-100 text-red-800",
  I: "bg-gray-100 text-gray-800",
};

const STANCE_CONFIG = {
  "strong support": { color: "text-green-700", bar: "bg-green-500", width: "w-full" },
  "lean support": { color: "text-green-600", bar: "bg-green-400", width: "w-3/4" },
  neutral: { color: "text-gray-500", bar: "bg-gray-400", width: "w-1/2" },
  "lean oppose": { color: "text-red-600", bar: "bg-red-400", width: "w-3/4" },
  "strong oppose": { color: "text-red-700", bar: "bg-red-500", width: "w-full" },
};

function PoliticianCard({ p, side }: { p: PoliticianPosition; side: "support" | "oppose" | "notable" }) {
  const stance = STANCE_CONFIG[p.stance] ?? STANCE_CONFIG.neutral;
  const borderColor = side === "support" ? "border-green-200" : side === "oppose" ? "border-red-200" : "border-gray-200";
  const headerBg = side === "support" ? "bg-green-50" : side === "oppose" ? "bg-red-50" : "bg-gray-50";

  return (
    <div className={`rounded-xl border ${borderColor} overflow-hidden bg-white`}>
      <div className={`${headerBg} px-4 py-3 flex items-start justify-between gap-2`}>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-sm">{p.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${PARTY_COLORS[p.party] ?? PARTY_COLORS.I}`}>
              {p.party}-{p.state}
            </span>
            {p.role === "sponsor" && (
              <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                Sponsor
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{p.title}</p>
        </div>
        <span className={`text-xs font-semibold shrink-0 ${stance.color}`}>
          {p.stance.replace("strong ", "").replace("lean ", "")}
        </span>
      </div>
      <div className="px-4 py-3 space-y-2">
        <blockquote className="text-sm text-gray-700 italic border-l-2 border-gray-200 pl-3">
          {p.quote}
        </blockquote>
        <p className="text-xs text-gray-500">{p.reasoning}</p>
      </div>
    </div>
  );
}

interface Props {
  billId: string;
}

export function PoliticiansTab({ billId }: Props) {
  const [data, setData] = useState<PoliticiansResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/politicians/${billId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [billId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading politician positions…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-sm text-red-700">
        {error ?? "Failed to load politician data"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2 text-sm text-amber-800">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>Positions and quotes are AI-generated summaries of publicly known stances — not verbatim statements. Always verify with primary sources.</span>
      </div>

      {data.context && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-700">{data.context}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.supporters.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              <h3 className="font-bold text-gray-900">Supporting</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{data.supporters.length}</span>
            </div>
            {data.supporters.map((p, i) => (
              <PoliticianCard key={i} p={p} side="support" />
            ))}
          </div>
        )}

        {data.opponents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-red-600" />
              <h3 className="font-bold text-gray-900">Opposing</h3>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{data.opponents.length}</span>
            </div>
            {data.opponents.map((p, i) => (
              <PoliticianCard key={i} p={p} side="oppose" />
            ))}
          </div>
        )}
      </div>

      {data.notable.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-gray-500" />
            <h3 className="font-bold text-gray-900">Notable / Mixed</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.notable.map((p, i) => (
              <PoliticianCard key={i} p={p} side="notable" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
