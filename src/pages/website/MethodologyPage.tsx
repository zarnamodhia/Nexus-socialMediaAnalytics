import React from 'react';
import { useData } from '../../context/DataContext';
import {
  BrainCircuit,
  Lock,
  Share2,
  TrendingUp,
  ShieldCheck,
  Info,
  Terminal,
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  const { navigateToTerminal } = useData();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-12 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="text-xs font-mono uppercase text-slate-500 font-medium">
          Forensic & Algorithmic Standards
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-sans">
          NEXUS Methodology Specification
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          Scientific documentation of the mathematical models, lexical scoring algorithms, cryptographic hash chains,
          and responsible data governance principles powering the NEXUS platform.
        </p>
      </div>

      {/* 1. Lexical Valence Modeling */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">
            1. Transparent Lexical Valence & Emotion Classification
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Rather than relying on non-deterministic, opaque neural network black boxes, NEXUS implements an explainable,
          deterministic lexical scoring engine derived from established computational linguistics benchmarks (AFINN and VADER).
          Every score is mathematically reproducible from the underlying text.
        </p>

        <div className="rounded border border-slate-200 bg-white p-4 space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 font-mono text-[11px] uppercase">
            A. Valence Assignment & Negation Rules
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Words are evaluated against curated positive (valence μ in [+1.5, +3.0]) and negative (valence μ in [-1.5, -3.0]) lexicons.
            Preceding tokens are inspected for negation operators (<code>not</code>, <code>never</code>, <code>barely</code>, <code>hardly</code>)
            which invert and damp the valence signal by -0.75×. Intensifiers (<code>extremely</code>, <code>massively</code>, <code>hugely</code>)
            apply multiplicative scalar boosts (×1.4 to ×1.8).
          </p>

          <h3 className="font-bold text-slate-900 font-mono text-[11px] uppercase pt-2">
            B. Confidence Metric Calculation
          </h3>
          <p className="text-slate-600 leading-relaxed font-mono text-[11px]">
            Confidence = Math.min(0.98, Math.max(0.62, 0.55 + (Token_Matches × 0.08) + (|Normalized_Score| × 0.25)))
          </p>
          <p className="text-slate-500 text-[11px]">
            Confidence directly reflects the lexical signal density and the magnitude of the normalized valence score.
          </p>
        </div>
      </section>

      {/* 2. Transparent Trend Score Equation */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">
            2. The Multi-Factor Trend Acceleration Equation
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          In compliance with SIH Problem Statement 26152, narrative velocity is never presented as an unexplained AI judgment.
          Topic rankings are derived strictly from four verifiable physical variables:
        </p>

        <div className="rounded border border-slate-200 bg-slate-50 p-4 font-mono text-xs space-y-2">
          <div className="font-bold text-slate-900 text-sm">
            Trend Score = (W₁ × Growth_Rate) + (W₂ × Acceleration) + (W₃ × Engagement_Velocity) + (W₄ × Sentiment_Volatility)
          </div>
          <div className="text-slate-600 text-[11px]">
            Where: W₁ = 0.40, W₂ = 0.30, W₃ = 0.20, W₄ = 0.10 (Sum = 1.00)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="rounded border border-slate-200 bg-white p-3.5 space-y-1">
            <span className="font-bold text-slate-900 block font-sans">Volume Growth Rate (40%)</span>
            <p className="font-sans text-slate-600 text-[11px]">
              Compares recent observation window volume against baseline window volume: <code>((V_recent - V_base) / V_base) × 100</code>.
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-white p-3.5 space-y-1">
            <span className="font-bold text-slate-900 block font-sans">Acceleration Factor (30%)</span>
            <p className="font-sans text-slate-600 text-[11px]">
              Evaluates the second derivative of post arrival velocity, identifying rapid exponential cascades before raw volume peaks.
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-white p-3.5 space-y-1">
            <span className="font-bold text-slate-900 block font-sans">Engagement Velocity (20%)</span>
            <p className="font-sans text-slate-600 text-[11px]">
              Aggregates interaction intensity (Likes + 2×Reposts + 3×Comments) per unit time across platforms.
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-white p-3.5 space-y-1">
            <span className="font-bold text-slate-900 block font-sans">Sentiment Volatility (10%)</span>
            <p className="font-sans text-slate-600 text-[11px]">
              Measures the absolute delta between recent average valence vs baseline average valence (|Δ valence|).
            </p>
          </div>
        </div>
      </section>

      {/* 3. Cryptographic Hash Provenance */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">
            3. Cryptographic Provenance & Hash Chain Architecture
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Forensic evidence requires tamper-evident provenance. NEXUS links every social media event into a sequential
          cryptographic hash chain adhering to NIST FIPS 180-4 SHA-256 specifications.
        </p>

        <div className="rounded border border-slate-200 bg-white p-4 space-y-2 text-xs">
          <div className="font-mono text-[11px] text-slate-900 font-bold">
            {'H_n = SHA-256( H_(n-1) ∥ ID ∥ Timestamp ∥ Platform ∥ AuthorID ∥ Text ∥ Topic ∥ Sentiment )'}
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Because each record&apos;s payload includes the hash of the preceding record (&apos;H_(n-1)&apos;), retroactive alteration of
            even a single character or timestamp invalidates the entire subsequent chain. The verification algorithm
            executes across all 1,200 events in less than 15 milliseconds.
          </p>

          <div className="mt-3 p-3 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
            <strong className="text-slate-900 block">Crucial Epistemic Boundary:</strong>
            Cryptographic hashing proves that a record in the database has not been modified or deleted post-ingest.
            It does <strong>not</strong> claim to prove that the external author's social post was empirically truthful in the physical world.
          </div>
        </div>
      </section>

      {/* 4. Network Centrality & Non-Causality */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">
            4. Topological Network Measures & The Non-Causality Rule
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Network graphs in NEXUS reflect verified parent-child interactions extracted from post metadata:
        </p>

        <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5 pl-2">
          <li><strong>In-Degree:</strong> Number of times an author's post is replied to or reposted (measure of amplification).</li>
          <li><strong>Out-Degree:</strong> Number of times an author replies to or reposts other nodes (measure of relay activity).</li>
          <li><strong>Degree Centrality:</strong> Total observed relational interactions across the monitored graph.</li>
        </ul>

        <div className="rounded border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-1">
          <strong className="text-slate-900 block font-sans">Methodological Distinction: Observed vs. Inferred Links</strong>
          <p className="leading-relaxed text-[11px]">
            Topological clustering and relay speed demonstrate that information traveled between nodes.
            They do <strong>not</strong> prove coordinated conspiracy, financial collusion, or legal intent without external corroborated intelligence.
          </p>
        </div>
      </section>

      {/* 5. Ethical Governance */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">
            5. Ethical Governance: Zero Speculative Demographic Profiling
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          NEXUS enforces a zero-tolerance policy against hallucinated demographic profiling. The platform never infers or claims
          to detect personal characteristics such as age, gender, race, religion, or physical residential coordinates unless
          explicitly authenticated. All audience grouping reflects <strong>behavioral community clusters</strong> based exclusively
          on public conversational interaction patterns.
        </p>
      </section>

      {/* CTA */}
      <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
        <span className="text-xs text-slate-500">Inspect the live implementation in the terminal:</span>
        <button
          onClick={() => navigateToTerminal('overview')}
          className="rounded bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition-colors"
        >
          Launch Terminal →
        </button>
      </div>
    </div>
  );
};
