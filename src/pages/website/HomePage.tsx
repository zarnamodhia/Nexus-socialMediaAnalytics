import React from 'react';
import { useData } from '../../context/DataContext';
import {
  Activity,
  ShieldCheck,
  Share2,
  TrendingUp,
  FolderKanban,
  ArrowRight,
  Database,
  Terminal,
  Lock,
  BrainCircuit,
  Split,
  FileText,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    events,
    filteredEvents,
    navigateToTerminal,
    setSiteSection,
    integrityResult,
    launchInvestigationForTopic,
    setSelectedPostForModal,
  } = useData();

  const isLedgerVerified = integrityResult?.isValid ?? true;

  // Pick 4 diverse representative sample events from the loaded dataset
  const sampleEvents = React.useMemo(() => {
    if (events.length === 0) return [];
    const platforms = ['X/Twitter', 'Telegram', 'YouTube', 'Reddit'];
    return platforms
      .map((p) => events.find((e) => e.platform === p))
      .filter((e): e is NonNullable<typeof e> => Boolean(e));
  }, [events]);

  return (
    <div className="space-y-16 py-8">
      {/* 1. Hero Section: Editorial, Authoritative, Restrained */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
            <span>SIH Problem Statement 26152</span>
            <span>·</span>
            <span>Cross-Platform Narrative Forensics</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950 font-sans text-balance leading-tight">
            Empirical social intelligence. Verifiable cryptographic provenance.
          </h1>

          <p className="text-base text-slate-600 leading-relaxed font-normal max-w-2xl text-balance">
            NEXUS is a professional-grade intelligence platform engineered for researchers, analysts, and public interest institutions.
            Track narrative velocity, quantify sentiment shifts, map information pathways, and verify evidence integrity without invasive profiling.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigateToTerminal('overview')}
              className="flex items-center gap-2 rounded bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white transition-colors shadow-xs"
            >
              <Terminal className="h-4 w-4" />
              <span>Launch Intelligence Terminal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setSiteSection('methodology')}
              className="flex items-center gap-2 rounded border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors"
            >
              <span>Explore Forensic Methodology</span>
            </button>
          </div>
        </div>

        {/* Live Ingest Telemetry Bar */}
        <div className="mt-12 rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-medium">Active Ingest Stream</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                {events.length.toLocaleString()} Events
              </div>
              <div className="text-[11px] text-slate-500 font-sans">Deterministic Seed #428795</div>
            </div>

            <div>
              <div className="text-[10px] uppercase text-slate-400 font-medium">Monitored Actors</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                120 Pseudonyms
              </div>
              <div className="text-[11px] text-slate-500 font-sans">Across 5 Structural Clusters</div>
            </div>

            <div>
              <div className="text-[10px] uppercase text-slate-400 font-medium">Observation Horizon</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                72 Continuous Hours
              </div>
              <div className="text-[11px] text-slate-500 font-sans">3 Inflection Scenarios</div>
            </div>

            <div>
              <div className="text-[10px] uppercase text-slate-400 font-medium">Ledger Audit State</div>
              <div className="text-lg font-bold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                <span>{isLedgerVerified ? '100% Verified' : 'Audit Alert'}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-sans">FIPS 180-4 SHA-256 Chain</div>
            </div>
          </div>
        </div>

        {/* Live Sample Feed Spotlight */}
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                Live Stream Inspection
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Sample Verified Events Across Channels
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Click any event card to inspect transparent NLP tokens & SHA-256 hash
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedPostForModal(evt)}
                className="group cursor-pointer rounded border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-400 p-3.5 transition-all text-xs space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      {evt.platform}
                    </span>
                    <span className="font-mono text-slate-500">{evt.authorId}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] uppercase font-semibold ${
                    evt.sentiment === 'positive'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : evt.sentiment === 'negative'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {evt.sentiment} ({Math.round(evt.sentimentConfidence * 100)}%)
                  </span>
                </div>

                <p className="text-slate-800 line-clamp-2 leading-relaxed">
                  &ldquo;{evt.text}&rdquo;
                </p>

                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-100">
                  <span className="truncate max-w-[200px] text-slate-600 font-medium">Topic: {evt.topic}</span>
                  <span className="text-slate-500 group-hover:text-slate-900 group-hover:underline flex items-center gap-1">
                    Inspect Ledger Entry →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Analytical Pillars: Five Core Disciplines */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="border-b border-slate-200 pb-4 mb-8">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Core Analytical Disciplines
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Engineered to address the five foundational requirements of SIH Problem Statement 26152
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Temporal Dynamics */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2.5">
            <div className="h-8 w-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700">
              <Activity className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              1. Temporal Dynamics & Trend Acceleration
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detect sudden breaking surges, measure 1st & 2nd derivative volume velocity, and analyze before/after
              inflection divergence to identify accelerating narratives in real time.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigateToTerminal('timeline')}
                className="text-xs font-medium text-slate-800 hover:text-slate-950 flex items-center gap-1"
              >
                Inspect Timeline Module →
              </button>
            </div>
          </div>

          {/* Pillar 2: Explainable Sentiment */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2.5">
            <div className="h-8 w-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              2. Explainable Sentiment & Emotion Diagnostics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent lexical valence modeling with negation modifiers and discrete emotional vectors (joy, anger,
              fear, sadness, surprise) without opaque black-box scoring.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigateToTerminal('sentiment')}
                className="text-xs font-medium text-slate-800 hover:text-slate-950 flex items-center gap-1"
              >
                Inspect Sentiment Module →
              </button>
            </div>
          </div>

          {/* Pillar 3: Network Topology */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2.5">
            <div className="h-8 w-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700">
              <Share2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              3. Cross-Platform Propagation & Relays
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Map observed parent-child reply threads and repost relays across X, Telegram, Reddit, YouTube, and Bluesky.
              Identify high-connectivity hubs while strictly separating observed links from inferred intent.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigateToTerminal('network')}
                className="text-xs font-medium text-slate-800 hover:text-slate-950 flex items-center gap-1"
              >
                Inspect Network Topology →
              </button>
            </div>
          </div>

          {/* Pillar 4: Cryptographic Provenance */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2.5">
            <div className="h-8 w-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700">
              <Lock className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              4. Cryptographic Provenance & Tamper Evidence
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Recursive SHA-256 hash chaining ensures complete post-ingest immutability. Instant mathematical verification
              detects and pinpoints any modified record in milliseconds.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigateToTerminal('evidence')}
                className="text-xs font-medium text-slate-800 hover:text-slate-950 flex items-center gap-1"
              >
                Inspect Cryptographic Ledger →
              </button>
            </div>
          </div>

          {/* Pillar 5: Structured Narrative Investigations */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2.5">
            <div className="h-8 w-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700">
              <FolderKanban className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              5. Structured Narrative Dossiers & Export
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete investigation workflows categorizing findings into Observed Facts, Model Interpretations, and
              Hypotheses, with verified evidence grounding and exportable JSON, CSV, and PDF reports.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigateToTerminal('investigation')}
                className="text-xs font-medium text-slate-800 hover:text-slate-950 flex items-center gap-1"
              >
                Inspect Investigation Dossiers →
              </button>
            </div>
          </div>

          {/* Pillar 6: Audience Clustering */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2.5">
            <div className="h-8 w-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700">
              <Database className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              6. Behavioral Audience Clustering
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Aggregate community grouping across language, platform affinity, and topic interests without invasive
              demographic inference or fabricated personal profiles.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigateToTerminal('audience')}
                className="text-xs font-medium text-slate-800 hover:text-slate-950 flex items-center gap-1"
              >
                Inspect Audience Intelligence →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Investigative Scenarios Preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase text-slate-500 font-medium">
                Deterministic Validation Dataset
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Three Empirical Narrative Phenomenon Benchmarks
              </h2>
            </div>
            <button
              onClick={() => setSiteSection('case-studies')}
              className="text-xs font-semibold text-slate-800 hover:text-slate-950 flex items-center gap-1"
            >
              View Full Case Studies <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Scenario 1 */}
            <div className="rounded border border-slate-200 bg-white p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-rose-700 font-bold uppercase">Breakout Surge</span>
                <span className="text-slate-400">T+48h Inflection</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                Synthetic Audio Election Outbreak
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                A dormant rumor accelerates by +6,400% after Hour 48, amplified through Telegram relay channels with high fear and anger resonance.
              </p>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono text-[10px]">Volume: 420 events</span>
                <button
                  onClick={() => launchInvestigationForTopic('Deepfake Election Rumors')}
                  className="font-medium text-slate-900 hover:underline"
                >
                  Analyze Dossier →
                </button>
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="rounded border border-slate-200 bg-white p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-800 font-bold uppercase">Sentiment Inversion</span>
                <span className="text-slate-400">T+36h Incident</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                Autonomous Vehicle Perception Inversion
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Topic shifts abruptly from 80% positive optimism to 82% negative outrage following a reported collision incident at Hour 36.
              </p>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono text-[10px]">Shift: -1.40 Valence</span>
                <button
                  onClick={() => launchInvestigationForTopic('Autonomous Vehicle Safety')}
                  className="font-medium text-slate-900 hover:underline"
                >
                  Analyze Dossier →
                </button>
              </div>
            </div>

            {/* Scenario 3 */}
            <div className="rounded border border-slate-200 bg-white p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-700 font-bold uppercase">Topic Saturation</span>
                <span className="text-slate-400">Hours 0-72</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                Clean Energy Grid Transition Plateau
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Initial heavy peak volume (35 posts/hr) decelerates across 72 hours as stakeholder consensus stabilizes and discussion exhausts.
              </p>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono text-[10px]">Total: 290 events</span>
                <button
                  onClick={() => launchInvestigationForTopic('Clean Energy Grid Transition')}
                  className="font-medium text-slate-900 hover:underline"
                >
                  Analyze Dossier →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Forensic Architecture Pipeline Overview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="border-b border-slate-200 pb-4 mb-8">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            End-to-End Forensic Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data flows through a standardized normalization, diagnostic, and cryptographic hashing pipeline
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="rounded border border-slate-200 bg-white p-4 space-y-1.5">
            <span className="text-[10px] uppercase text-slate-400 font-bold">Stage 1</span>
            <h4 className="font-sans font-semibold text-slate-900">Multi-Protocol Ingestion</h4>
            <p className="font-sans text-slate-600 text-[11px] leading-relaxed">
              Standardizes raw social media payloads from X, Telegram, YouTube, and CSV/JSON files into the shared <code>SocialEvent</code> schema.
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-white p-4 space-y-1.5">
            <span className="text-[10px] uppercase text-slate-400 font-bold">Stage 2</span>
            <h4 className="font-sans font-semibold text-slate-900">Transparent Classification</h4>
            <p className="font-sans text-slate-600 text-[11px] leading-relaxed">
              Evaluates lexical valence, negation modifiers, and discrete emotional vectors using open, reproducible dictionaries.
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-white p-4 space-y-1.5">
            <span className="text-[10px] uppercase text-slate-400 font-bold">Stage 3</span>
            <h4 className="font-sans font-semibold text-slate-900">Topological Cascade Graph</h4>
            <p className="font-sans text-slate-600 text-[11px] leading-relaxed">
              Links parent-child interactions, evaluates degree centrality, and maps community clustering without demographic profiling.
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-white p-4 space-y-1.5">
            <span className="text-[10px] uppercase text-slate-400 font-bold">Stage 4</span>
            <h4 className="font-sans font-semibold text-slate-900">SHA-256 Ledger & Dossiers</h4>
            <p className="font-sans text-slate-600 text-[11px] leading-relaxed">
              Recursively computes cryptographic hashes across records to provide mathematical proof against retroactive tampering.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Direct Call-to-Action to Terminal */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-lg border border-slate-200 bg-slate-900 text-white p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Ready to analyze the active intelligence feed?
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
              Access the complete 10-module intelligence suite. Filter across 1,200 events, test the cryptographic ledger,
              or import your own custom datasets.
            </p>
          </div>

          <button
            onClick={() => navigateToTerminal('overview')}
            className="rounded bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs px-5 py-3 transition-colors shrink-0 flex items-center gap-2"
          >
            <Terminal className="h-4 w-4" />
            <span>Launch Intelligence Terminal</span>
          </button>
        </div>
      </section>
    </div>
  );
};
