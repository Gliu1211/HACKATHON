"use client";

import { Citation, CitedClaim } from "@/types";
import { ExternalLink, FileText, Link as LinkIcon, ShieldCheck } from "lucide-react";

interface SourceTraceProps {
  citations: Citation[];
  ids: string[];
}

export function claimText(claim: CitedClaim | string) {
  return typeof claim === "string" ? claim : claim.text;
}

export function claimCitationIds(claim: CitedClaim | string) {
  return typeof claim === "string" ? [] : claim.citations;
}

function sourceIcon(sourceType: Citation["sourceType"]) {
  if (sourceType === "official_bill_text") return ShieldCheck;
  if (sourceType === "provided_bill_text") return FileText;
  return LinkIcon;
}

export function SourceTrace({ citations, ids }: SourceTraceProps) {
  const sources = ids
    .map((id) => citations.find((citation) => citation.id === id))
    .filter((citation): citation is Citation => Boolean(citation));

  if (sources.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {sources.map((source) => {
        const Icon = sourceIcon(source.sourceType);
        const label = source.sourceType === "credible_source" ? source.title : source.section || source.title;
        const content = (
          <>
            <Icon className="h-3 w-3 shrink-0" />
            <span className="truncate">{source.id}: {label}</span>
            {source.url && <ExternalLink className="h-3 w-3 shrink-0" />}
          </>
        );

        return source.url ? (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            title={source.snippet}
            className="inline-flex max-w-full items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
          >
            {content}
          </a>
        ) : (
          <span
            key={source.id}
            title={source.snippet}
            className="inline-flex max-w-full items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
          >
            {content}
          </span>
        );
      })}
    </div>
  );
}

export function SourceSnippetList({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;

  return (
    <div className="space-y-3">
      {citations.map((citation) => (
        <div key={citation.id} className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700">
            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono">{citation.id}</span>
            <span>{citation.title}</span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
              {citation.sourceType.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-gray-600">{citation.snippet}</p>
        </div>
      ))}
    </div>
  );
}
