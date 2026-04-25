"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Scale, Loader2, FileText, Zap, GitCompare, Flame, CheckSquare, BookOpen, UserCircle, Users } from "lucide-react";
import { BillAnalysis } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerspectiveCard } from "@/components/PerspectiveCard";
import { ControversySection } from "@/components/ControversySection";
import { BeforeYouVote } from "@/components/BeforeYouVote";
import { ImpactBadge } from "@/components/ImpactBadge";

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
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1 rounded-md">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">PolicyLens</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-600">Analyze Any Bill</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Input card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">Analyze Any Bill</h1>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Paste any bill text, policy summary, or legislative proposal and get a full nonpartisan analysis.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Bill Text
                </label>
                <div className="flex gap-2">
                  {EXAMPLE_BILLS.map((ex) => (
                    <button
                      key={ex.label}
                      onClick={() => loadExample(ex)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Load example
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the bill text, summary, or key provisions here…"
                rows={10}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">{text.length} characters</p>
            </div>

            <button
              onClick={analyze}
              disabled={text.trim().length < 100 || loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing with Mistral AI…
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
        )}

        {analysis && (
          <>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5" />
                <span className="font-bold text-lg">TL;DR — Plain English Summary</span>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">{analysis.tldr}</p>
            </div>

            <Tabs defaultValue="breakdown" className="space-y-4">
              <TabsList className="bg-white border border-gray-200 p-1 rounded-xl h-auto flex-wrap gap-1">
                <TabsTrigger value="breakdown" className="flex items-center gap-1.5 text-sm rounded-lg">
                  <BookOpen className="h-3.5 w-3.5" />Breakdown
                </TabsTrigger>
                <TabsTrigger value="perspectives" className="flex items-center gap-1.5 text-sm rounded-lg">
                  <GitCompare className="h-3.5 w-3.5" />Perspectives
                </TabsTrigger>
                <TabsTrigger value="controversy" className="flex items-center gap-1.5 text-sm rounded-lg">
                  <Flame className="h-3.5 w-3.5" />Where Disagreement Is
                </TabsTrigger>
                <TabsTrigger value="vote" className="flex items-center gap-1.5 text-sm rounded-lg">
                  <CheckSquare className="h-3.5 w-3.5" />Before You Vote
                </TabsTrigger>
              </TabsList>

              <TabsContent value="breakdown" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "What It Does", items: analysis.whatItDoes, color: "bg-blue-500", textColor: "text-blue-400", marker: (i: number) => `${i + 1}.` },
                    { label: "Who It Affects", items: analysis.whoItAffects, color: "bg-green-500", textColor: "text-green-500", marker: () => "·" },
                    { label: "What Changes", items: analysis.whatChanges, color: "bg-orange-500", textColor: "text-orange-400", marker: () => "→" },
                  ].map(({ label, items, color, textColor, marker }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                      <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${color}`} />{label}
                      </h3>
                      <ul className="space-y-2">
                        {items.map((item, i) => (
                          <li key={i} className="text-sm text-gray-700 flex gap-2">
                            <span className={`font-bold shrink-0 ${textColor}`}>{marker(i)}</span>{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">Key Provisions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.keyProvisions.map((p, i) => <ImpactBadge key={i} provision={p} />)}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="perspectives" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <PerspectiveCard lean="left" perspective={analysis.perspectives.left} />
                  <PerspectiveCard lean="center" perspective={analysis.perspectives.center} />
                  <PerspectiveCard lean="right" perspective={analysis.perspectives.right} />
                </div>
              </TabsContent>

              <TabsContent value="controversy" className="space-y-4">
                <ControversySection sections={analysis.controversialSections} />
              </TabsContent>

              <TabsContent value="vote" className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <BeforeYouVote items={analysis.beforeYouVote} />
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
