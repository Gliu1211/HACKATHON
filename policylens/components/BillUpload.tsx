"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { BillAnalysis, CitedClaim } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BeforeYouVote } from "@/components/BeforeYouVote";
import { ControversySection } from "@/components/ControversySection";
import { ImpactBadge } from "@/components/ImpactBadge";
import { PerspectiveCard } from "@/components/PerspectiveCard";
import { claimCitationIds, claimText, SourceSnippetList, SourceTrace } from "@/components/SourceTrace";
import { AlertCircle, BookOpen, CheckCircle2, CheckSquare, FileText, Flame, GitCompare, Loader2, ShieldCheck, Upload, Users, X, Zap } from "lucide-react";

const ACCEPTED = ".pdf,.txt,.md,text/plain,application/pdf";
const MAX_MB = 10;

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
    <li className="text-sm text-slate-700">
      <div className="flex gap-2.5">
        {marker}
        <span>{claimText(claim)}</span>
      </div>
      <SourceTrace citations={analysis.citations} ids={claimCitationIds(claim)} />
    </li>
  );
}

function TldrCard({ analysis }: { analysis: BillAnalysis }) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-5 w-5" />
        <span className="text-lg font-bold">TL;DR - Plain English Summary</span>
      </div>
      <div className="space-y-3">
        {analysis.tldr.map((claim, i) => (
          <div key={i}>
            <p className="text-base leading-relaxed text-white/90">{claimText(claim)}</p>
            <SourceTrace citations={analysis.citations} ids={claimCitationIds(claim)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BreakdownTab({ analysis }: { analysis: BillAnalysis }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-l-4 border-blue-100 border-l-blue-500 bg-white p-5">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            What It Does
          </h3>
          <ul className="space-y-3">
            {analysis.whatItDoes.map((item, i) => (
              <CitedListItem key={i} claim={item} analysis={analysis} marker={<span className="shrink-0 font-black text-blue-400">{i + 1}.</span>} />
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-l-4 border-emerald-100 border-l-emerald-500 bg-white p-5">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Who It Affects
          </h3>
          <ul className="space-y-3">
            {analysis.whoItAffects.map((item, i) => (
              <CitedListItem key={i} claim={item} analysis={analysis} marker={<Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />} />
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-l-4 border-orange-100 border-l-orange-500 bg-white p-5">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-600">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            What Changes
          </h3>
          <ul className="space-y-3">
            {analysis.whatChanges.map((item, i) => (
              <CitedListItem key={i} claim={item} analysis={analysis} marker={<span className="shrink-0 font-bold text-orange-400">-&gt;</span>} />
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Key Provisions</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {analysis.keyProvisions.map((provision, i) => (
            <ImpactBadge key={i} provision={provision} citations={analysis.citations} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BillUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(null);

  function pickFile(nextFile: File) {
    if (nextFile.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large (max ${MAX_MB} MB).`);
      return;
    }
    setFile(nextFile);
    setError(null);
    setAnalysis(null);
    if (!title) setTitle(nextFile.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const nextFile = e.dataTransfer.files[0];
    if (nextFile) pickFile(nextFile);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const nextFile = e.target.files?.[0];
    if (nextFile) pickFile(nextFile);
  }

  function reset() {
    setFile(null);
    setTitle("");
    setAnalysis(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title || file.name);
      const res = await fetch("/api/analyze/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const isPdf = file?.name.toLowerCase().endsWith(".pdf");

  return (
    <div className="w-full space-y-6">
      {!analysis && (
        <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !file && inputRef.current?.click()}
            className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-all ${
              dragging
                ? "border-indigo-400 bg-indigo-50"
                : file
                  ? "cursor-default border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/40"
            }`}
          >
            <input ref={inputRef} type="file" accept={ACCEPTED} onChange={onFileChange} className="hidden" />

            {file ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
                  <FileText className="h-7 w-7 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(0)} KB - {isPdf ? "PDF" : "Text"}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                  className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:border-red-200 hover:bg-red-50"
                >
                  <X className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </>
            ) : (
              <>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${dragging ? "bg-indigo-100" : "bg-gray-100"}`}>
                  <Upload className={`h-7 w-7 transition-colors ${dragging ? "text-indigo-600" : "text-gray-400"}`} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-700">Drop a bill here or <span className="text-indigo-600">browse</span></p>
                  <p className="mt-1 text-sm text-slate-400">PDF or plain text - max {MAX_MB} MB</p>
                </div>
              </>
            )}
          </div>

          {file && (
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
                Bill Title <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Infrastructure Investment and Jobs Act"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {file && (
            <button
              onClick={analyze}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Analyze This Bill
                </>
              )}
            </button>
          )}
        </div>
      )}

      {analysis && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="text-sm font-bold text-green-800">{title || file?.name}</p>
                <p className="text-xs text-green-600">Analysis complete</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="rounded-lg border border-green-300 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:border-green-500 hover:text-green-900"
            >
              Analyze another
            </button>
          </div>

          <TldrCard analysis={analysis} />

          <Tabs defaultValue="breakdown" className="space-y-4">
            <TabsList className="h-auto flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1">
              {[
                { value: "breakdown", icon: BookOpen, label: "Breakdown" },
                { value: "perspectives", icon: GitCompare, label: "Perspectives" },
                { value: "controversy", icon: Flame, label: "Disagreements" },
                { value: "vote", icon: CheckSquare, label: "Before You Vote" },
                { value: "sources", icon: ShieldCheck, label: "Sources" },
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger key={value} value={value} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="breakdown"><BreakdownTab analysis={analysis} /></TabsContent>
            <TabsContent value="perspectives">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <PerspectiveCard lean="left" perspective={analysis.perspectives.left} citations={analysis.citations} />
                <PerspectiveCard lean="center" perspective={analysis.perspectives.center} citations={analysis.citations} />
                <PerspectiveCard lean="right" perspective={analysis.perspectives.right} citations={analysis.citations} />
              </div>
            </TabsContent>
            <TabsContent value="controversy"><ControversySection sections={analysis.controversialSections} citations={analysis.citations} /></TabsContent>
            <TabsContent value="vote"><BeforeYouVote items={analysis.beforeYouVote} citations={analysis.citations} /></TabsContent>
            <TabsContent value="sources"><SourceSnippetList citations={analysis.citations} /></TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
