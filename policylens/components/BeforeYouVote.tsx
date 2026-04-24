"use client";

import { BeforeYouVoteItem, Citation } from "@/types";
import { CheckSquare } from "lucide-react";
import { claimCitationIds, claimText, SourceTrace } from "@/components/SourceTrace";

interface Props {
  items: BeforeYouVoteItem[];
  citations: Citation[];
}

export function BeforeYouVote({ items, citations }: Props) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <CheckSquare className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">{item.question}</p>
            <p className="text-sm text-gray-600 mt-0.5">{claimText(item.answer)}</p>
            <SourceTrace citations={citations} ids={claimCitationIds(item.answer)} />
          </div>
        </div>
      ))}
    </div>
  );
}
