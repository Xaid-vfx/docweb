"use client";

import dynamic from "next/dynamic";
import ScrollReveal from "@/components/ScrollReveal";
import Navbar from "@/components/Navbar";

// Dynamic imports for heavy client components
const ECGLine = dynamic(() => import("@/components/ECGLine"), { ssr: false });
const VesselAnimation = dynamic(() => import("@/components/VesselAnimation"), {
  ssr: false,
});
const EvidenceTable = dynamic(() => import("@/components/EvidenceTable"), {
  ssr: false,
});
const ConceptualFlowchart = dynamic(
  () => import("@/components/ConceptualFlowchart"),
  { ssr: false }
);
const MethodsFlow = dynamic(() => import("@/components/MethodsFlow"), {
  ssr: false,
});
const ConclusionsAccordion = dynamic(
  () => import("@/components/ConclusionsAccordion"),
  { ssr: false }
);

const authors = [
  { name: "Oren Nedjar, B.S.", sup: "1" },
  { name: "Zaneh Kahook, B.S.", sup: "1" },
  { name: "Syed Maaz Shah, B.S.", sup: "2" },
  { name: "Christos G. Mihos, D.O.", sup: "3" },
  { name: "Marc Kesselman, D.O.", sup: "1" },
];

const institutions = [
  {
    sup: "1",
    text: "Nova Southeastern University Dr. Kiran C. Patel College of Osteopathic Medicine",
  },
  {
    sup: "2",
    text: "Kansas City College of Osteopathic Medicine",
  },
  {
    sup: "3",
    text: "Echocardiography & Non-Invasive Cardiovascular Laboratory, Division of Cardiology, Mount Sinai Medical Center, Miami Beach, FL",
  },
];

