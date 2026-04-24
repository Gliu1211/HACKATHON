"use client";

import { Citation, ControversialSection } from "@/types";
import { Flame } from "lucide-react";
import { claimCitationIds, claimText, SourceTrace } from "@/components/SourceTrace";

interface Props {
  sections: ControversialSection[];
  citations: Citation[];
}

export function ControversySection({ sections, citations }: Props) {
  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div key={i} className="rounded-xl border border-orange-200 bg-orange-50 overflow-hidden">
          <div className="bg-orange-500 px-4 py-2 flex items-center gap-2">
            <Flame className="h-4 w-4 text-white" />
            <span className="text-white font-semibold text-sm">{section.provision}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-orange-200">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wide text-blue-700">Left View</span>
              </div>
              <p className="text-sm text-gray-700">{claimText(section.leftView)}</p>
              <SourceTrace citations={citations} ids={claimCitationIds(section.leftView)} />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-xs font-bold uppercase tracking-wide text-red-700">Right View</span>
              </div>
              <p className="text-sm text-gray-700">{claimText(section.rightView)}</p>
              <SourceTrace citations={citations} ids={claimCitationIds(section.rightView)} />
            </div>
          </div>
          <div className="px-4 py-3 bg-orange-100 border-t border-orange-200">
            <span className="text-xs font-bold uppercase tracking-wide text-orange-700">Core Disagreement: </span>
            <span className="text-sm text-gray-700">{claimText(section.coreDisagreement)}</span>
            <SourceTrace citations={citations} ids={claimCitationIds(section.coreDisagreement)} />
          </div>
          <div className="px-4 py-3 bg-white border-t border-orange-100">
            <span className="text-xs font-bold uppercase tracking-wide text-orange-700">Bill Section: </span>
            <span className="text-sm text-gray-700">{section.billSection}</span>
            <p className="mt-1 text-sm text-gray-700">{claimText(section.whyControversial)}</p>
            <SourceTrace citations={citations} ids={section.citations} />
          </div>
        </div>
      ))}
    </div>
  );
}
