"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bill, BillAnalysis, CitedClaim } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PerspectiveCard } from "@/components/PerspectiveCard";
import { ControversySection } from "@/components/ControversySection";
import { BeforeYouVote } from "@/components/BeforeYouVote";
import { ImpactBadge } from "@/components/ImpactBadge";
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
  ShieldCheck,
  User,
  Users,
  Zap,
} from "lucide-react";

interface Props {
  bill: Bill;
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
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
    <li className="text-sm text-gray-700">
      <div className="flex gap-2">
        {marker}
        <span>{claimText(claim)}</span>
      </div>
      <SourceTrace citations={citations} ids={claimCitationIds(claim)} />
    </li>
  );
}

const partyColors: Record<string, string> = {
  D: "bg-blue-100 text-blue-800",
  R: "bg-red-100 text-red-800",
  I: "bg-gray-100 text-gray-800",
};

const statusColors: Record<string, string> = {
  "Signed into Law": "bg-green-100 text-green-800",
  "Passed House": "bg-yellow-100 text-yellow-800",
  "Passed Senate": "bg-yellow-100 text-yellow-800",
  "In Committee": "bg-gray-100 text-gray-800",
};

export function BillAnalysisClient({ bill }: Props) {
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/analyze/${bill.id}`);
        if (!res.ok) throw new Error("Analysis failed");
        const data = (await res.json()) as BillAnalysis;
        setAnalysis(data);
      } catch {
        setError("Failed to load analysis. Please check your API keys.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bill.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">PolicyLens</span>
            <span className="text-gray-300">|</span>
            <span className="max-w-xs truncate text-sm text-gray-600">{bill.shortTitle}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {bill.billNumber}
            </Badge>
            <Badge
              className={statusColors[bill.status] || "bg-gray-100 text-gray-800"}
              variant="secondary"
            >
              {bill.status}
            </Badge>
            {bill.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs text-gray-600">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900">{bill.title}</h1>
          <p className="mb-4 text-gray-600">{bill.summary}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>
                Sponsored by <span className="font-medium text-gray-700">{bill.sponsor}</span>
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-xs font-bold ${partyColors[bill.sponsorParty]}`}
              >
                {bill.sponsorParty}-{bill.sponsorState}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
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

        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              <p className="font-medium text-gray-600">Analyzing bill with source traceability...</p>
            </div>
            <AnalysisSkeleton />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-700">{error}</p>
            <p className="mt-1 text-sm text-red-500">
              Set MISTRAL_API_KEY or ANTHROPIC_API_KEY for analysis. Set CONGRESS_API_KEY to fetch official Congress.gov text.
            </p>
          </div>
        )}

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

            <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                Source traceability is on
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Analysis is grounded in {analysis.sourceAudit.billTextSource.replaceAll("_", " ")}
                {analysis.sourceAudit.credibleSourcesProvided > 0
                  ? ` plus ${analysis.sourceAudit.credibleSourcesProvided} supplied credible source snippet(s).`
                  : ". No outside opinion sources were supplied, so unsupported perspectives are labeled as not established."}
              </p>
            </div>

            <Tabs defaultValue="breakdown" className="space-y-4">
              <TabsList className="h-auto flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1">
                <TabsTrigger value="breakdown" className="flex items-center gap-1.5 rounded-lg text-sm">
                  <BookOpen className="h-3.5 w-3.5" />
                  Breakdown
                </TabsTrigger>
                <TabsTrigger value="perspectives" className="flex items-center gap-1.5 rounded-lg text-sm">
                  <GitCompare className="h-3.5 w-3.5" />
                  Perspectives
                </TabsTrigger>
                <TabsTrigger value="controversy" className="flex items-center gap-1.5 rounded-lg text-sm">
                  <Flame className="h-3.5 w-3.5" />
                  Controversial Sections
                </TabsTrigger>
                <TabsTrigger value="vote" className="flex items-center gap-1.5 rounded-lg text-sm">
                  <CheckSquare className="h-3.5 w-3.5" />
                  Before You Vote
                </TabsTrigger>
                <TabsTrigger value="sources" className="flex items-center gap-1.5 rounded-lg text-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Sources
                </TabsTrigger>
              </TabsList>

              <TabsContent value="breakdown" className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      What It Does
                    </h3>
                    <ul className="space-y-3">
                      {analysis.whatItDoes.map((item, i) => (
                        <CitedListItem
                          key={i}
                          claim={item}
                          citations={analysis.citations}
                          marker={<span className="shrink-0 font-bold text-blue-400">{i + 1}.</span>}
                        />
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Who It Affects
                    </h3>
                    <ul className="space-y-3">
                      {analysis.whoItAffects.map((item, i) => (
                        <CitedListItem
                          key={i}
                          claim={item}
                          citations={analysis.citations}
                          marker={<Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />}
                        />
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      What Changes
                    </h3>
                    <ul className="space-y-3">
                      {analysis.whatChanges.map((item, i) => (
                        <CitedListItem
                          key={i}
                          claim={item}
                          citations={analysis.citations}
                          marker={<span className="shrink-0 text-orange-400">-&gt;</span>}
                        />
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                    Key Provisions
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {analysis.keyProvisions.map((p, i) => (
                      <ImpactBadge key={i} provision={p} citations={analysis.citations} />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="perspectives" className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    <strong>Not telling you what to think</strong> - showing only perspectives supported by supplied credible snippets or marking them as not established.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <PerspectiveCard lean="left" perspective={analysis.perspectives.left} citations={analysis.citations} />
                  <PerspectiveCard lean="center" perspective={analysis.perspectives.center} citations={analysis.citations} />
                  <PerspectiveCard lean="right" perspective={analysis.perspectives.right} citations={analysis.citations} />
                </div>
              </TabsContent>

              <TabsContent value="controversy" className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-600">
                    These are specific bill sections where disagreement is sharpest, with the bill language and supplied source snippets attached.
                  </p>
                </div>
                <ControversySection sections={analysis.controversialSections} citations={analysis.citations} />
              </TabsContent>

              <TabsContent value="vote" className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-600">
                    Five questions you should be able to answer before forming an opinion on this bill.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <BeforeYouVote items={analysis.beforeYouVote} citations={analysis.citations} />
                </div>
              </TabsContent>

              <TabsContent value="sources" className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-600">
                    Every visible claim links back to one of these supplied source snippets. Hover a citation chip anywhere in the analysis to preview the supporting text.
                  </p>
                </div>
                <SourceSnippetList citations={analysis.citations} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
