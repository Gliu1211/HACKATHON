"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { BillAnalysis } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  X,
  Loader2,
  Zap,
  BookOpen,
  Users,
  GitCompare,
  Flame,
  CheckSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  AlertTriangle,
} from "lucide-react";

// ── inline mini-renderers so this component is self-contained ──────────────

function TldrCard({ tldr }: { tldr: string }) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-5 w-5" />
        <span className="font-bold text-lg">TL;DR — Plain English Summary</span>
      </div>
      <p className="text-white/90 text-base leading-relaxed">{tldr}</p>
    </div>
  );
}

function BreakdownTab({ analysis }: { analysis: BillAnalysis }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-blue-100 border-l-4 border-l-blue-500 p-5">
          <h3 className="font-bold text-xs uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            What It Does
          </h3>
          <ul className="space-y-2">
            {analysis.whatItDoes.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                <span className="font-black text-blue-400 shrink-0">{i + 1}.</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 border-l-4 border-l-emerald-500 p-5">
          <h3 className="font-bold text-xs uppercase tracking-widest text-emerald-600 mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Who It Affects
          </h3>
          <ul className="space-y-2">
            {analysis.whoItAffects.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                <Users className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 border-l-4 border-l-orange-500 p-5">
          <h3 className="font-bold text-xs uppercase tracking-widest text-orange-600 mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            What Changes
          </h3>
          <ul className="space-y-2">
            {analysis.whatChanges.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                <span className="font-bold text-orange-400 shrink-0">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-4">Key Provisions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.keyProvisions.map((p, i) => {
            const cfg = {
              high: { border: "border-l-red-500", badge: "bg-red-50 text-red-700 border-red-200", label: "High Impact" },
              medium: { border: "border-l-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Medium Impact" },
              low: { border: "border-l-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Low Impact" },
            }[p.impact];
            return (
              <div key={i} className={`flex gap-3 p-4 rounded-xl border border-slate-200 border-l-4 ${cfg.border} bg-white`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm text-slate-900">{p.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                  <p className="text-sm text-slate-500">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PerspectivesTab({ analysis }: { analysis: BillAnalysis }) {
  const leansConfig = {
    left: { label: "Progressive", sublabel: "Left-leaning", gradient: "from-blue-600 to-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
    center: { label: "Centrist", sublabel: "Nonpartisan", gradient: "from-violet-600 to-purple-700", border: "border-violet-200", dot: "bg-violet-500" },
    right: { label: "Conservative", sublabel: "Right-leaning", gradient: "from-red-600 to-red-700", border: "border-red-200", dot: "bg-red-500" },
  } as const;
  const supportIcons = {
    "strong support": { Icon: CheckCircle2, label: "Strong Support" },
    "lean support": { Icon: CheckCircle2, label: "Lean Support" },
    mixed: { Icon: MinusCircle, label: "Mixed" },
    "lean oppose": { Icon: XCircle, label: "Lean Oppose" },
    "strong oppose": { Icon: XCircle, label: "Strong Oppose" },
  } as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {(["left", "center", "right"] as const).map((lean) => {
        const p = analysis.perspectives[lean];
        const cfg = leansConfig[lean];
        const sup = supportIcons[p.supportLevel] ?? supportIcons["mixed"];
        const { Icon } = sup;
        return (
          <div key={lean} className={`rounded-2xl border-2 ${cfg.border} overflow-hidden flex flex-col bg-white shadow-sm`}>
            <div className={`bg-gradient-to-br ${cfg.gradient} px-5 py-4 text-white`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">{cfg.sublabel}</p>
                  <h3 className="font-black text-lg">{cfg.label}</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/15">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold">{sup.label}</span>
                </div>
              </div>
              <blockquote className="text-white/80 text-sm italic border-l-2 border-white/30 pl-3 mt-3">
                &ldquo;{p.framing}&rdquo;
              </blockquote>
            </div>
            <div className="p-5 flex flex-col gap-4 flex-1">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest mb-2 text-slate-500">Key Arguments</h4>
                <ul className="space-y-2">
                  {p.keyArguments.map((a, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${cfg.dot} shrink-0`} />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest mb-2 text-slate-400">Concerns</h4>
                <ul className="space-y-2">
                  {p.concerns.map((c, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-slate-500">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ControversyTab({ analysis }: { analysis: BillAnalysis }) {
  return (
    <div className="space-y-4">
      {analysis.controversialSections.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <Flame className="h-4 w-4" />
            <span className="font-bold text-sm">{s.provision}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-5 border-b md:border-b-0 md:border-r border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-black text-blue-700">L</span>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-700">Left View</span>
              </div>
              <p className="text-sm text-slate-700">{s.leftView}</p>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-xs font-black text-red-700">R</span>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-red-700">Right View</span>
              </div>
              <p className="text-sm text-slate-700">{s.rightView}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 border-t border-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <span className="font-bold">Core disagreement: </span>
              {s.coreDisagreement}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function VoteTab({ analysis }: { analysis: BillAnalysis }) {
  const colors = [
    "border-l-indigo-500",
    "border-l-blue-500",
    "border-l-violet-500",
    "border-l-purple-500",
    "border-l-pink-500",
  ];
  const nums = ["bg-indigo-600", "bg-blue-600", "bg-violet-600", "bg-purple-600", "bg-pink-600"];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
      {analysis.beforeYouVote.map((item, i) => (
        <div key={i} className={`flex gap-4 p-5 border-l-4 ${colors[i % colors.length]}`}>
          <div className={`h-7 w-7 rounded-full ${nums[i % nums.length]} text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5`}>
            {i + 1}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm mb-1">{item.question}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────

const ACCEPTED = ".pdf,.txt,.md,text/plain,application/pdf";
const MAX_MB = 10;

export function BillUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(null);

  function pickFile(f: File) {
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large (max ${MAX_MB} MB).`);
      return;
    }
    setFile(f);
    setError(null);
    setAnalysis(null);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) pickFile(f);
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
      {/* Upload zone */}
      {!analysis && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !file && inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-all cursor-pointer
              ${dragging ? "border-indigo-400 bg-indigo-50" : file ? "border-green-400 bg-green-50 cursor-default" : "border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/40"}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              onChange={onFileChange}
              className="hidden"
            />

            {file ? (
              <>
                <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(0)} KB · {isPdf ? "PDF" : "Text"}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </>
            ) : (
              <>
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-indigo-100" : "bg-gray-100"}`}>
                  <Upload className={`h-7 w-7 transition-colors ${dragging ? "text-indigo-600" : "text-gray-400"}`} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-700">Drop a bill here or <span className="text-indigo-600">browse</span></p>
                  <p className="text-sm text-slate-400 mt-1">PDF or plain text · max {MAX_MB} MB</p>
                </div>
              </>
            )}
          </div>

          {/* Title input */}
          {file && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Bill Title <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Infrastructure Investment and Jobs Act"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Analyze button */}
          {file && (
            <button
              onClick={analyze}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing with AI…
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Analyze This Bill
                </>
              )}
            </button>
          )}

          {loading && (
            <p className="text-center text-xs text-slate-400 animate-pulse">
              Reading bill text and generating nonpartisan analysis… this takes ~30 seconds
            </p>
          )}
        </div>
      )}

      {/* Analysis result */}
      {analysis && (
        <div className="space-y-5">
          {/* Success banner */}
          <div className="flex items-center justify-between gap-4 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="font-bold text-green-800 text-sm">{title || file?.name}</p>
                <p className="text-xs text-green-600">Analysis complete</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="text-xs font-semibold text-green-700 hover:text-green-900 border border-green-300 hover:border-green-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              Analyze another
            </button>
          </div>

          <TldrCard tldr={analysis.tldr} />

          <Tabs defaultValue="breakdown" className="space-y-4">
            <TabsList className="bg-white border border-gray-200 p-1 rounded-xl h-auto flex flex-wrap gap-1">
              {[
                { value: "breakdown", icon: BookOpen, label: "Breakdown" },
                { value: "perspectives", icon: GitCompare, label: "Perspectives" },
                { value: "controversy", icon: Flame, label: "Disagreements" },
                { value: "vote", icon: CheckSquare, label: "Before You Vote" },
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger key={value} value={value} className="flex items-center gap-1.5 text-sm rounded-lg px-3 py-2">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="breakdown"><BreakdownTab analysis={analysis} /></TabsContent>
            <TabsContent value="perspectives"><PerspectivesTab analysis={analysis} /></TabsContent>
            <TabsContent value="controversy"><ControversyTab analysis={analysis} /></TabsContent>
            <TabsContent value="vote"><VoteTab analysis={analysis} /></TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
