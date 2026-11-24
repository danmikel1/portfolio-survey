"use client";

import type { SurveyOption } from "@/lib/survey-config";

function QuestionHeader({
  questionNumber,
  prompt,
  helper,
  badge,
}: {
  questionNumber: number;
  prompt: string;
  helper?: string;
  badge?: React.ReactNode;
}) {
  const qCode = `Q${String(questionNumber).padStart(2, "0")}`;
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-medium tracking-wider text-[#C44114]">
          {qCode}
        </span>
        {badge}
      </div>
      <legend
        className="text-lg font-semibold leading-snug text-[#18191C]"
        style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
      >
        {prompt}
      </legend>
      {helper ? <p className="text-xs text-[#555963]">{helper}</p> : null}
    </div>
  );
}

interface MultiSelectQuestionProps {
  id: string;
  questionNumber: number;
  prompt: string;
  helper?: string;
  options: SurveyOption[];
  values: string[];
  onChange: (next: string[]) => void;
  otherText?: string;
  onOtherTextChange?: (next: string) => void;
  maxSelections?: number;
  columns?: 1 | 2;
  error?: string;
}

export function MultiSelectQuestion({
  id,
  questionNumber,
  prompt,
  helper,
  options,
  values,
  onChange,
  otherText,
  onOtherTextChange,
  maxSelections,
  columns = 1,
  error,
}: MultiSelectQuestionProps) {
  const atCap = typeof maxSelections === "number" && values.length >= maxSelections;
  const exclusiveSet = new Set(options.filter((o) => o.exclusive).map((o) => o.value));

  const toggle = (optionValue: string) => {
    const isChecked = values.includes(optionValue);
    if (isChecked) {
      onChange(values.filter((v) => v !== optionValue));
      return;
    }

    if (exclusiveSet.has(optionValue)) {
      onChange([optionValue]);
      return;
    }

    const withoutExclusives = values.filter((v) => !exclusiveSet.has(v));
    if (typeof maxSelections === "number" && withoutExclusives.length >= maxSelections) {
      return;
    }
    onChange([...withoutExclusives, optionValue]);
  };

  return (
    <fieldset id={id} className="space-y-3.5">
      <QuestionHeader
        questionNumber={questionNumber}
        prompt={prompt}
        helper={
          atCap
            ? `Maximum of ${maxSelections} selected. Uncheck one to choose another.`
            : helper
        }
        badge={
          typeof maxSelections === "number" ? (
            <span
              aria-live="polite"
              className={`font-mono text-[11px] font-medium tabular-nums px-2.5 py-0.5 rounded-[3px] border ${
                atCap
                  ? "bg-[#18191C] border-[#18191C] text-[#F5F4F0]"
                  : "bg-[#FDEEE8] border-[#D94E1F] text-[#C44114]"
              }`}
            >
              {values.length} / {maxSelections} SELECTED
            </span>
          ) : undefined
        }
      />

      <div
        className={
          columns === 2 ? "grid grid-cols-1 sm:grid-cols-2 gap-2.5" : "space-y-2"
        }
      >
        {options.map((opt) => {
          const checked = values.includes(opt.value);
          const disabled = atCap && !checked && !opt.exclusive;
          return (
            <label
              key={opt.value}
              data-selected={checked}
              data-disabled={disabled}
              className="folio-option-tile flex items-center gap-3 px-4 py-3 min-h-[48px] cursor-pointer"
            >
              <input
                type="checkbox"
                name={id}
                value={opt.value}
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(opt.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`w-4 h-4 shrink-0 rounded-[2px] border flex items-center justify-center text-[10px] font-bold transition-colors ${
                  checked
                    ? "bg-[#D94E1F] border-[#D94E1F] text-white"
                    : "bg-[#FFFFFF] border-[#A8A49B] text-transparent"
                }`}
              >
                ✓
              </span>
              <span className="text-[15px] leading-snug text-[#18191C]">{opt.label}</span>
            </label>
          );
        })}
      </div>

      {values.includes("other") && onOtherTextChange ? (
        <div className="pt-1">
          <input
            type="text"
            value={otherText ?? ""}
            onChange={(e) => onOtherTextChange(e.target.value)}
            maxLength={200}
            placeholder="Specify other..."
            aria-label={`Specify other for question ${questionNumber}`}
            className="w-full rounded-[4px] border border-[#18191C] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#18191C] focus:border-[#D94E1F] focus:outline-none focus:ring-2 focus:ring-[#D94E1F]/20"
          />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-xs font-medium text-[#B91C1C]">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

interface SingleSelectQuestionProps {
  id: string;
  questionNumber: number;
  prompt: string;
  helper?: string;
  options: SurveyOption[];
  value?: string;
  onChange: (next: string) => void;
  layout?: "stack" | "grid-2" | "grid-compact";
  error?: string;
}

export function SingleSelectQuestion({
  id,
  questionNumber,
  prompt,
  helper,
  options,
  value,
  onChange,
  layout = "stack",
  error,
}: SingleSelectQuestionProps) {
  const containerClass =
    layout === "grid-compact"
      ? "flex flex-wrap gap-2.5"
      : layout === "grid-2"
        ? "grid grid-cols-1 sm:grid-cols-2 gap-2.5"
        : "space-y-2";

  return (
    <fieldset id={id} className="space-y-3.5">
      <QuestionHeader questionNumber={questionNumber} prompt={prompt} helper={helper} />

      <div className={containerClass}>
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              data-selected={checked}
              className={`folio-option-tile flex items-center min-h-[48px] cursor-pointer ${
                layout === "grid-compact"
                  ? "flex-1 min-w-fit justify-center gap-2.5 px-4 py-2.5 whitespace-nowrap"
                  : "gap-3 px-4 py-3"
              }`}
            >
              <input
                type="radio"
                name={id}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`w-4 h-4 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                  checked
                    ? "border-[#D94E1F] bg-[#FFFFFF]"
                    : "border-[#A8A49B] bg-[#FFFFFF]"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-transform ${
                    checked ? "bg-[#D94E1F] scale-100" : "scale-0"
                  }`}
                />
              </span>
              <span className="text-[15px] leading-snug tabular-nums text-[#18191C]">
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="text-xs font-medium text-[#B91C1C]">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

interface LikertQuestionProps {
  id: string;
  questionNumber: number;
  prompt: string;
  lowLabel: string;
  highLabel: string;
  value?: number;
  onChange: (next: number) => void;
  error?: string;
}

export function LikertQuestion({
  id,
  questionNumber,
  prompt,
  lowLabel,
  highLabel,
  value,
  onChange,
  error,
}: LikertQuestionProps) {
  return (
    <fieldset id={id} className="space-y-3.5">
      <QuestionHeader questionNumber={questionNumber} prompt={prompt} />

      <div className="grid grid-cols-5 gap-2.5 pt-1">
        {[1, 2, 3, 4, 5].map((num) => {
          const checked = value === num;
          return (
            <label
              key={num}
              data-selected={checked}
              className="folio-likert-tile flex flex-col items-center justify-center py-3.5 px-1 min-h-[60px] cursor-pointer text-center"
            >
              <input
                type="radio"
                name={id}
                value={num}
                checked={checked}
                onChange={() => onChange(num)}
                className="sr-only"
              />
              <span
                className="text-xl font-semibold tabular-nums"
                style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
              >
                {num}
              </span>
            </label>
          );
        })}
      </div>

      <div className="flex justify-between font-mono text-[11px] text-[#555963]">
        <span>1 · {lowLabel}</span>
        <span>5 · {highLabel}</span>
      </div>

      {error ? (
        <p role="alert" className="text-xs font-medium text-[#B91C1C]">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
