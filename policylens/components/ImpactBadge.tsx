import { Citation, KeyProvision } from "@/types";
import { SourceTrace } from "@/components/SourceTrace";

interface Props {
  provision: KeyProvision;
  citations: Citation[];
}

const CFG = {
  high: { border: "border-l-red-500", badge: "bg-red-50 text-red-700 border-red-200", label: "High Impact" },
  medium: { border: "border-l-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Medium Impact" },
  low: { border: "border-l-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Low Impact" },
};

export function ImpactBadge({ provision, citations }: Props) {
  const cfg = CFG[provision.impact];
  return (
    <div className={`flex gap-3 rounded-xl border border-l-4 border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 ${cfg.border}`}>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-900">{provision.title}</span>
          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-500">{provision.description}</p>
        <SourceTrace citations={citations} ids={provision.citations} />
      </div>
    </div>
  );
}
