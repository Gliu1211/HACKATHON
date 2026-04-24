import { KeyProvision } from "@/types";

interface Props { provision: KeyProvision }

const CFG = {
  high:   { border: "border-l-red-500",     badge: "bg-red-50 text-red-700 border-red-200",         label: "High Impact"   },
  medium: { border: "border-l-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200",   label: "Medium Impact" },
  low:    { border: "border-l-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Low Impact" },
};

export function ImpactBadge({ provision }: Props) {
  const cfg = CFG[provision.impact];
  return (
    <div className={`flex gap-3 p-4 rounded-xl border border-slate-200 border-l-4 ${cfg.border} bg-white hover:bg-slate-50 transition-colors`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-bold text-sm text-slate-900">{provision.title}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{provision.description}</p>
      </div>
    </div>
  );
}
