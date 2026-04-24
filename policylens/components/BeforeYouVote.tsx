"use client";

import { BeforeYouVoteItem } from "@/types";

interface Props { items: BeforeYouVoteItem[] }

const COLORS = [
  { border: "border-l-indigo-500",  num: "bg-indigo-600"  },
  { border: "border-l-blue-500",    num: "bg-blue-600"    },
  { border: "border-l-violet-500",  num: "bg-violet-600"  },
  { border: "border-l-purple-500",  num: "bg-purple-600"  },
  { border: "border-l-pink-500",    num: "bg-pink-600"    },
];

export function BeforeYouVote({ items }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
      {items.map((item, i) => {
        const c = COLORS[i % COLORS.length];
        return (
          <div key={i} className={`flex gap-4 p-5 border-l-4 ${c.border} hover:bg-slate-50 transition-colors`}>
            <div className={`h-7 w-7 rounded-full ${c.num} text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
              {i + 1}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm mb-1.5">{item.question}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
