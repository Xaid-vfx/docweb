"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

interface FlowNode {
  id: string;
  label: string;
  detail: string;
  color: string;
  children?: string[];
}

const flowData: FlowNode[] = [
  {
    id: "pwv-af",
    label: "PWV–AF Relationship",
    detail:
      "Central PWV showed more consistent associations. Peripheral indices often null or weaker.",
    color: "#e63946",
    children: ["central-peripheral", "predictive-prognostic", "bidirectional"],
  },
  {
    id: "central-peripheral",
    label: "Central vs Peripheral PWV",
    detail:
      "Central stiffness better reflects aortic load. More relevant to LA stress and remodeling.",
    color: "#f4a261",
    children: [],
  },
  {
    id: "predictive-prognostic",
    label: "Predictive vs Prognostic Value",
    detail:
      "Incident AF prediction association attenuated after risk adjustment. Stronger signal in established high-risk AF. Better as prognosis marker than screening tool.",
    color: "#2a9d8f",
    children: [],
  },
  {
    id: "bidirectional",
    label: "Bidirectional Relationship",
    detail:
      "Arterial stiffness may promote AF substrates. AF may worsen vascular dysfunction. End-organ AF may lack feed-forward remodeling.",
    color: "#9b5de5",
    children: [],
  },
];

const interpretationData = [
  {
    label: "Stress-Triggered / Post-operative",
    items: [
      { text: "Stronger findings in POAF", color: "#f4a261" },
      { text: "Higher PWV & elevated filling pressures most informative", color: "#f4a261" },
      { text: "Chronic stiffness may create vulnerable substrate", color: "#f4a261" },
      { text: "Acute physiologic triggers expose risk", color: "#f4a261" },
    ],
  },
  {
    label: "Context-Dependent Utility",
    items: [
      { text: "Useful for recurrence in medically managed AF", color: "#2a9d8f" },
      { text: "Not predictive for post-ablation recurrence", color: "#e63946" },
      { text: "Not useful for inducibility in EP lab", color: "#e63946" },
      { text: "Utility varies by clinical setting", color: "#a8dadc" },
    ],
  },
  {
    label: "Measurement & Research Gaps",
    items: [
      { text: "Heterogeneous PWV techniques", color: "#9b5de5" },
      { text: "AF rhythm variability affects measurement", color: "#9b5de5" },
      { text: "Need standardized AF-specific protocols", color: "#9b5de5" },
      { text: "Need longitudinal and interventional studies", color: "#9b5de5" },
    ],
  },
];

export default function ConceptualFlowchart() {
  const [activeNode, setActiveNode] = useState<string>("pwv-af");
  const active = flowData.find((n) => n.id === activeNode);

  return (
    <div className="space-y-12">
      {/* Interactive flow */}
      <ScrollReveal>
        <h3 className="text-xl font-bold mb-6 text-center gradient-text">
          Conceptual Interpretation of the PWV–AF Relationship
        </h3>

        {/* Root node */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setActiveNode("pwv-af")}
            className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${
              activeNode === "pwv-af"
                ? "bg-[rgba(230,57,70,0.15)] border-2 border-[#e63946] text-[#e63946] shadow-lg shadow-[rgba(230,57,70,0.2)]"
                : "bg-[rgba(230,57,70,0.05)] border border-[rgba(230,57,70,0.2)] text-[rgba(232,232,240,0.7)] hover:border-[#e63946]"
            }`}
          >
            PWV–AF Relationship
          </button>

          {/* Connecting lines */}
          <div className="w-px h-8 bg-gradient-to-b from-[rgba(230,57,70,0.4)] to-transparent" />

          {/* Children nodes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {flowData.slice(1).map((node) => (
              <button
                key={node.id}
                onClick={() => setActiveNode(node.id)}
                className={`p-4 rounded-xl text-left transition-all duration-300 ${
                  activeNode === node.id
                    ? "shadow-lg scale-[1.02]"
                    : "hover:scale-[1.01]"
                }`}
                style={{
                  background:
                    activeNode === node.id
                      ? `${node.color}15`
                      : "rgba(255,255,255,0.02)",
                  border: `1px solid ${
                    activeNode === node.id
                      ? `${node.color}60`
                      : "rgba(255,255,255,0.05)"
                  }`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full mb-2"
                  style={{ background: node.color }}
                />
                <h4
                  className="font-semibold text-sm mb-1"
                  style={{
                    color:
                      activeNode === node.id
                        ? node.color
                        : "rgba(232, 232, 240, 0.8)",
                  }}
                >
                  {node.label}
                </h4>
                <p className="text-xs text-[rgba(232,232,240,0.5)] leading-relaxed">
                  {node.detail}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Active detail panel */}
        {active && (
          <div
            className="mt-6 p-5 rounded-xl transition-all duration-500"
            style={{
              background: `${active.color}08`,
              border: `1px solid ${active.color}30`,
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: active.color }}
              />
              <h4
                className="font-semibold text-sm"
                style={{ color: active.color }}
              >
                {active.label}
              </h4>
            </div>
            <p className="text-sm leading-relaxed text-[rgba(232,232,240,0.7)]">
              {active.detail}
            </p>
          </div>
        )}
      </ScrollReveal>

      {/* Interpretation sections */}
      <ScrollReveal delay={200}>
        <h3 className="text-xl font-bold mb-6 text-center gradient-text-blue">
          Interpretation of the PWV–AF Relationship
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {interpretationData.map((section, i) => (
            <div key={i} className="card-medical p-5">
              <h4 className="font-semibold text-sm mb-4 text-[rgba(232,232,240,0.9)]">
                {section.label}
              </h4>
              <div className="space-y-3">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-3 group">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 transition-all duration-300 group-hover:scale-150"
                      style={{ background: item.color }}
                    />
                    <span className="text-xs text-[rgba(232,232,240,0.6)] leading-relaxed group-hover:text-[rgba(232,232,240,0.9)] transition-colors duration-300">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}
