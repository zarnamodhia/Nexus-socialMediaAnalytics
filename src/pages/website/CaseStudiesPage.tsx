import React from 'react';
import { useData } from '../../context/DataContext';
import {
  Flame,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Split,
  Search,
} from 'lucide-react';

export const CaseStudiesPage: React.FC = () => {
  const { launchInvestigationForTopic, navigateToTerminal } = useData();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-12 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="text-xs font-mono uppercase text-slate-500 font-medium">
          Forensic Dossiers & Validation Scenarios
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-sans">
          Investigative Case Studies
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          Deep-dive analyses of the three primary narrative dynamics modeled in the NEXUS deterministic dataset,
          demonstrating real-world utility for election integrity watchdogs, safety regulators, and market analysts.
        </p>
      </div>

      {/* Case 1: Synthetic Election Audio */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded uppercase">
              Case Study 01 · Breakout Surge
            </span>
            <span className="text-xs text-slate-400 font-mono">Dossier #INV-2026-0881</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">T+48h Inflection Point</span>
        </div>

        <h2 className="text-lg font-bold text-slate-900">
          Coordinated Cascade: Synthetic Audio Election Disinformation Outbreak
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono py-1">
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Volume Acceleration</span>
            <span className="text-sm font-bold text-slate-900">+6,400% (Hour 48-71)</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Dominant Emotion</span>
            <span className="text-sm font-bold text-rose-700">Fear (58%) / Anger (29%)</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Primary Relay Cluster</span>
            <span className="text-sm font-bold text-slate-900">Cluster-Delta (Fringe)</span>
          </div>
        </div>

        <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            <strong>Analytical Findings:</strong> During the first 47 observation hours, discussion surrounding synthetic election audio
            maintained a dormant baseline (0.35 posts/hr). At Hour 48, an unverified synthetic audio excerpt was published simultaneously across
            Telegram broadcast channels and regional X accounts.
          </p>
          <p>
            Within 6 hours, arrival velocity spiked to 22.8 posts/hr. Fact-checking rebuttals using cryptographic watermarking
            exhibited an 8.5-hour confirmation lag, during which viral repost velocity peaked.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-mono">
            Grounding Evidence: 420 events · 5 linked SHA-256 signatures
          </span>
          <button
            onClick={() => launchInvestigationForTopic('Deepfake Election Rumors')}
            className="rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-1.5 transition-colors flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Open Complete Case Dossier →</span>
          </button>
        </div>
      </div>

      {/* Case 2: Autonomous Vehicle Inversion */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase">
              Case Study 02 · Sentiment Inversion
            </span>
            <span className="text-xs text-slate-400 font-mono">Dossier #INV-2026-0882</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">T+36h Inflection Point</span>
        </div>

        <h2 className="text-lg font-bold text-slate-900">
          Trust Asymmetry: Autonomous Vehicle Perception Sensor Crisis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono py-1">
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Sentiment Inversion</span>
            <span className="text-sm font-bold text-rose-700">+0.68 → -0.72 Valence</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Post-Incident Valence</span>
            <span className="text-sm font-bold text-rose-700">82% Negative</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Primary Discussion Hub</span>
            <span className="text-sm font-bold text-slate-900">Reddit & YouTube</span>
          </div>
        </div>

        <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            <strong>Analytical Findings:</strong> Throughout Phase A (Hours 0-35), public discussion of autonomous vehicle safety
            was overwhelmingly positive (80% positive valence), centered around cumulative zero-collision milestones and sensor resilience tests.
          </p>
          <p>
            At Hour 36, an uncrewed vehicle collision at a municipal intersection triggered an instantaneous sentiment collapse.
            Within 120 minutes, sentiment inverted to 82% negative, demonstrating asymmetric trust loss where 36 hours of reputational equity
            evaporated in two observation hours.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-mono">
            Grounding Evidence: 380 events · 4 linked SHA-256 signatures
          </span>
          <button
            onClick={() => launchInvestigationForTopic('Autonomous Vehicle Safety')}
            className="rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-1.5 transition-colors flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Open Complete Case Dossier →</span>
          </button>
        </div>
      </div>

      {/* Case 3: Clean Energy Grid Plateau */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase">
              Case Study 03 · Topic Saturation
            </span>
            <span className="text-xs text-slate-400 font-mono">Vector Benchmark</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">Lifecycle: Saturating</span>
        </div>

        <h2 className="text-lg font-bold text-slate-900">
          Deceleration Dynamics: Clean Energy Grid Transition Discourse Plateau
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono py-1">
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Initial Velocity</span>
            <span className="text-sm font-bold text-slate-900">14.2 posts/hour (Day 1)</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Terminal Velocity</span>
            <span className="text-sm font-bold text-slate-900">1.8 posts/hour (Day 3)</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Velocity Decay</span>
            <span className="text-sm font-bold text-slate-900">-87% Deceleration</span>
          </div>
        </div>

        <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            <strong>Analytical Findings:</strong> Clean energy grid modernization exhibited textbook high-volume saturation.
            The conversation opened with intense policy debates regarding tariff reforms and offshore wind integration.
          </p>
          <p>
            As regulatory guidelines stabilized, conversational velocity steadily declined across 72 hours, categorizing
            the narrative as <code>saturating</code> with low acceleration (0.12x) and minimal emotional volatility.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-mono">
            Grounding Evidence: 290 events · Stable baseline
          </span>
          <button
            onClick={() => navigateToTerminal('trends')}
            className="rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-1.5 transition-colors flex items-center gap-1.5"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Inspect in Trend Explorer →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
