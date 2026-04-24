"use client";

import { useEffect, useState } from "react";
import { Bill, BillAnalysis } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PerspectiveCard } from "@/components/PerspectiveCard";
import { ControversySection } from "@/components/ControversySection";
import { BeforeYouVote } from "@/components/BeforeYouVote";
import { ImpactBadge } from "@/components/ImpactBadge";
import { ImpactCalculator } from "@/components/ImpactCalculator";
import {
  BookOpen,
  Users,
  GitCompare,
  Flame,
  CheckSquare,
  Zap,
  ArrowLeft,
  Calendar,
  UserCircle,
  User,
} from "lucide-react";
import Link from "next/link";

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
        const data = await res.json();
        setAnalysis(data);
      } catch (e) {
        setError("Failed to load analysis. Please check your API key.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bill.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">PolicyLens</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-600 truncate max-w-xs">{bill.shortTitle}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Bill Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-3">
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

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{bill.title}</h1>
          <p className="text-gray-600 mb-4">{bill.summary}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>
                Sponsored by{" "}
                <span className="font-medium text-gray-700">{bill.sponsor}</span>
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-bold ${partyColors[bill.sponsorParty]}`}
              >
                {bill.sponsorParty}-{bill.sponsorState}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Introduced {new Date(bill.introducedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </div>
        </div>

        {/* Analysis Content */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-gray-600 font-medium">Analyzing bill with Claude AI...</p>
            </div>
            <AnalysisSkeleton />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <p className="text-red-500 text-sm mt-1">
              Make sure ANTHROPIC_API_KEY is set in your .env.local file.
            </p>
          </div>
        )}

        {analysis && (
          <>
            {/* TL;DR */}
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
                  <BookOpen className="h-3.5 w-3.5" />
                  Breakdown
                </TabsTrigger>
                <TabsTrigger value="perspectives" className="flex items-center gap-1.5 text-sm rounded-lg">
                  <GitCompare className="h-3.5 w-3.5" />
                  Perspectives
                </TabsTrigger>
                <TabsTrigger value="controversy" className="flex items-center gap-1.5 text-sm rounded-lg">
                  <Flame className="h-3.5 w-3.5" />
                  Where Disagreement Is
                </TabsTrigger>
                <TabsTrigger value="vote" className="flex items-center gap-1.5 text-sm rounded-lg">
                  <CheckSquare className="h-3.5 w-3.5" />
                  Before You Vote
                </TabsTrigger>
                <TabsTrigger value="impact" className="flex items-center gap-1.5 text-sm rounded-lg">
                  <UserCircle className="h-3.5 w-3.5" />
                  My Impact
                </TabsTrigger>
              </TabsList>

              {/* Breakdown Tab */}
              <TabsContent value="breakdown" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      What It Does
                    </h3>
                    <ul className="space-y-2">
                      {analysis.whatItDoes.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Who It Affects
                    </h3>
                    <ul className="space-y-2">
                      {analysis.whoItAffects.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <Users className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      What Changes
                    </h3>
                    <ul className="space-y-2">
                      {analysis.whatChanges.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-orange-400 shrink-0">→</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">
                    Key Provisions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.keyProvisions.map((p, i) => (
                      <ImpactBadge key={i} provision={p} />
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Perspectives Tab */}
              <TabsContent value="perspectives" className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    <strong>Not telling you what to think</strong> — showing you how different sides interpret the same bill based on published positions from think tanks, advocacy groups, and official statements.
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <PerspectiveCard lean="left" perspective={analysis.perspectives.left} />
                  <PerspectiveCard lean="center" perspective={analysis.perspectives.center} />
                  <PerspectiveCard lean="right" perspective={analysis.perspectives.right} />
                </div>
              </TabsContent>

              {/* Controversy Tab */}
              <TabsContent value="controversy" className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <p className="text-sm text-gray-600">
                    These are the specific provisions where disagreement is sharpest — where the left and right are talking past each other most.
                  </p>
                </div>
                <ControversySection sections={analysis.controversialSections} />
              </TabsContent>

              {/* Before You Vote Tab */}
              <TabsContent value="vote" className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <p className="text-sm text-gray-600">
                    Five questions you should be able to answer before forming an opinion on this bill.
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <BeforeYouVote items={analysis.beforeYouVote} />
                </div>
              </TabsContent>

              {/* My Impact Tab */}
              <TabsContent value="impact">
                <ImpactCalculator billId={bill.id} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
