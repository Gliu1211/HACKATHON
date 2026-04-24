"use client";

import { Citation, PerspectiveView, SourceRef } from "@/types";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { claimCitationIds, claimText, SourceTrace } from "@/components/SourceTrace";

interface Props {
  lean: "left" | "center" | "right";
  perspective: PerspectiveView;
  citations: Citation[];
}

const LEAN_CONFIG = {
  left: {
    label: "Progressive / Left",
    color: "bg-blue-50 border-blue-200",
    headerBg: "bg-blue-600",
    badgeColor: "bg-blue-100 text-blue-800",
    accent: "text-blue-700",
    dot: "bg-blue-500",
  },
  center: {
    label: "Centrist / Nonpartisan",
    color: "bg-purple-50 border-purple-200",
    headerBg: "bg-purple-600",
    badgeColor: "bg-purple-100 text-purple-800",
    accent: "text-purple-700",
    dot: "bg-purple-500",
  },
  right: {
    label: "Conservative / Right",
    color: "bg-red-50 border-red-200",
    headerBg: "bg-red-600",
    badgeColor: "bg-red-100 text-red-800",
    accent: "text-red-700",
    dot: "bg-red-500",
  },
};

const SUPPORT_ICONS = {
  "strong support": { icon: CheckCircle, color: "text-green-600", label: "Strong Support" },
  "lean support": { icon: CheckCircle, color: "text-green-500", label: "Lean Support" },
  mixed: { icon: AlertCircle, color: "text-yellow-500", label: "Mixed" },
  "lean oppose": { icon: XCircle, color: "text-red-500", label: "Lean Oppose" },
  "strong oppose": { icon: XCircle, color: "text-red-600", label: "Strong Oppose" },
};

function SourceBadge({ source }: { source: SourceRef }) {
  const leanColors = {
    left: "bg-blue-100 text-blue-700 border-blue-200",
    center: "bg-purple-100 text-purple-700 border-purple-200",
    right: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${leanColors[source.lean]}`}>
      {source.name}
    </span>
  );
}

export function PerspectiveCard({ lean, perspective, citations }: Props) {
  const config = LEAN_CONFIG[lean];
  const supportInfo = SUPPORT_ICONS[perspective.supportLevel];
  const SupportIcon = supportInfo.icon;

  return (
    <div className={`rounded-xl border-2 ${config.color} overflow-hidden flex flex-col`}>
      <div className={`${config.headerBg} px-4 py-3 text-white`}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm tracking-wide uppercase">{config.label}</span>
          <div className={`flex items-center gap-1 text-white/90`}>
            <SupportIcon className="h-4 w-4" />
            <span className="text-xs font-medium">{supportInfo.label}</span>
          </div>
        </div>
        <p className="text-white/80 text-sm mt-1 italic">&ldquo;{claimText(perspective.framing)}&rdquo;</p>
      </div>

      <div className="p-4 flex flex-col gap-4 flex-1">
        <div>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${config.accent}`}>
            Key Arguments
          </h4>
          <ul className="space-y-1.5">
            {perspective.keyArguments.map((arg, i) => (
              <li key={i} className="text-sm text-gray-700">
                <div className="flex gap-2">
                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${config.dot} shrink-0`} />
                  <span>{claimText(arg)}</span>
                </div>
                <SourceTrace citations={citations} ids={claimCitationIds(arg)} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${config.accent}`}>
            Concerns / Criticisms
          </h4>
          <ul className="space-y-1.5">
            {perspective.concerns.map((c, i) => (
              <li key={i} className="text-sm text-gray-600">
                <div className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                  <span>{claimText(c)}</span>
                </div>
                <SourceTrace citations={citations} ids={claimCitationIds(c)} />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1.5 font-medium">Citing sources from:</p>
          <div className="flex flex-wrap gap-1.5">
            {perspective.sources.map((s, i) => (
              <SourceBadge key={i} source={s} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
