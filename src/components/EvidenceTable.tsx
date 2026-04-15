"use client";

import React from "react";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const tableData = [
  {
    context: "Incident AF",
    association: "Mixed",
    meaning: "Limited screening value",
    color: "#a8dadc",
    detail:
      "While PWV is elevated in many incident AF cases, results vary by study. Peripheral indices are often null or weaker, suggesting PWV alone may not be a reliable screening tool for new-onset AF.",
  },
  {
    context: "Established AF",
    association: "Consistent ↑ PWV",
    meaning: "Marker of disease severity",
    color: "#e63946",
    detail:
      "Patients with established AF consistently show elevated PWV. Central PWV demonstrates stronger associations than peripheral measures, reflecting the closer relationship to aortic loading conditions.",
  },
  {
    context: "Post-operative AF",
    association: "Strong association",
    meaning: "Perioperative risk marker",
    color: "#f4a261",
    detail:
      "PWV is particularly useful in stress-related clinical contexts such as POAF. Higher PWV & elevated filling pressures are most informative. Chronic stiffness may create vulnerable substrate.",
  },
  {
    context: "Prognosis",
    association: "Higher PWV → worse outcomes",
    meaning: "Risk stratification",
    color: "#2a9d8f",
    detail:
      "PWV appears more informative as a marker of prognosis than as a predictor of incident AF. Associations are strongest in established AF, POAF, and populations with high cardiovascular risk.",
  },
  {
    context: "Recurrence / Burden",
    association: "Context dependent",
    meaning: "Adjunct marker in select patients",
    color: "#9b5de5",
    detail:
      "Useful for recurrence in medically managed AF. Not predictive for post-ablation recurrence. Not useful for reducibility in LT lab. Utility varies by clinical setting.",
  },
];

export default function EvidenceTable() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  return (
    <ScrollReveal>
      <div className="card-medical overflow-hidden">
        <div className="overflow-x-auto">
          <table className="evidence-table">
            <thead>
              <tr>
                <td className="w-[180px]">AF Context</td>
                <th>PWV Association</th>
                <th>Clinical Meaning</th>
                <th className="w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <React.Fragment key={i}>
                  <tr
                    onClick={() =>
                      setExpandedRow(expandedRow === i ? null : i)
                    }
                    className="cursor-pointer"
                    style={{
                      background:
                        expandedRow === i
                          ? "rgba(69, 123, 157, 0.08)"
                          : "transparent",
                    }}
                  >
                    <td>
                      <span
                        className="font-semibold"
                        style={{ color: row.color }}
                      >
                        {row.context}
                      </span>
                    </td>
                    <td>{row.association}</td>
                    <td>{row.meaning}</td>
                    <td className="text-center">
                      <span
                        className="inline-block transition-transform duration-300"
                        style={{
                          transform:
                            expandedRow === i
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          color: "rgba(232, 232, 240, 0.4)",
                        }}
                      >
                        ▼
                      </span>
                    </td>
                  </tr>
                  {expandedRow === i && (
                    <tr key={`detail-${i}`}>
                      <td
                        colSpan={4}
                        style={{
                          padding: "0 20px 16px 20px",
                          background: "rgba(69, 123, 157, 0.05)",
                        }}
                      >
                        <div
                          className="text-sm leading-relaxed"
                          style={{
                            color: "rgba(232, 232, 240, 0.7)",
                            borderLeft: `3px solid ${row.color}`,
                            paddingLeft: 16,
                            marginTop: 4,
                          }}
                        >
                          {row.detail}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ScrollReveal>
  );
}
