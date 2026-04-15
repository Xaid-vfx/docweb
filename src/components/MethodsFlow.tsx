"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    number: "01",
    title: "Identification",
    subtitle: "Database search",
    detail:
      "Systematic searches in databases and registers yielded a comprehensive set of potential articles linking PWV to atrial fibrillation across multiple clinical contexts.",
    icon: "🔍",
    color: "#457b9d",
  },
  {
    number: "02",
    title: "Screening",
    subtitle: "Title & abstract review",
    detail:
      "Records were screened for relevance. Duplicates removed. Titles and abstracts reviewed to identify studies meeting the scoping review criteria.",
    icon: "📋",
    color: "#a8dadc",
  },
  {
    number: "03",
    title: "Eligibility",
    subtitle: "Full-text assessment",
    detail:
      "Full-text articles assessed for eligibility. Reports not retrieved or excluded based on predefined criteria were documented.",
    icon: "✅",
    color: "#2a9d8f",
  },
  {
    number: "04",
    title: "Inclusion",
    subtitle: "Final studies included",
    detail:
      "Studies meeting all criteria were included in the scoping review. Data extracted covered PWV measurement, AF context, outcomes, and study design.",
    icon: "📊",
    color: "#e63946",
  },
];

export default function MethodsFlow() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <ScrollReveal>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* PRISMA Flow */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[rgba(232,232,240,0.5)] uppercase tracking-wider mb-4">
            PRISMA Flow Diagram
          </h4>
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-400 flex items-center gap-4 ${
                activeStep === i ? "scale-[1.01]" : ""
              }`}
              style={{
                background:
                  activeStep === i
                    ? `${step.color}12`
                    : "rgba(255,255,255,0.01)",
                border: `1px solid ${
                  activeStep === i ? `${step.color}40` : "rgba(255,255,255,0.04)"
                }`,
              }}
            >
              {/* Step number */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 transition-all duration-300"
                style={{
                  background:
                    activeStep === i ? `${step.color}20` : "rgba(255,255,255,0.03)",
                  color: activeStep === i ? step.color : "rgba(232,232,240,0.3)",
                }}
              >
                {step.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono"
                    style={{
                      color: activeStep === i ? step.color : "rgba(232,232,240,0.3)",
                    }}
                  >
                    {step.number}
                  </span>
                  <h5
                    className="font-semibold text-sm transition-colors duration-300"
                    style={{
                      color:
                        activeStep === i
                          ? "rgba(232,232,240,0.95)"
                          : "rgba(232,232,240,0.6)",
                    }}
                  >
                    {step.title}
                  </h5>
                </div>
                <p className="text-xs text-[rgba(232,232,240,0.4)] mt-0.5">
                  {step.subtitle}
                </p>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className="absolute left-9 mt-14 w-px h-3"
                  style={{
                    background:
                      i <= activeStep
                        ? `${step.color}30`
                        : "rgba(255,255,255,0.03)",
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div
          className="p-6 rounded-2xl transition-all duration-500 sticky top-32"
          style={{
            background: `${steps[activeStep].color}08`,
            border: `1px solid ${steps[activeStep].color}25`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: `${steps[activeStep].color}15` }}
            >
              {steps[activeStep].icon}
            </div>
            <div>
              <span
                className="text-xs font-mono block"
                style={{ color: steps[activeStep].color }}
              >
                Step {steps[activeStep].number}
              </span>
              <h4 className="font-bold text-lg text-[rgba(232,232,240,0.95)]">
                {steps[activeStep].title}
              </h4>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[rgba(232,232,240,0.7)]">
            {steps[activeStep].detail}
          </p>

          {/* Progress indicator */}
          <div className="mt-6 flex gap-2">
            {steps.map((s, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{
                  background:
                    i <= activeStep
                      ? steps[activeStep].color
                      : "rgba(255,255,255,0.06)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
