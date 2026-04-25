"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckSquare, FileText, Flame, GitCompare, Loader2, Scale, ShieldCheck, Users, Zap } from "lucide-react";
import { BillAnalysis, CitedClaim } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerspectiveCard } from "@/components/PerspectiveCard";
import { ControversySection } from "@/components/ControversySection";
import { BeforeYouVote } from "@/components/BeforeYouVote";
import { ImpactBadge } from "@/components/ImpactBadge";
import { claimCitationIds, claimText, SourceSnippetList, SourceTrace } from "@/components/SourceTrace";

const EXAMPLE_BILLS = [
  {
    label: "Sample: Minimum Wage Increase Act",
    title: "Raise the Wage Act",
    text: `The Raise the Wage Act would gradually increase the federal minimum wage from $7.25 per hour to $17 per hour over five years.

Key provisions:
- Increases federal minimum wage to $17/hour by 2029 in annual increments
- Eliminates the tipped minimum wage (currently $2.13/hour) over 7 years
- Eliminates the youth minimum wage (currently $4.25/hour)
- Indexes future minimum wage increases to median wage growth
- Covers all workers including home care workers and farm workers

The federal minimum wage has not been increased since 2009, the longest period without an increase since it was established in 1938. Currently 21 states still use the federal minimum as their state minimum wage.`,
  },
];

function CitedListItem({
  claim,
  analysis,
  marker,
}: {
  claim: CitedClaim;
  analysis: BillAnalysis;
  marker: React.ReactNode;
}) {
  return (
    <li className="text-sm text-gray-700">
      <div className="flex gap-2">
        {marker}
        <span>{claimText(claim)}</span>
      </div>
      <SourceTrace citations={analysis.citations} ids={claimCitationIds(claim)} />
    </li>
  );
}

export default function AnalyzePage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(null);

  async function analyze() {
    if (text.trim().length < 100) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const res = await fetch("/api/analyze/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "Custom Bill", text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to analyze");
    } finally {
      setLoading(false);
    }
  }

  function loadExample(ex: (typeof EXAMPLE_BILLS)[0]) {
    setTitle(ex.title);
    setText(ex.text);
    setAnalysis(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-indigo-600 p-1">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">PolicyLens</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-600">Analyze Any Bill</span>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">Analyze Any Bill</h1>
          </div>
          <p className="mb-5 text-sm text-gray-500">
            Paste any bill text, policy summary, or legislative proposal and get a full nonpartisan analysis.
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Bill Title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Clean Energy Innovation Act"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Bill Text
                </label>
                <div className="flex gap-2">
                  {EXAMPLE_BILLS.map((ex) => (
                    <button
                      key={ex.label}
                      onClick={() => loadExample(ex)}
                      className="text-xs text-indigo-600 underline hover:text-indigo-800"
                    >
                      Load example
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the bill text, summary, or key provisions here..."
                rows={10}
                className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <p className="mt-1 text-xs text-gray-400">{text.length} characters</p>
            </div>

            <button
              onClick={analyze}
              disabled={text.trim().length < 100 || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing with Mistral AI...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Analyze Bill
                </>
              )}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {analysis && (
          <>
            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span className="text-lg font-bold">TL;DR - Plain English Summary</span>
              </div>
              <div className="space-y-3">
                {analysis.tldr.map((claim, i) => (
                  <div key={i}>
                    <p className="text-lg leading-relaxed text-white/90">{claimText(claim)}</p>
                    <SourceTrace citations={analysis.citations} ids={claimCitationIds(claim)} />
                  </div>
                ))}
              </div>
            </div>

            <Tabs defaultValue="breakdown" className="space-y-4">
              <TabsList className="h-auto flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1">
                <TabsTrigger value="breakdown" className="flex items-center gap-1.5 rounded-lg text-sm">
                  <BookOpen className="h-3.5 w-3.5" />Breakdown
                </TabsTrigger>
                <TabsTrigger value="perspectives" className="flex items-center gap-1.5 rounded-lg text-sm">
                  <GitCompare className="h-3.5 w-3.5" />Perspectives
                </TabsTrigger>
                <TabsTrigger value="controversy" className="flex items-center gap-1.5 rounded-lg text-sm">
                  <Flame className="h-3.5 w-3.5" />Disagreements
                </TabsTrigger>
                <TabsTrigger value="vote" className="flex items-center gap-1.5 rounded-lg text-sm">
                  <CheckSquare className="h-3.5 w-3.5" />Before You Vote
                </TabsTrigger>
                <TabsTrigger value="sources" className="flex items-center gap-1.5 rounded-lg text-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />Sources
                </TabsTrigger>
              </TabsList>

              <TabsContent value="breakdown" className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />What It Does
                    </h3>
                    <ul className="space-y-3">
                      {analysis.whatItDoes.map((item, i) => (
                        <CitedListItem key={i} claim={item} analysis={analysis} marker={<span className="shrink-0 font-bold text-blue-400">{i + 1}.</span>} />
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                      <span className="h-2 w-2 rounded-full bg-green-500" />Who It Affects
                    </h3>
                    <ul className="space-y-3">
                      {analysis.whoItAffects.map((item, i) => (
                        <CitedListItem key={i} claim={item} analysis={analysis} marker={<Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />} />
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                      <span className="h-2 w-2 rounded-full bg-orange-500" />What Changes
                    </h3>
                    <ul className="space-y-3">
                      {analysis.whatChanges.map((item, i) => (
                        <CitedListItem key={i} claim={item} analysis={analysis} marker={<span className="shrink-0 text-orange-400">-&gt;</span>} />
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Key Provisions</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {analysis.keyProvisions.map((p, i) => (
                      <ImpactBadge key={i} provision={p} citations={analysis.citations} />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="perspectives" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <PerspectiveCard lean="left" perspective={analysis.perspectives.left} citations={analysis.citations} />
                  <PerspectiveCard lean="center" perspective={analysis.perspectives.center} citations={analysis.citations} />
                  <PerspectiveCard lean="right" perspective={analysis.perspectives.right} citations={analysis.citations} />
                </div>
              </TabsContent>

              <TabsContent value="controversy" className="space-y-4">
                <ControversySection sections={analysis.controversialSections} citations={analysis.citations} />
              </TabsContent>

              <TabsContent value="vote" className="space-y-4">
                <BeforeYouVote items={analysis.beforeYouVote} citations={analysis.citations} />
              </TabsContent>

              <TabsContent value="sources" className="space-y-4">
                <SourceSnippetList citations={analysis.citations} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
