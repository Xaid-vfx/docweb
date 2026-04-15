"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

interface AccordionItem {
  title: string;
  icon: string;
  color: string;
  content: string[];
}

const clinicalData: AccordionItem[] = [
  {
    title: "Clinical Significance",
    icon: "🫀",
    color: "#e63946",
    content: [
      "Elevated PWV is consistently associated with AF, particularly in patients with established disease or high cardiovascular risk.",
      "This relationship supports a mechanistic link between arterial stiffness, impaired ventricular–arterial coupling, and left atrial remodeling, which may promote susceptibility to AF.",
      "Central PWV demonstrates stronger associations with AF than peripheral PWV indices, likely reflecting its closer relationship to aortic loading conditions and cardiac hemodynamics.",
      "Elevated PWV may also reflect early atrial structural and functional abnormalities that precede clinically overt AF.",
    ],
  },
  {
    title: "Clinical Interpretation",
    icon: "🔬",
    color: "#457b9d",
    content: [
      "PWV appears more informative as a marker of prognosis than as a predictor of incident AF.",
      "Associations between PWV and AF appear strongest in established AF, POAF, and populations with high cardiovascular risk.",
      "In several studies, the relationship between PWV and incident AF was attenuated after adjustment for age, blood pressure, and comorbidities, suggesting that PWV reflects cumulative vascular risk.",
      "Evidence also suggests a bidirectional relationship, in which arterial stiffness may contribute to AF development while persistent AF may further impair vascular function.",
    ],
  },
  {
    title: "Clinical Application",
    icon: "💊",
    color: "#2a9d8f",
    content: [
      "PWV may provide additional risk stratification when interpreted alongside clinical risk scores and imaging markers of atrial cardiomyopathy.",
      "PWV may be particularly useful in stress-related clinical contexts such as POAF, where vascular stiffness may identify patients with increased susceptibility to arrhythmia.",
      "In medically managed AF, elevated PWV may help identify patients at higher risk of recurrence or disease progression.",
    ],
  },
];

export default function ConclusionsAccordion() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <ScrollReveal>
      <div className="space-y-3">
        {clinicalData.map((item, i) => (
          <div key={i} className="accordion-item rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="w-full text-left p-5 flex items-center justify-between transition-all duration-300"
              style={{
                background:
                  openIndex === i
                    ? `${item.color}10`
                    : "rgba(255,255,255,0.01)",
                borderLeft:
                  openIndex === i
                    ? `3px solid ${item.color}`
                    : "3px solid transparent",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <h4
                  className="font-semibold text-base transition-colors duration-300"
                  style={{
                    color:
                      openIndex === i ? item.color : "rgba(232, 232, 240, 0.8)",
                  }}
                >
                  {item.title}
                </h4>
              </div>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
                style={{
                  background:
                    openIndex === i
                      ? `${item.color}20`
                      : "rgba(255,255,255,0.03)",
                  transform:
                    openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 4L6 8L10 4"
                    stroke={
                      openIndex === i ? item.color : "rgba(232, 232, 240, 0.4)"
                    }
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>

            <div
              className="transition-all duration-500 ease-in-out overflow-hidden"
              style={{
                maxHeight: openIndex === i ? "600px" : "0",
                opacity: openIndex === i ? 1 : 0,
              }}
            >
              <div className="px-5 pb-5 pt-2 space-y-3">
                {item.content.map((point, j) => (
                  <div key={j} className="flex items-start gap-3 group">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 transition-all duration-300 group-hover:scale-150"
                      style={{ background: item.color }}
                    />
                    <p className="text-sm leading-relaxed text-[rgba(232,232,240,0.65)] group-hover:text-[rgba(232,232,240,0.9)] transition-colors duration-300">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
