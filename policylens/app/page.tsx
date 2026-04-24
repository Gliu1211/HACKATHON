import Link from "next/link";
import { FEATURED_BILLS } from "@/data/bills";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Scale, Eye, BookOpen, Zap, GitCompare, Flame } from "lucide-react";

function BillCard({ bill }: { bill: (typeof FEATURED_BILLS)[0] }) {
  const partyColors: Record<string, string> = {
    D: "bg-blue-100 text-blue-800",
    R: "bg-red-100 text-red-800",
    I: "bg-gray-100 text-gray-800",
  };

  const statusColors: Record<string, string> = {
    "Signed into Law": "bg-green-100 text-green-800 border-green-200",
    "Passed House": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "In Committee": "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <Link href={`/bill/${bill.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs text-gray-600">
              {bill.billNumber}
            </Badge>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[bill.status] || "bg-gray-100 text-gray-800"}`}
            >
              {bill.status}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
          {bill.shortTitle}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{bill.summary}</p>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {bill.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
            {bill.tags.length > 3 && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                +{bill.tags.length - 3}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`px-1.5 py-0.5 rounded font-bold ${partyColors[bill.sponsorParty]}`}>
              {bill.sponsorParty}
            </span>
            <span>{bill.sponsor}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FeatureChip({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">PolicyLens</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Powered by Claude AI
            </span>
          </div>
        </div>
      </nav>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Eye className="h-4 w-4" />
            Nonpartisan bill analysis
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Democracy works when{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              people understand
            </span>{" "}
            what they&apos;re deciding.
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            We&apos;re not telling you what to think. We&apos;re showing you what you&apos;re
            missing — plain English breakdowns, every perspective, and where the real
            disagreements are.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <FeatureChip icon={BookOpen} label="Plain English Breakdown" color="bg-blue-50 text-blue-700" />
            <FeatureChip icon={GitCompare} label="Left / Center / Right Perspectives" color="bg-purple-50 text-purple-700" />
            <FeatureChip icon={Flame} label="Where Disagreement Actually Is" color="bg-orange-50 text-orange-700" />
            <FeatureChip icon={Zap} label="AI-Powered Analysis" color="bg-green-50 text-green-700" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Bills</h2>
          <p className="text-gray-600">
            Select a bill to see an AI-generated nonpartisan analysis with multiple perspectives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURED_BILLS.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How PolicyLens Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Reads the actual bill",
                desc: "We start with the real legislative text, not media summaries. Claude AI reads the full bill.",
                color: "bg-blue-100 text-blue-700",
              },
              {
                step: "2",
                title: "Breaks it down neutrally",
                desc: "Plain English summary of what changes, who it affects, and what the key provisions are.",
                color: "bg-purple-100 text-purple-700",
              },
              {
                step: "3",
                title: "Shows every perspective",
                desc: "Left, center, and right views based on real published positions from think tanks and advocacy groups.",
                color: "bg-orange-100 text-orange-700",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`w-12 h-12 rounded-2xl ${item.color} text-xl font-black flex items-center justify-center mx-auto mb-4`}>
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p className="font-medium text-gray-700 mb-1">
            &ldquo;Democracy isn&apos;t failing because people disagree. It&apos;s failing because
            people don&apos;t understand what they&apos;re disagreeing about.&rdquo;
          </p>
          <p>PolicyLens — Built for clarity, not consensus.</p>
        </div>
      </footer>
    </div>
  );
}
