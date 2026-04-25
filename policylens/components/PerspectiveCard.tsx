"use client";

import { Citation, PerspectiveView, SourceRef } from "@/types";
import { claimCitationIds, claimText, SourceTrace } from "@/components/SourceTrace";
import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";

interface Props {
  lean: "left" | "center" | "right";
  perspective: PerspectiveView;
  citations: Citation[];
}

const LEAN = {
  left: { label: "Progressive", sub: "Left-leaning", grad: "from-blue-600 to-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  center: { label: "Centrist", sub: "Nonpartisan", grad: "from-violet-600 to-purple-700", border: "border-violet-200", dot: "bg-violet-500" },
  right: { label: "Conservative", sub: "Right-leaning", grad: "from-red-600 to-red-700", border: "border-red-200", dot: "bg-red-500" },
};

const SUPPORT = {
  "strong support": { Icon: CheckCircle2, label: "Strong Support" },
  "lean support": { Icon: CheckCircle2, label: "Lean Support" },
  mixed: { Icon: MinusCircle, label: "Mixed" },
  "lean oppose": { Icon: XCircle, label: "Lean Oppose" },
  "strong oppose": { Icon: XCircle, label: "Strong Oppose" },
};

function SourcePill({ source }: { source: SourceRef }) {
  const colors = {
    left: "bg-blue-50 text-blue-700 border-blue-200",
    center: "bg-violet-50 text-violet-700 border-violet-200",
    right: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${colors[source.lean]}`}>
      {source.name}
    </span>
  );
}

export function PerspectiveCard({ lean, perspective, citations }: Props) {
  const cfg = LEAN[lean];
  const support = SUPPORT[perspective.supportLevel] ?? SUPPORT.mixed;
  const { Icon } = support;

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-shadow hover:shadow-md ${cfg.border}`}>
      <div className={`bg-gradient-to-br px-5 py-4 text-white ${cfg.grad}`}>
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">{cfg.sub}</p>
            <h3 className="mt-0.5 text-xl font-black leading-none">{cfg.label}</h3>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/15 px-2.5 py-1.5">
            <Icon className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">{support.label}</span>
          </div>
        </div>
        <blockquote className="mt-3 border-l-2 border-white/30 pl-3 text-sm italic leading-relaxed text-white/75">
          &ldquo;{claimText(perspective.framing)}&rdquo;
        </blockquote>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5">
        <div>
          <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Key Arguments</h4>
          <ul className="space-y-2.5">
            {perspective.keyArguments.map((arg, i) => (
              <li key={i} className="text-sm leading-snug text-slate-700">
                <div className="flex gap-2.5">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
                  <span>{claimText(arg)}</span>
                </div>
                <SourceTrace citations={citations} ids={claimCitationIds(arg)} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-300">Concerns</h4>
          <ul className="space-y-2.5">
            {perspective.concerns.map((concern, i) => (
              <li key={i} className="text-sm leading-snug text-slate-500">
                <div className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  <span>{claimText(concern)}</span>
                </div>
                <SourceTrace citations={citations} ids={claimCitationIds(concern)} />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Citing</p>
          <div className="flex flex-wrap gap-1.5">
            {perspective.sources.map((source, i) => (
              <SourcePill key={i} source={source} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
