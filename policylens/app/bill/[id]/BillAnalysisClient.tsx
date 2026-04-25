"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bill, BillAnalysis, CitedClaim } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerspectiveCard } from "@/components/PerspectiveCard";
import { ControversySection } from "@/components/ControversySection";
import { BeforeYouVote } from "@/components/BeforeYouVote";
import { ImpactBadge } from "@/components/ImpactBadge";
import { ImpactCalculator } from "@/components/ImpactCalculator";
import { PoliticiansTab } from "@/components/PoliticiansTab";
import {
  claimCitationIds,
  claimText,
  SourceSnippetList,
  SourceTrace,
} from "@/components/SourceTrace";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckSquare,
  Flame,
  GitCompare,
  Loader2,
  MessageSquareQuote,
  Scale,
  ShieldCheck,
  Sparkles,
  User,
  UserCircle,
  Users,
  Zap,
} from "lucide-react";

interface Props {
  bill: Bill;
}

const partyConfig: Record<string, { bg: string }> = {
  D: { bg: "bg-blue-500" },
  R: { bg: "bg-red-500" },
  I: { bg: "bg-slate-500" },
};

const statusConfig: Record<string, { dot: string; label: string; labelColor: string }> = {
  "Signed into Law": { dot: "bg-emerald-400", label: "Signed into Law", labelColor: "text-emerald-300" },
  "Passed House": { dot: "bg-amber-400", label: "Passed House", labelColor: "text-amber-300" },
  "Passed Senate": { dot: "bg-amber-400", label: "Passed Senate", labelColor: "text-amber-300" },
  "In Committee": { dot: "bg-slate-400", label: "In Committee", labelColor: "text-slate-400" },
};

const TABS = [
  { value: "breakdown", icon: BookOpen, label: "Breakdown" },
  { value: "perspectives", icon: GitCompare, label: "Perspectives" },
  { value: "controversy", icon: Flame, label: "Disagreements" },
  { value: "politicians", icon: MessageSquareQuote, label: "Politicians" },
  { value: "vote", icon: CheckSquare, label: "Before You Vote" },
  { value: "sources", icon: ShieldCheck, label: "Sources" },
  { value: "impact", icon: UserCircle, label: "My Impact" },
];

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8">
        <div className="mb-2 flex items-center gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
          <SkeletonBlock className="h-3.5 w-52" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-8">
        <SkeletonBlock className="h-3 w-32" />
        <SkeletonBlock className="h-16 w-full" />
        <SkeletonBlock className="h-16 w-full" />
        <SkeletonBlock className="h-16 w-4/5" />
      </div>
    </div>
  );
}

function CitedListItem({
  claim,
  citations,
  marker,
}: {
  claim: CitedClaim;
  citations: BillAnalysis["citations"];
  marker: React.ReactNode;
}) {
  return (
    <li className="text-sm text-slate-700">
      <div className="flex gap-2.5">
        {marker}
        <span>{claimText(claim)}</span>
      </div>
      <SourceTrace citations={citations} ids={claimCitationIds(claim)} />
    </li>
  );
}

