import { Citation, KeyProvision } from "@/types";
import { SourceTrace } from "@/components/SourceTrace";

interface Props {
  provision: KeyProvision;
  citations: Citation[];
}

const impactColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const impactDots = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

export function ImpactBadge({ provision, citations }: Props) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-lg border border-gray-200 bg-white">
      <span className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${impactDots[provision.impact]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-gray-900">{provision.title}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${impactColors[provision.impact]}`}>
            {provision.impact} impact
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5">{provision.description}</p>
        <SourceTrace citations={citations} ids={provision.citations} />
      </div>
    </div>
  );
}
