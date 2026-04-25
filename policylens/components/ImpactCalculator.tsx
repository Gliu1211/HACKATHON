"use client";

import { useState } from "react";
import { Loader2, TrendingUp, TrendingDown, Minus, AlertTriangle, Star, ChevronRight } from "lucide-react";
import { PersonalImpactResult } from "@/app/api/impact/[id]/route";

const INCOME_OPTIONS = [
  "Under $30,000", "$30,000 – $60,000", "$60,000 – $100,000",
  "$100,000 – $200,000", "Over $200,000",
];
const OCCUPATION_OPTIONS = [
  "Healthcare / Medical", "Education / Academia", "Technology / Software",
  "Finance / Banking", "Manufacturing / Industrial", "Retail / Food Service",
  "Government / Public Sector", "Agriculture / Farming", "Construction / Trades",
  "Legal / Law", "Media / Entertainment", "Non-profit / Social Services",
  "Self-employed / Small Business", "Student", "Retired", "Other",
];
const FAMILY_OPTIONS = [
  "Single, no children", "Single parent", "Married, no children",
  "Married with children", "Caretaker for elderly family member",
];
const AGE_OPTIONS = ["18–25", "26–40", "41–55", "56–65", "65+"];
const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming","Washington D.C.",
];

const EFFECT_CFG = {
  positive: { Icon: TrendingUp,   bg: "bg-emerald-50 border-emerald-200", iconColor: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700", label: "Benefit" },
  negative: { Icon: TrendingDown, bg: "bg-red-50 border-red-200",         iconColor: "text-red-600",     badge: "bg-red-100 text-red-700",         label: "Risk"    },
  neutral:  { Icon: Minus,        bg: "bg-slate-50 border-slate-200",     iconColor: "text-slate-500",   badge: "bg-slate-100 text-slate-600",     label: "Neutral" },
  mixed:    { Icon: AlertTriangle,bg: "bg-amber-50 border-amber-200",     iconColor: "text-amber-600",   badge: "bg-amber-100 text-amber-700",     label: "Mixed"   },
};

function SelectField({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent appearance-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

interface Props { billId: string }

export function ImpactCalculator({ billId }: Props) {
  const [form, setForm] = useState({ income: "", state: "", occupation: "", familyStatus: "", ageGroup: "" });
  const [result, setResult] = useState<PersonalImpactResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  function set(field: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  const ready = Object.values(form).every(Boolean);

  async function calculate() {
    if (!ready) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`/api/impact/${billId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setResult(await res.json());
    } catch {
      setError("Failed to calculate impact. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* form card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-black text-slate-900 text-lg mb-1">Your Profile</h3>
        <p className="text-sm text-slate-500 mb-6">Tell us about yourself and we&apos;ll show exactly how this bill affects you.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Annual Income"     value={form.income}       onChange={v => set("income", v)}       options={INCOME_OPTIONS}     placeholder="Select income range…"  />
          <SelectField label="State"             value={form.state}        onChange={v => set("state", v)}        options={US_STATES}          placeholder="Select state…"         />
          <SelectField label="Occupation"        value={form.occupation}   onChange={v => set("occupation", v)}   options={OCCUPATION_OPTIONS} placeholder="Select occupation…"    />
          <SelectField label="Family Status"     value={form.familyStatus} onChange={v => set("familyStatus", v)} options={FAMILY_OPTIONS}     placeholder="Select status…"        />

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Age Group</label>
            <div className="flex flex-wrap gap-2">
              {AGE_OPTIONS.map(age => (
                <button
                  key={age}
                  onClick={() => set("ageGroup", age)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    form.ageGroup === age
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={calculate}
          disabled={!ready || loading}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Calculating your impact…</>
          ) : (
            <>Calculate My Impact <ChevronRight className="h-4 w-4" /></>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="space-y-4">
          {/* summary */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
            <p className="relative text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Your Personalized Impact</p>
            <p className="relative text-base leading-relaxed">{result.summary}</p>
          </div>

          {/* win / risk */}
          {(result.biggestWin || result.biggestRisk) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.biggestWin && (
                <div className="flex gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <Star className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-1">Biggest Benefit</p>
                    <p className="text-sm text-slate-700">{result.biggestWin}</p>
                  </div>
                </div>
              )}
              {result.biggestRisk && (
                <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-red-700 mb-1">Biggest Risk</p>
                    <p className="text-sm text-slate-700">{result.biggestRisk}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* impact cards */}
          <div className="space-y-3">
            {result.impacts.map((impact, i) => {
              const cfg = EFFECT_CFG[impact.effect] ?? EFFECT_CFG.neutral;
              const { Icon } = cfg;
              return (
                <div key={i} className={`rounded-xl border p-4 ${cfg.bg}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${cfg.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-slate-900">{impact.headline}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>{impact.category}</span>
                      </div>
                      <p className="text-sm text-slate-600">{impact.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 text-center px-4">
            Impact estimates are AI-generated based on the bill text and your profile. Actual effects depend on implementation and individual circumstances.
          </p>
        </div>
      )}
    </div>
  );
}
