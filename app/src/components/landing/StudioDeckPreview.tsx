"use client";

import { useState } from "react";

interface DisciplineCase {
  id: string;
  label: string;
  client: string;
  deckTitle: string;
  projects: Array<{ code: string; name: string; scope: string; year: string }>;
}

const DISCIPLINES: DisciplineCase[] = [
  {
    id: "arch",
    label: "Architecture",
    client: "Ayala Alabang Residence",
    deckTitle: "Residential Architecture Credentials",
    projects: [
      { code: "PRJ-014", name: "Courtyard House, Nuvali", scope: "420 sqm · Built", year: "2025" },
      { code: "PRJ-019", name: "Hillside Pavilion, Tagaytay", scope: "580 sqm · Built", year: "2025" },
      { code: "PRJ-023", name: "Timber Loft Renovation, Makati", scope: "210 sqm · Built", year: "2026" },
    ],
  },
  {
    id: "eng",
    label: "Engineering",
    client: "Laguna Logistics Hub Bid",
    deckTitle: "Structural & MEP Capability Deck",
    projects: [
      { code: "ENG-008", name: "Cavite Cold Storage Span", scope: "Steel Truss · 6,400 sqm", year: "2024" },
      { code: "ENG-012", name: "BGC Mid-Rise Seismic Retrofit", scope: "14 Storeys · Completed", year: "2025" },
      { code: "ENG-017", name: "Clark Solar Warehouse MEP", scope: "Full MEPFS · Commissioned", year: "2026" },
    ],
  },
  {
    id: "int",
    label: "Interiors",
    client: "BGC Flagship Clinic Pitch",
    deckTitle: "Commercial Interiors Selection",
    projects: [
      { code: "INT-031", name: "Salcedo Espresso Bar", scope: "Fit-Out · 95 sqm", year: "2025" },
      { code: "INT-036", name: "Ortigas Dental Atelier", scope: "Clinical · 180 sqm", year: "2025" },
      { code: "INT-040", name: "Rockwell Private Lounge", scope: "Hospitality · 240 sqm", year: "2026" },
    ],
  },
];

export function StudioDeckPreview() {
  const [activeId, setActiveId] = useState<string>("arch");
  const [selectedCodes, setSelectedCodes] = useState<Record<string, string[]>>({
    arch: ["PRJ-014", "PRJ-019"],
    eng: ["ENG-008", "ENG-017"],
    int: ["INT-036", "INT-040"],
  });

  const active = DISCIPLINES.find((d) => d.id === activeId) ?? DISCIPLINES[0];
  const chosen = selectedCodes[active.id] ?? [];

  const toggleProject = (code: string) => {
    setSelectedCodes((prev) => {
      const current = prev[active.id] ?? [];
      const exists = current.includes(code);
      if (exists && current.length === 1) return prev;
      return {
        ...prev,
        [active.id]: exists
          ? current.filter((c) => c !== code)
          : [...current, code],
      };
    });
  };

  return (
    <div className="carbon-draft-grid rounded-[6px] border border-[#18191C] text-[#F5F4F0] overflow-hidden shadow-[0_20px_50px_-24px_rgba(24,25,28,0.45)]">
      {/* Top Frame Bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#2D3038] bg-[#141518]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#D94E1F]" />
          <span className="font-mono text-[11px] tracking-wider uppercase text-[#9B9FA8]">
            Concept Specimen · Pitch Assembler
          </span>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-[#F47B4F]">
          {chosen.length * 4 + 2} slides ready
        </span>
      </div>

      {/* Discipline Switcher */}
      <div className="grid grid-cols-3 border-b border-[#2D3038] bg-[#18191C]">
        {DISCIPLINES.map((d) => {
          const isCurrent = d.id === active.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setActiveId(d.id)}
              className={`px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer border-r last:border-r-0 border-[#2D3038] ${
                isCurrent
                  ? "bg-[#23252C] text-[#F5F4F0] shadow-[inset_0_-2px_0_#D94E1F]"
                  : "text-[#9B9FA8] hover:text-[#F5F4F0] hover:bg-[#1E2026]"
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Interactive Library -> Output Assembly */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#9B9FA8]">
              01 · Select reusable projects
            </span>
            <span className="font-mono text-[11px] text-[#9B9FA8]">Click to toggle</span>
          </div>

          <div className="space-y-1.5">
            {active.projects.map((p) => {
              const isSelected = chosen.includes(p.code);
              return (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => toggleProject(p.code)}
                  className={`w-full text-left px-3 py-2.5 rounded-[4px] border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-[#23252C] border-[#D94E1F] shadow-[inset_3px_0_0_#D94E1F]"
                      : "bg-[#18191C]/80 border-[#2D3038] hover:border-[#4B4F5B]"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#F47B4F]">{p.code}</span>
                      <span className="text-xs font-medium text-[#F5F4F0] truncate">
                        {p.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#9B9FA8] mt-0.5">{p.scope}</div>
                  </div>
                  <span
                    className={`shrink-0 w-4 h-4 rounded-[2px] border flex items-center justify-center text-[10px] font-bold ${
                      isSelected
                        ? "bg-[#D94E1F] border-[#D94E1F] text-white"
                        : "border-[#4B4F5B] text-transparent"
                    }`}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Assembled Client Deck Sheet */}
        <div className="rounded-[4px] border border-[#32353D] bg-[#F5F4F0] text-[#18191C] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2 border-b border-[#D9D6CE] pb-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#C44114]">
                Tailored client pitch
              </div>
              <div
                className="text-sm font-semibold leading-tight mt-0.5"
                style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
              >
                {active.client}
              </div>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-[2px] bg-[#18191C] text-[#F5F4F0] tabular-nums">
              {chosen.length} / 3 CASE STUDIES
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {active.projects
              .filter((p) => chosen.includes(p.code))
              .map((p) => (
                <span
                  key={p.code}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[2px] bg-[#FFFFFF] border border-[#D9D6CE] text-[11px] font-medium text-[#18191C]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D94E1F]" />
                  {p.name}
                </span>
              ))}
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-[#555963] font-mono">
            <span>{active.deckTitle}</span>
            <span className="text-[#16654B]">Link + PDF</span>
          </div>
        </div>
      </div>
    </div>
  );
}