export function BillAnalysisClient({ bill }: Props) {
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eli5, setEli5] = useState<string | null>(null);
  const [eli5Loading, setEli5Loading] = useState(false);
  const [showEli5, setShowEli5] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analyze/${bill.id}`);
      if (!res.ok) throw new Error("failed");
      setAnalysis((await res.json()) as BillAnalysis);
    } catch {
      setError("Failed to load analysis. Make sure your API key is set.");
    } finally {
      setLoading(false);
    }
  }, [bill.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timer);
  }, [load]);

  async function loadEli5() {
    if (eli5) {
      setShowEli5(true);
      return;
    }
    setEli5Loading(true);
    try {
      const res = await fetch(`/api/eli5/${bill.id}`);
      const data = await res.json();
      if (data.explanation) {
        setEli5(data.explanation);
        setShowEli5(true);
      }
    } finally {
      setEli5Loading(false);
    }
  }

  const party = partyConfig[bill.sponsorParty] ?? partyConfig.I;
  const status = statusConfig[bill.status] ?? {
    dot: "bg-slate-400",
    label: bill.status,
    labelColor: "text-slate-400",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex min-w-0 items-center gap-2">
            <div className="shrink-0 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 p-1">
              <Scale className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-black text-white">PolicyLens</span>
            <span className="hidden text-white/20 sm:block">.</span>
            <span className="hidden truncate text-sm text-slate-400 sm:block">{bill.shortTitle}</span>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-6">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
                {bill.billNumber}
              </span>
              <span className="text-slate-700">.</span>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                <span className={`text-xs font-semibold ${status.labelColor}`}>{status.label}</span>
              </div>
            </div>
            <h1 className="mb-4 text-2xl font-black leading-tight text-white sm:text-3xl">{bill.title}</h1>
            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                Sponsored by <span className="font-semibold text-slate-200">{bill.sponsor}</span>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-black text-white ${party.bg}`}>
                  {bill.sponsorParty}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Introduced{" "}
                  {new Date(bill.introducedDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
            <p className="text-sm leading-relaxed text-slate-600">{bill.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {bill.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div>
            <div className="mb-5 flex items-center gap-3 px-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 animate-bounce rounded-full bg-indigo-500"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
              <span className="text-sm font-medium text-slate-500">AI is reading and analyzing the bill...</span>
            </div>
            <AnalysisSkeleton />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="mb-1 font-bold text-red-800">{error}</p>
            <p className="mb-5 text-sm text-red-500">
              Make sure <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs">MISTRAL_API_KEY</code> is set in your{" "}
              <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs">.env.local</code>.
            </p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {analysis && (
          <>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white shadow-lg shadow-indigo-500/20">
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}
              />
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="shrink-0 rounded-xl bg-white/15 p-2.5">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="space-y-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-200">TL;DR - Plain English Summary</p>
                    {showEli5 && eli5 ? (
                      <>
                        <p className="text-lg font-medium leading-relaxed text-white">{eli5}</p>
                        <p className="mt-2 text-xs text-white/40">Simplified - tap button to switch back</p>
                      </>
                    ) : (
                      analysis.tldr.map((claim, i) => (
                        <div key={i}>
                          <p className="text-lg font-medium leading-relaxed text-white">{claimText(claim)}</p>
                          <SourceTrace citations={analysis.citations} ids={claimCitationIds(claim)} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <button
                  onClick={() => (showEli5 ? setShowEli5(false) : loadEli5())}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/25"
                >
                  {eli5Loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {showEli5 ? "Original" : "ELI12"}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                Source traceability is on
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Analysis is grounded in {analysis.sourceAudit.billTextSource.replaceAll("_", " ")}
                {analysis.sourceAudit.credibleSourcesProvided > 0
                  ? ` plus ${analysis.sourceAudit.credibleSourcesProvided} supplied credible source snippet(s).`
                  : ". No outside opinion sources were supplied, so unsupported perspectives are labeled as not established."}
              </p>
            </div>

            <Tabs defaultValue="breakdown" className="space-y-4">
              <TabsList className="flex h-auto flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                {TABS.map(({ value, icon: Icon, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="breakdown" className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-l-4 border-slate-200 border-l-blue-500 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      What It Does
                    </h3>
                    <ul className="space-y-2.5">
                      {analysis.whatItDoes.map((item, i) => (
                        <CitedListItem
                          key={i}
                          claim={item}
                          citations={analysis.citations}
                          marker={<span className="shrink-0 font-black tabular-nums text-blue-400">{i + 1}.</span>}
                        />
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-l-4 border-slate-200 border-l-emerald-500 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Who It Affects
                    </h3>
                    <ul className="space-y-2.5">
                      {analysis.whoItAffects.map((item, i) => (
                        <CitedListItem
                          key={i}
                          claim={item}
                          citations={analysis.citations}
                          marker={<Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                        />
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-l-4 border-slate-200 border-l-orange-500 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-600">
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      What Changes
                    </h3>
                    <ul className="space-y-2.5">
                      {analysis.whatChanges.map((item, i) => (
                        <CitedListItem
                          key={i}
                          claim={item}
                          citations={analysis.citations}
                          marker={<span className="shrink-0 font-bold text-orange-400">-&gt;</span>}
                        />
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    Key Provisions
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {analysis.keyProvisions.map((provision, i) => (
                      <ImpactBadge key={i} provision={provision} citations={analysis.citations} />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="perspectives" className="space-y-4">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <p className="flex items-start gap-2 text-sm text-indigo-800">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                    <span>
                      <strong>Not telling you what to think</strong> - showing only perspectives supported by supplied credible snippets or marking them as not established.
                    </span>
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <PerspectiveCard lean="left" perspective={analysis.perspectives.left} citations={analysis.citations} />
                  <PerspectiveCard lean="center" perspective={analysis.perspectives.center} citations={analysis.citations} />
                  <PerspectiveCard lean="right" perspective={analysis.perspectives.right} citations={analysis.citations} />
                </div>
              </TabsContent>

              <TabsContent value="controversy" className="space-y-4">
                <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                  <p className="text-sm text-orange-800">
                    These are specific bill sections where disagreement is sharpest, with the bill language and supplied source snippets attached.
                  </p>
                </div>
                <ControversySection sections={analysis.controversialSections} citations={analysis.citations} />
              </TabsContent>

              <TabsContent value="politicians">
                <PoliticiansTab billId={bill.id} />
              </TabsContent>

              <TabsContent value="vote" className="space-y-4">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-800">
                    Five questions you should be able to answer before forming an opinion on this bill.
                  </p>
                </div>
                <BeforeYouVote items={analysis.beforeYouVote} citations={analysis.citations} />
              </TabsContent>

              <TabsContent value="sources" className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-600">
                    Every visible claim links back to one of these supplied source snippets. Hover a citation chip anywhere in the analysis to preview the supporting text.
                  </p>
                </div>
                <SourceSnippetList citations={analysis.citations} />
              </TabsContent>

              <TabsContent value="impact">
                <ImpactCalculator billId={bill.id} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-400">
          PolicyLens - Built for clarity, not consensus.
        </div>
      </footer>
    </div>
  );
}