const keyTakeaways = [
  {
    stat: "50M+",
    label: "People affected by AF worldwide",
    color: "#e63946",
  },
  {
    stat: "PWV",
    label: "Gold-standard noninvasive measure of arterial stiffness",
    color: "#457b9d",
  },
  {
    stat: "Central",
    label: "PWV shows stronger associations than peripheral indices",
    color: "#2a9d8f",
  },
  {
    stat: "Bi-directional",
    label: "PWV–AF relationship suggests mutual influence",
    color: "#9b5de5",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center hero-grid overflow-hidden">
        {/* Radial gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(230, 57, 70, 0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 30% 60%, rgba(69, 123, 157, 0.04) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <ScrollReveal delay={100}>
            <div className="badge mx-auto mb-6">
              <span className="pulse-dot" />
              Scoping Review
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
              <span className="gradient-text">Pulse Wave Velocity</span>{" "}
              <br className="hidden md:block" />
              <span className="text-[rgba(232,232,240,0.95)]">in </span>
              <span className="gradient-text-blue">Atrial Fibrillation</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <p className="text-lg md:text-xl text-[rgba(232,232,240,0.5)] max-w-2xl mx-auto mb-8 leading-relaxed">
              Clinical Significance and Current Evidence
            </p>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="max-w-md mx-auto mb-10">
              <ECGLine />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={500}>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[rgba(232,232,240,0.45)]">
              {authors.map((author, i) => (
                <span key={i} className="whitespace-nowrap">
                  {author.name}
                  <sup className="text-[#e63946] text-[10px] ml-0.5">
                    {author.sup}
                  </sup>
                  {i < authors.length - 1 && (
                    <span className="ml-1 text-[rgba(232,232,240,0.2)]">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={600}>
            <div className="mt-4 space-y-1 text-xs text-[rgba(232,232,240,0.3)]">
              {institutions.map((inst, i) => (
                <p key={i}>
                  <sup className="text-[#457b9d]">{inst.sup}</sup> {inst.text}
                </p>
              ))}
            </div>
          </ScrollReveal>

          {/* Scroll indicator */}
          <ScrollReveal delay={800}>
            <div className="mt-16 flex flex-col items-center gap-2 text-[rgba(232,232,240,0.2)]">
              <span className="text-xs uppercase tracking-widest">
                Scroll to explore
              </span>
              <div className="w-5 h-8 rounded-full border border-[rgba(232,232,240,0.15)] relative">
                <div
                  className="w-1 h-2 rounded-full bg-[rgba(232,232,240,0.3)] absolute left-1/2 -translate-x-1/2 top-1.5"
                  style={{ animation: "float 2s ease-in-out infinite" }}
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== KEY STATS ===== */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {keyTakeaways.map((stat, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="card-medical p-6 text-center">
                  <h3
                    className="text-3xl md:text-4xl font-bold mb-2"
                    style={{ color: stat.color }}
                  >
                    {stat.stat}
                  </h3>
                  <p className="text-xs text-[rgba(232,232,240,0.5)] leading-relaxed">
                    {stat.label}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== BACKGROUND ===== */}
      <section id="background" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="badge mb-4">
              <span className="pulse-dot" />
              Background
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-[rgba(232,232,240,0.95)]">
              Why Pulse Wave Velocity Matters
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollReveal delay={100}>
              <div className="card-medical p-6 h-full">
                <div className="w-10 h-10 rounded-xl bg-[rgba(230,57,70,0.1)] flex items-center justify-center mb-4 text-lg">
                  🫀
                </div>
                <h3 className="font-semibold text-[#e63946] mb-3">
                  Atrial Fibrillation
                </h3>
                <p className="text-sm text-[rgba(232,232,240,0.6)] leading-relaxed">
                  Atrial fibrillation (AF) is the most common sustained
                  arrhythmia worldwide (&gt;50 million people), and is
                  associated with increased risk of stroke, heart failure, and
                  mortality.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="card-medical p-6 h-full">
                <div className="w-10 h-10 rounded-xl bg-[rgba(69,123,157,0.1)] flex items-center justify-center mb-4 text-lg">
                  🩺
                </div>
                <h3 className="font-semibold text-[#457b9d] mb-3">
                  Arterial Stiffness
                </h3>
                <p className="text-sm text-[rgba(232,232,240,0.6)] leading-relaxed">
                  Arterial stiffness reflects vascular aging and cumulative
                  cardiovascular risk. Pulse wave velocity (PWV) is the
                  gold-standard noninvasive measure of arterial stiffness.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="card-medical p-6 md:col-span-2 h-full">
                <div className="w-10 h-10 rounded-xl bg-[rgba(42,157,143,0.1)] flex items-center justify-center mb-4 text-lg">
                  ❓
                </div>
                <h3 className="font-semibold text-[#2a9d8f] mb-3">
                  The Knowledge Gap
                </h3>
                <p className="text-sm text-[rgba(232,232,240,0.6)] leading-relaxed">
                  The clinical role of PWV across the spectrum of AF remains
                  unclear. This scoping review evaluates the clinical
                  significance of PWV in AF, including its role in prediction,
                  disease association, risk stratification, prognosis, and
                  patient management.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== VESSEL ANIMATION ===== */}
      <section id="vessel" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="badge mx-auto mb-4">
                <span className="pulse-dot" />
                Interactive Diagram
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[rgba(232,232,240,0.95)]">
                Physiological Link Between{" "}
                <span className="gradient-text">Arterial Stiffness</span> and{" "}
                <span className="gradient-text-blue">PWV</span>
              </h2>
              <p className="text-sm text-[rgba(232,232,240,0.45)] max-w-xl mx-auto">
                Toggle between vessel types to see how arterial compliance
                affects pulse wave velocity. Watch the blood flow arrows and
                wall deformation in real time.
              </p>
            </div>
          </ScrollReveal>

          <VesselAnimation />
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== OBJECTIVE & METHODS ===== */}
      <section id="methods" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="badge mb-4">
              <span className="pulse-dot" />
              Objective & Methods
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[rgba(232,232,240,0.95)]">
              Study Design
            </h2>
            <p className="text-sm text-[rgba(232,232,240,0.5)] mb-12 max-w-2xl leading-relaxed">
              To conduct a scoping review evaluating the clinical significance
              of PWV in AF, including its role in: prediction of incident AF,
              association with established AF, AF burden and recurrence,
              post-operative AF risk stratification, clinical outcomes, and
              clinical utility for risk stratification and patient management.
            </p>
          </ScrollReveal>

          <MethodsFlow />
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== EVIDENCE TABLE ===== */}
      <section id="evidence" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="badge mx-auto mb-4">
                <span className="pulse-dot" />
                Results & Discussion
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[rgba(232,232,240,0.95)]">
                Summary of Evidence Linking{" "}
                <span className="gradient-text">PWV</span> and{" "}
                <span className="gradient-text-blue">AF</span>
              </h2>
              <p className="text-sm text-[rgba(232,232,240,0.45)] max-w-xl mx-auto">
                Click any row to expand and see detailed findings for each
                clinical context.
              </p>
            </div>
          </ScrollReveal>

          <EvidenceTable />
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== CONCEPTUAL INTERPRETATION ===== */}
      <section id="interpretation" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="badge mb-4">
              <span className="pulse-dot" />
              Interpretation
            </div>
          </ScrollReveal>

          <ConceptualFlowchart />
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== CONCLUSIONS ===== */}
      <section id="conclusions" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="badge mx-auto mb-4">
                <span className="pulse-dot" />
                Conclusions & Key Takeaways
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[rgba(232,232,240,0.95)]">
                Clinical Insights
              </h2>
              <p className="text-sm text-[rgba(232,232,240,0.45)] max-w-xl mx-auto">
                Explore the clinical significance, interpretation, and
                application of PWV findings in AF management.
              </p>
            </div>
          </ScrollReveal>

          <ConclusionsAccordion />
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== FOOTER ===== */}
      <footer className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <div className="card-medical p-8 mb-8">
              <h3 className="text-lg font-semibold text-[rgba(232,232,240,0.8)] mb-2">
                References
              </h3>
              <p className="text-xs text-[rgba(232,232,240,0.4)] leading-relaxed max-w-lg mx-auto">
                Full reference list available in the original research poster.
                This interactive presentation was created from a scoping review
                conducted at Nova Southeastern University and affiliated
                institutions.
              </p>
            </div>
          </ScrollReveal>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[rgba(230,57,70,0.1)] flex items-center justify-center">
                <span className="text-[#e63946] text-xs font-bold">NSU</span>
              </div>
              <span className="text-xs text-[rgba(232,232,240,0.4)]">
                NSU Florida
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[rgba(69,123,157,0.1)] flex items-center justify-center">
                <span className="text-[#457b9d] text-xs">🏥</span>
              </div>
              <span className="text-xs text-[rgba(232,232,240,0.4)]">
                Cleveland Clinic
              </span>
            </div>
          </div>

          <p className="text-xs text-[rgba(232,232,240,0.2)]">
            © {new Date().getFullYear()} · Nedjar, Kahook, Shah, Mihos,
            Kesselman · Interactive Research Presentation
          </p>
        </div>
      </footer>
    </>
  );
}
