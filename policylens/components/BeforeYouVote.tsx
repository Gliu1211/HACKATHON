"use client";

import { BeforeYouVoteItem, Citation } from "@/types";
import { claimCitationIds, claimText, SourceTrace } from "@/components/SourceTrace";

interface Props {
  items: BeforeYouVoteItem[];
  citations: Citation[];
}

const COLORS = [
  { border: "border-l-indigo-500", num: "bg-indigo-600" },
  { border: "border-l-blue-500", num: "bg-blue-600" },
  { border: "border-l-violet-500", num: "bg-violet-600" },
  { border: "border-l-purple-500", num: "bg-purple-600" },
  { border: "border-l-pink-500", num: "bg-pink-600" },
];

export function BeforeYouVote({ items, citations }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
      {items.map((item, i) => {
        const color = COLORS[i % COLORS.length];
        return (
          <div key={i} className={`flex gap-4 border-l-4 p-5 transition-colors hover:bg-slate-50 ${color.border}`}>
            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow-sm ${color.num}`}>
              {i + 1}
            </div>
            <div>
              <p className="mb-1.5 text-sm font-bold text-slate-900">{item.question}</p>
              <p className="text-sm leading-relaxed text-slate-600">{claimText(item.answer)}</p>
              <SourceTrace citations={citations} ids={claimCitationIds(item.answer)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
