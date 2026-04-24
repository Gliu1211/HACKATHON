"use client";

import { useEffect, useState } from "react";
import { Bill, BillAnalysis } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerspectiveCard } from "@/components/PerspectiveCard";
import { ControversySection } from "@/components/ControversySection";
import { BeforeYouVote } from "@/components/BeforeYouVote";
import { ImpactBadge } from "@/components/ImpactBadge";
import { ImpactCalculator } from "@/components/ImpactCalculator";
import {
  BookOpen, Users, GitCompare, Flame, CheckSquare,
  Zap, ArrowLeft, Calendar, User, Scale, UserCircle,
} from "lucide-react";
import Link from "next/link";

interface Props { bill: Bill }

const partyConfig: Record<string, { bg: string }> = {
  D: { bg: "bg-blue-500"  },
  R: { bg: "bg-red-500"   },
  I: { bg: "bg-slate-500" },
};
const statusConfig: Record<string, { dot: string; label: string; labelColor: string }> = {
  "Signed into Law": { dot: "bg-emerald-400", label: "Signed into Law", labelColor: "text-emerald-300" },
  "Passed House":    { dot: "bg-amber-400",   label: "Passed House",    labelColor: "text-amber-300"   },
  "Passed Senate":   { dot: "bg-amber-400",   label: "Passed Senate",   labelColor: "text-amber-300"   },
  "In Committee":    { dot: "bg-slate-400",   label: "In Committee",    labelColor: "text-slate-400"   },
};

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-slate-200 rounded-lg animate-pulse ${className}`} />;
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          {[0,1,2].map(i => (
            <div key={i} className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
          ))}
          <SkeletonBlock className="h-3.5 w-52" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="space-y-2.5">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-4/5" />
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-3/5" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
        <SkeletonBlock className="h-3 w-32" />
        <SkeletonBlock className="h-16 w-full" />
        <SkeletonBlock className="h-16 w-full" />
        <SkeletonBlock className="h-16 w-4/5" />
      </div>
    </div>
  );
}

const TABS = [
  { value: "breakdown",    icon: BookOpen,    label: "Breakdown"       },
  { value: "perspectives", icon: GitCompare,  label: "Perspectives"    },
  { value: "controversy",  icon: Flame,       label: "Disagreements"   },
  { value: "vote",         icon: CheckSquare, label: "Before You Vote" },
  { value: "impact",       icon: UserCircle,  label: "My Impact"       },
];

export function BillAnalysisClient({ bill }: Props) {
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analyze/${bill.id}`);
      if (!res.ok) throw new Error("failed");
      setAnalysis(await res.json());
    } catch {
      setError("Failed to load analysis. Make sure your API key is set.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [bill.id]);

  const party  = partyConfig[bill.sponsorParty]  ?? partyConfig["I"];
  const status = statusConfig[bill.status] ?? { dot: "bg-slate-400", label: bill.status, labelColor: "text-slate-400" };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky nav ── */}
      <nav className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1 rounded-md shrink-0">
              <Scale className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-black text-white text-sm">PolicyLens</span>
            <span className="text-white/20 hidden sm:block">·</span>
            <span className="text-sm text-slate-400 truncate hidden sm:block">{bill.shortTitle}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ── Bill header card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* dark banner */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-6">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="font-mono text-xs font-bold text-slate-500 tracking-widest uppercase">
                {bill.billNumber}
              </span>
              <span className="text-slate-700">·</span>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                <span className={`text-xs font-semibold ${status.labelColor}`}>{status.label}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
              {bill.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                Sponsored by{" "}
                <span className="text-slate-200 font-semibold">{bill.sponsor}</span>
                <span className={`h-5 w-5 rounded-full ${party.bg} text-white text-xs font-black flex items-center justify-center`}>
                  {bill.sponsorParty}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>Introduced {new Date(bill.introducedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* summary strip */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <p className="text-sm text-slate-600 leading-relaxed">{bill.summary}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {bill.tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div>
            <div className="flex items-center gap-3 mb-5 px-1">
              {[0,1,2].map(i => (
                <div key={i} className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
              ))}
              <span className="text-sm font-medium text-slate-500">AI is reading and analyzing the bill…</span>
            </div>
            <AnalysisSkeleton />
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-800 font-bold mb-1">{error}</p>
            <p className="text-red-500 text-sm mb-5">
              Make sure <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono text-xs">MISTRAL_API_KEY</code> is set in your{" "}
              <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono text-xs">.env.local</code>.
            </p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Analysis ── */}
        {analysis && (
          <>
            {/* TL;DR */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
              <div className="relative flex items-start gap-4">
                <div className="bg-white/15 rounded-xl p-2.5 shrink-0">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">TL;DR — Plain English Summary</p>
                  <p className="text-white text-lg leading-relaxed font-medium">{analysis.tldr}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="breakdown" className="space-y-4">
              <TabsList className="bg-white border border-slate-200 p-1.5 rounded-xl h-auto flex flex-wrap gap-1 shadow-sm">
                {TABS.map(({ value, icon: Icon, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="flex items-center gap-1.5 text-sm rounded-lg px-3 py-2 font-medium
                      data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Breakdown */}
              <TabsContent value="breakdown" className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: "What It Does", dot: "bg-blue-500", accent: "text-blue-600", border: "border-l-blue-500",
                      items: analysis.whatItDoes,
                      render: (item: string, i: number) => (
                        <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                          <span className="font-black text-blue-400 shrink-0 tabular-nums">{i + 1}.</span>
                          {item}
                        </li>
                      ),
                    },
                    {
                      title: "Who It Affects", dot: "bg-emerald-500", accent: "text-emerald-600", border: "border-l-emerald-500",
                      items: analysis.whoItAffects,
                      render: (item: string, i: number) => (
                        <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                          <Users className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ),
                    },
                    {
                      title: "What Changes", dot: "bg-orange-500", accent: "text-orange-600", border: "border-l-orange-500",
                      items: analysis.whatChanges,
                      render: (item: string, i: number) => (
                        <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                          <span className="font-bold text-orange-400 shrink-0">→</span>
                          {item}
                        </li>
                      ),
                    },
                  ].map(({ title, dot, accent, border, items, render }) => (
                    <div key={title} className={`bg-white rounded-xl border-l-4 border ${border} border-slate-200 p-5 shadow-sm`}>
                      <h3 className={`font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2 ${accent}`}>
                        <span className={`h-2 w-2 rounded-full ${dot}`} />{title}
                      </h3>
                      <ul className="space-y-2.5">{items.map(render)}</ul>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    Key Provisions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.keyProvisions.map((p, i) => <ImpactBadge key={i} provision={p} />)}
                  </div>
                </div>
              </TabsContent>

              {/* Perspectives */}
              <TabsContent value="perspectives" className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <p className="text-sm text-indigo-800 flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span><strong>Not telling you what to think</strong> — showing how different sides interpret the same bill, based on published positions from think tanks and advocacy groups.</span>
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <PerspectiveCard lean="left"   perspective={analysis.perspectives.left}   />
                  <PerspectiveCard lean="center" perspective={analysis.perspectives.center} />
                  <PerspectiveCard lean="right"  perspective={analysis.perspectives.right}  />
                </div>
              </TabsContent>

              {/* Controversy */}
              <TabsContent value="controversy" className="space-y-4">
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <p className="text-sm text-orange-800">
                    These are the specific provisions where disagreement is sharpest — where left and right are talking past each other the most.
                  </p>
                </div>
                <ControversySection sections={analysis.controversialSections} />
              </TabsContent>

              {/* Before You Vote */}
              <TabsContent value="vote" className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-sm text-emerald-800">
                    Five questions you should be able to answer before forming an opinion on this bill.
                  </p>
                </div>
                <BeforeYouVote items={analysis.beforeYouVote} />
              </TabsContent>

              {/* My Impact */}
              <TabsContent value="impact">
                <ImpactCalculator billId={bill.id} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-slate-400">
          PolicyLens — Built for clarity, not consensus.
        </div>
      </footer>
    </div>
  );
}
