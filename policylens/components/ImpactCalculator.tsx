"use client";

import { useState } from "react";
import { Loader2, TrendingUp, TrendingDown, Minus, AlertTriangle, Star, ChevronRight } from "lucide-react";
import { PersonalImpactResult } from "@/app/api/impact/[id]/route";

const INCOME_OPTIONS = [
  "Under $30,000",
  "$30,000 – $60,000",
  "$60,000 – $100,000",
  "$100,000 – $200,000",
  "Over $200,000",
];

const OCCUPATION_OPTIONS = [
  "Healthcare / Medical",
  "Education / Academia",
  "Technology / Software",
  "Finance / Banking",
  "Manufacturing / Industrial",
  "Retail / Food Service",
  "Government / Public Sector",
  "Agriculture / Farming",
  "Construction / Trades",
  "Legal / Law",
  "Media / Entertainment",
  "Non-profit / Social Services",
  "Self-employed / Small Business",
  "Student",
  "Retired",
  "Other",
];

const FAMILY_OPTIONS = [
  "Single, no children",
  "Single parent",
  "Married, no children",
  "Married with children",
  "Caretaker for elderly family member",
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

const EFFECT_CONFIG = {
  positive: {
    icon: TrendingUp,
    bg: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    badge: "bg-green-100 text-green-700",
    label: "Benefit",
  },
  negative: {
    icon: TrendingDown,
    bg: "bg-red-50 border-red-200",
    iconColor: "text-red-600",
    badge: "bg-red-100 text-red-700",
    label: "Risk",
  },
  neutral: {
    icon: Minus,
    bg: "bg-gray-50 border-gray-200",
    iconColor: "text-gray-500",
    badge: "bg-gray-100 text-gray-600",
    label: "Neutral",
  },
  mixed: {
    icon: AlertTriangle,
    bg: "bg-yellow-50 border-yellow-200",
    iconColor: "text-yellow-600",
    badge: "bg-yellow-100 text-yellow-700",
    label: "Mixed",
  },
};

interface Props {
  billId: string;
}

export function ImpactCalculator({ billId }: Props) {
  const [form, setForm] = useState({
    income: "",
    state: "",
    occupation: "",
    familyStatus: "",
    ageGroup: "",
  });
  const [result, setResult] = useState<PersonalImpactResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const ready = form.income && form.state && form.occupation && form.familyStatus && form.ageGroup;

  async function calculate() {
    if (!ready) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/impact/${billId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Failed to calculate impact. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-1">Your Profile</h3>
        <p className="text-sm text-gray-500 mb-5">
          Tell us about yourself and we&apos;ll show exactly how this bill affects you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Annual Income
            </label>
            <select
              value={form.income}
              onChange={(e) => set("income", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select income range…</option>
              {INCOME_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              State
            </label>
            <select
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select state…</option>
              {US_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Occupation / Sector
            </label>
            <select
              value={form.occupation}
              onChange={(e) => set("occupation", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select occupation…</option>
              {OCCUPATION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Family Status
            </label>
            <select
              value={form.familyStatus}
              onChange={(e) => set("familyStatus", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select status…</option>
              {FAMILY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Age Group
            </label>
            <div className="flex flex-wrap gap-2">
              {AGE_OPTIONS.map((age) => (
                <button
                  key={age}
                  onClick={() => set("ageGroup", age)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    form.ageGroup === age
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
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
          className="mt-5 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculating your impact…
            </>
          ) : (
            <>
              Calculate My Impact
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-white/70 mb-1">
              Your Personalized Impact
            </p>
            <p className="text-base leading-relaxed">{result.summary}</p>
          </div>

          {/* Win / Risk callouts */}
          {(result.biggestWin || result.biggestRisk) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.biggestWin && (
                <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <Star className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-1">Biggest Benefit</p>
                    <p className="text-sm text-gray-700">{result.biggestWin}</p>
                  </div>
                </div>
              )}
              {result.biggestRisk && (
                <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-red-700 mb-1">Biggest Risk</p>
                    <p className="text-sm text-gray-700">{result.biggestRisk}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Impact cards */}
          <div className="space-y-3">
            {result.impacts.map((impact, i) => {
              const config = EFFECT_CONFIG[impact.effect] ?? EFFECT_CONFIG.neutral;
              const Icon = config.icon;
              return (
                <div key={i} className={`rounded-xl border p-4 ${config.bg}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${config.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-gray-900">{impact.headline}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
                          {impact.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{impact.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-400 text-center px-4">
            Impact estimates are AI-generated based on the bill text and your profile. Actual effects depend on implementation and individual circumstances.
          </p>
        </div>
      )}
    </div>
  );
}
