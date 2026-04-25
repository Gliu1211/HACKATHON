"use client";

import { Citation, ControversialSection } from "@/types";
import { claimCitationIds, claimText, SourceTrace } from "@/components/SourceTrace";
import { AlertTriangle, Flame } from "lucide-react";

interface Props {
  sections: ControversialSection[];
  citations: Citation[];
}

export function ControversySection({ sections, citations }: Props) {
  return (
    <div className="space-y-5">
      {sections.map((section, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3.5 text-white">
            <div className="shrink-0 rounded-lg bg-white/20 p-1.5">
              <Flame className="h-4 w-4" />
            </div>
            <span className="flex-1 text-sm font-bold">{section.provision}</span>
            <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">#{i + 1}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-b border-slate-100 p-5 md:border-b-0 md:border-r">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-xs font-black text-blue-700">L</span>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-700">Left View</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">{claimText(section.leftView)}</p>
              <SourceTrace citations={citations} ids={claimCitationIds(section.leftView)} />
            </div>

            <div className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <span className="text-xs font-black text-red-700">R</span>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-red-700">Right View</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">{claimText(section.rightView)}</p>
              <SourceTrace citations={citations} ids={claimCitationIds(section.rightView)} />
            </div>
          </div>

          <div className="border-t border-amber-100 bg-amber-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm text-amber-900">
                  <span className="font-bold">Core disagreement: </span>
                  {claimText(section.coreDisagreement)}
                </p>
                <SourceTrace citations={citations} ids={claimCitationIds(section.coreDisagreement)} />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{section.billSection}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{claimText(section.whyControversial)}</p>
            <SourceTrace citations={citations} ids={section.citations} />
          </div>
        </div>
      ))}
    </div>
  );
}
