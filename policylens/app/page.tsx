import Link from "next/link";
import { FEATURED_BILLS } from "@/data/bills";
import { ArrowRight, Scale, Eye, BookOpen, Zap, GitCompare, Flame, Shield } from "lucide-react";
import { BillSearch } from "@/components/BillSearch";

function BillCard({ bill }: { bill: (typeof FEATURED_BILLS)[0] }) {
  const partyConfig: Record<string, { bg: string; text: string }> = {
    D: { bg: "bg-blue-500", text: "text-white" },
    R: { bg: "bg-red-500", text: "text-white" },
    I: { bg: "bg-slate-500", text: "text-white" },
  };
  const statusConfig: Record<string, { dot: string; color: string }> = {
    "Signed into Law": { dot: "bg-emerald-400", color: "text-emerald-700" },
    "Passed House":    { dot: "bg-amber-400",   color: "text-amber-700"   },
    "In Committee":   { dot: "bg-slate-400",   color: "text-slate-500"   },
  };

  const party  = partyConfig[bill.sponsorParty]  ?? partyConfig["I"];
  const status = statusConfig[bill.status] ?? { dot: "bg-slate-400", color: "text-slate-500" };

  return (
    <Link href={`/bill/${bill.id}`} className="group block h-full">
      <div className="h-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 flex flex-col">
        {/* top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="space-y-1.5">
            <span className="font-mono text-xs font-bold text-slate-400 tracking-widest uppercase">
              {bill.billNumber}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${status.dot}`} />
              <span className={`text-xs font-semibold ${status.color}`}>{bill.status}</span>
            </div>
          </div>
          <div className="bg-slate-100 rounded-full p-2 group-hover:bg-indigo-100 transition-colors shrink-0">
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors leading-snug">
          {bill.shortTitle}
        </h3>
        <p className="text-sm text-slate-500 mb-5 line-clamp-3 leading-relaxed flex-1">{bill.summary}</p>

        {/* bottom row */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {bill.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
                {tag}
              </span>
            ))}
            {bill.tags.length > 3 && (
              <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-400 rounded-full">
                +{bill.tags.length - 3}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`h-6 w-6 rounded-full ${party.bg} ${party.text} text-xs font-black flex items-center justify-center`}>
              {bill.sponsorParty}
            </span>
            <span className="text-xs text-slate-400 truncate max-w-[80px]">
              {bill.sponsor.split(" ").slice(-1)[0]}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/30">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-lg text-white tracking-tight">PolicyLens</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Powered by AI
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="relative bg-slate-900 pt-16 overflow-hidden">
        {/* dot grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgb(148 163 184) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          {/* badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 tracking-widest uppercase">
            <Eye className="h-3.5 w-3.5" />
            Nonpartisan Bill Analysis
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-5 tracking-tight leading-[1.04]">
            Democracy works when{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
              people understand
            </span>{" "}
            what they&apos;re deciding.
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Not telling you what to think — showing you what you&apos;re missing. Plain English breakdowns,
            every perspective, and where the real disagreements are.
          </p>

          {/* feature chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { icon: BookOpen,    label: "Plain English",        color: "text-blue-400   bg-blue-500/10   border-blue-500/20"   },
              { icon: GitCompare,  label: "Left · Center · Right", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
              { icon: Flame,       label: "Core Disagreements",    color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
              { icon: Zap,         label: "AI-Powered",            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"},
            ].map(({ icon: Icon, label, color }) => (
              <span key={label} className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${color}`}>
                <Icon className="h-3.5 w-3.5" />
                {label}
              </span>
            ))}
          </div>

          {/* search */}
          <div className="max-w-2xl mx-auto">
            <BillSearch />
          </div>
        </div>
      </div>

      {/* ── Featured Bills ── */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-slate-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Featured Bills</span>
            <div className="h-px w-12 bg-slate-300" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Select a bill to see the full analysis</h2>
          <p className="text-slate-500 mt-2 text-sm">
            AI-generated nonpartisan breakdowns with real perspectives from across the political spectrum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_BILLS.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-slate-900 mb-12 text-center">How PolicyLens Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: "01", icon: BookOpen,   gradient: "from-blue-500 to-indigo-500",    title: "Reads the actual bill",       desc: "Starts with the real legislative text — not media summaries. AI reads the full bill." },
              { step: "02", icon: Shield,      gradient: "from-violet-500 to-purple-500",  title: "Breaks it down neutrally",    desc: "Plain English summary of what changes, who it affects, and what key provisions mean." },
              { step: "03", icon: GitCompare,  gradient: "from-orange-500 to-red-500",     title: "Shows every perspective",     desc: "Left, center, and right views — based on real published positions from think tanks." },
            ].map((item) => (
              <div key={item.step} className="relative">
                <span className="absolute top-0 right-0 text-6xl font-black text-slate-100 leading-none select-none">
                  {item.step}
                </span>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-white">PolicyLens</span>
          </div>
          <p className="text-sm text-slate-500 italic max-w-xl mx-auto">
            &ldquo;Democracy isn&apos;t failing because people disagree. It&apos;s failing because people don&apos;t understand what they&apos;re disagreeing about.&rdquo;
          </p>
          <p className="text-xs text-slate-700 mt-4">Built for clarity, not consensus.</p>
        </div>
      </footer>
    </div>
  );
}
