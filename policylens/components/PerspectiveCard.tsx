"use client";

import { PerspectiveView, SourceRef } from "@/types";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";

interface Props {
  lean: "left" | "center" | "right";
  perspective: PerspectiveView;
}

const LEAN = {
  left:   { label: "Progressive", sub: "Left-leaning",  grad: "from-blue-600 to-blue-700",     border: "border-blue-200",   dot: "bg-blue-500",   pill: "bg-blue-50 text-blue-700 border-blue-200"   },
  center: { label: "Centrist",    sub: "Nonpartisan",    grad: "from-violet-600 to-purple-700",  border: "border-violet-200", dot: "bg-violet-500", pill: "bg-violet-50 text-violet-700 border-violet-200" },
  right:  { label: "Conservative",sub: "Right-leaning",  grad: "from-red-600 to-red-700",        border: "border-red-200",    dot: "bg-red-500",    pill: "bg-red-50 text-red-700 border-red-200"     },
};

const SUPPORT = {
  "strong support": { Icon: CheckCircle2, label: "Strong Support" },
  "lean support":   { Icon: CheckCircle2, label: "Lean Support"   },
  "mixed":          { Icon: MinusCircle,  label: "Mixed"          },
  "lean oppose":    { Icon: XCircle,      label: "Lean Oppose"    },
  "strong oppose":  { Icon: XCircle,      label: "Strong Oppose"  },
};

function SourcePill({ source }: { source: SourceRef }) {
  const colors = {
    left:   "bg-blue-50 text-blue-700 border-blue-200",
    center: "bg-violet-50 text-violet-700 border-violet-200",
    right:  "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex text-xs px-2.5 py-1 rounded-full border font-medium ${colors[source.lean]}`}>
      {source.name}
    </span>
  );
}

export function PerspectiveCard({ lean, perspective }: Props) {
  const cfg = LEAN[lean];
  const sup = SUPPORT[perspective.supportLevel] ?? SUPPORT["mixed"];
  const { Icon } = sup;

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} overflow-hidden flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow`}>
      {/* header */}
      <div className={`bg-gradient-to-br ${cfg.grad} px-5 py-4 text-white`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{cfg.sub}</p>
            <h3 className="font-black text-xl leading-none mt-0.5">{cfg.label}</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-white/15 px-2.5 py-1.5 rounded-xl shrink-0">
            <Icon className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">{sup.label}</span>
          </div>
        </div>
        <blockquote className="text-white/75 text-sm italic border-l-2 border-white/30 pl-3 mt-3 leading-relaxed">
          &ldquo;{perspective.framing}&rdquo;
        </blockquote>
      </div>

      {/* body */}
      <div className="p-5 flex flex-col gap-5 flex-1">
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Key Arguments</h4>
          <ul className="space-y-2.5">
            {perspective.keyArguments.map((arg, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-700 leading-snug">
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${cfg.dot} shrink-0`} />
                {arg}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3">Concerns</h4>
          <ul className="space-y-2.5">
            {perspective.concerns.map((c, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-500 leading-snug">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Citing</p>
          <div className="flex flex-wrap gap-1.5">
            {perspective.sources.map((s, i) => <SourcePill key={i} source={s} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
