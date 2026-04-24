"use client";

import { ControversialSection } from "@/types";
import { Flame, AlertTriangle } from "lucide-react";

interface Props { sections: ControversialSection[] }

export function ControversySection({ sections }: Props) {
  return (
    <div className="space-y-5">
      {sections.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* title bar */}
          <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <div className="bg-white/20 rounded-lg p-1.5 shrink-0">
              <Flame className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm flex-1">{s.provision}</span>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold shrink-0">
              #{i + 1}
            </span>
          </div>

          {/* left / right split */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-5 border-b md:border-b-0 md:border-r border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-blue-700">L</span>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-700">Left View</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{s.leftView}</p>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-red-700">R</span>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-red-700">Right View</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{s.rightView}</p>
            </div>
          </div>

          {/* core disagreement */}
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
