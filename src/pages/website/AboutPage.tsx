import React from 'react';
import { useData } from '../../context/DataContext';
import {
  ShieldAlert,
  ShieldCheck,
  BrainCircuit,
  Users,
  Terminal,
  Activity,
  Award,
  BookOpen,
  ArrowRight,
  Lock,
  Cpu,
  HeartHandshake,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigateToTerminal, setSiteSection } = useData();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-12 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="text-xs font-mono uppercase text-slate-500 font-medium">
          Smart India Hackathon · Problem Statement 26152
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-sans">
          About NEXUS & The SIH 26152 Initiative
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          NEXUS is an open, verifiable social narrative intelligence platform engineered to fulfill the comprehensive
          analytical mandate of SIH Problem Statement 26152: Social Media Analytics.
        </p>
      </div>

      {/* 1. Problem Statement Mandate */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">
            The SIH Problem Statement 26152 Mandate
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Contemporary information environments are characterized by rapid narrative contagion, sudden sentiment inversions,
          and fragmented cross-platform discourse. Modern intelligence institutions require systematic analytical tools that
          can answer five foundational questions without resorting to ungrounded heuristics or opaque black-box AI:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded border border-slate-200 bg-white p-4 space-y-1.5">
            <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-2">
              <span className="h-5 w-5 rounded bg-slate-100 flex items-center justify-center text-[10px]">1</span>
              <span>What are people discussing?</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Continuous multi-topic discovery and keyword cluster tracking across platforms to isolate emerging topics before they reach saturation.
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-white p-4 space-y-1.5">
            <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-2">
              <span className="h-5 w-5 rounded bg-slate-100 flex items-center justify-center text-[10px]">2</span>
              <span>How do people feel about topics?</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Transparent valence scoring (-1.0 to +1.0) and discrete emotion mapping (joy, anger, fear, sadness, surprise) with explainable lexicons.
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-white p-4 space-y-1.5">
            <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-2">
              <span className="h-5 w-5 rounded bg-slate-100 flex items-center justify-center text-[10px]">3</span>
              <span>Which audience groups are participating?</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Structural community clustering based on observed topic affinity, platform usage, and languages—without invasive demographic inference.
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-white p-4 space-y-1.5">
            <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-2">
              <span className="h-5 w-5 rounded bg-slate-100 flex items-center justify-center text-[10px]">4</span>
              <span>How does information spread?</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Topological parent-child cascade mapping and degree centrality metrics across reply threads and repost chains.
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-white p-4 space-y-1.5 md:col-span-2">
            <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-2">
              <span className="h-5 w-5 rounded bg-slate-100 flex items-center justify-center text-[10px]">5</span>
              <span>Which topics are accelerating or changing over time?</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Second-derivative acceleration tracking and inflection point isolation to detect breakout cascades and sentiment collapses.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Responsible AI & Ethical Boundaries */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">
            Responsible AI & Ethical Research Commitments
          </h2>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 space-y-3 text-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900">1. Zero Demographic Guessing</h4>
            <p className="text-slate-600 leading-relaxed">
              NEXUS strictly prohibits inferring an individual&apos;s race, religion, gender, or political registration from social text.
              All audience grouping is aggregate and behavioral, tracking public topical interest vectors rather than personal traits.
            </p>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-900">2. Non-Causality & Relay Neutrality</h4>
            <p className="text-slate-600 leading-relaxed">
              Observed network edges represent verifiable reply or repost relationships. They do not substantiate coordinated inauthentic
              behavior (CIB) or malicious conspiracy without external corroborating technical indicators.
            </p>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-900">3. Tamper-Evident Chain-of-Custody</h4>
            <p className="text-slate-600 leading-relaxed">
              Every analyzed social event is anchored into a recursive SHA-256 ledger. Analysts, journalists, and oversight bodies
              can mathematically verify that data was not altered or cherry-picked to support preconceived narratives.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Technology Stack */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">
            Modern Scientific Architecture
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="rounded border border-slate-200 bg-white p-3 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Core Framework</div>
            <div className="font-bold text-slate-900">React 19 & TypeScript</div>
          </div>
          <div className="rounded border border-slate-200 bg-white p-3 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Topology Engine</div>
            <div className="font-bold text-slate-900">HTML5 Canvas Force</div>
          </div>
          <div className="rounded border border-slate-200 bg-white p-3 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Cryptographic Engine</div>
            <div className="font-bold text-slate-900">FIPS 180-4 SHA-256</div>
          </div>
          <div className="rounded border border-slate-200 bg-white p-3 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Styling System</div>
            <div className="font-bold text-slate-900">Tailwind CSS (Restrained)</div>
          </div>
        </div>
      </section>

      {/* 4. Action */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-900">Experience the Full Platform</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          NEXUS is fully functional right now. Explore the 1,200-event benchmark dataset, inspect cross-platform network graphs,
          review the case studies, or test the cryptographic tamper detection system.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => navigateToTerminal('overview')}
            className="rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 flex items-center gap-1.5 transition-colors"
          >
            <Terminal className="h-4 w-4" />
            <span>Launch Live Intelligence Platform</span>
          </button>
          <button
            onClick={() => setSiteSection('case-studies')}
            className="rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs px-4 py-2 transition-colors"
          >
            <span>Review Investigative Case Studies</span>
          </button>
        </div>
      </div>
    </div>
  );
};
