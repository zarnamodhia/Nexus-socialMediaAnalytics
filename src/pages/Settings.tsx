import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Sliders,
  Database,
  Download,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const {
    events,
    resetToDemoData,
    investigations,
    maxTimestampMs,
    updateFilter,
  } = useData();

  // Local settings preferences
  const [accentTheme, setAccentTheme] = useState<string>('navy');
  const [defaultTimeWindow, setDefaultTimeWindow] = useState<string>('72h');
  const [sentimentSensitivity, setSentimentSensitivity] = useState<number>(0.15);
  const [showResetNotice, setShowResetNotice] = useState<boolean>(false);

  const handleExportFullDatabase = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_database_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    resetToDemoData();
    setShowResetNotice(true);
    setTimeout(() => setShowResetNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            System Configuration & Ethical Governance
          </h2>
          <p className="text-xs text-slate-500">
            Platform parameters, classification sensitivity thresholds, storage controls, and responsible AI disclosures
          </p>
        </div>
      </div>

      {showResetNotice && (
        <div className="rounded bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Database restored to baseline 1,200-event deterministic synthetic dataset.</span>
        </div>
      )}

      {/* Row 1: Analysis Preferences & Thresholds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analysis Preferences */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-900">Analysis Preferences</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Sentiment Neutral Deadband Threshold</span>
                <span className="font-mono text-slate-900 font-semibold">±{sentimentSensitivity}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.35"
                step="0.05"
                value={sentimentSensitivity}
                onChange={(e) => setSentimentSensitivity(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Scores between -{sentimentSensitivity} and +{sentimentSensitivity} are categorized as neutral.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="block text-slate-700 mb-1">Default Ingestion Time Range</label>
              <select
                value={defaultTimeWindow}
                onChange={(e) => {
                  setDefaultTimeWindow(e.target.value);
                  if (e.target.value === '72h') updateFilter('dateRange', null);
                  else if (e.target.value === '24h') {
                    updateFilter('dateRange', {
                      startMs: maxTimestampMs - 24 * 3600000,
                      endMs: maxTimestampMs,
                    });
                  }
                }}
                className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none"
              >
                <option value="72h">Complete 72-Hour Observation Horizon</option>
                <option value="24h">Latest 24-Hour Horizon</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="block text-slate-700 mb-1">Interface Tone Profile</label>
              <div className="flex gap-2">
                {[
                  { id: 'navy', label: 'Classic Enterprise Slate', color: 'bg-slate-800' },
                  { id: 'neutral', label: 'Monochrome Editorial', color: 'bg-slate-600' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setAccentTheme(th.id)}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] border transition-colors ${
                      accentTheme === th.id
                        ? 'border-slate-900 bg-slate-900 text-white font-medium'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${th.color}`} />
                    <span>{th.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Management & Storage Controls */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-900">Data Management & Ledger</h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            NEXUS maintains an active in-memory cryptographic hash ledger synchronized with browser storage.
          </p>

          <div className="space-y-2.5 text-xs">
            <button
              onClick={handleExportFullDatabase}
              className="w-full flex items-center justify-between rounded border border-slate-200 bg-white p-2.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div>
                <span className="font-semibold text-slate-900 block">
                  Export Active Database (.JSON)
                </span>
                <span className="text-[11px] text-slate-500">
                  Full dump of {events.length.toLocaleString()} events with SHA-256 signatures.
                </span>
              </div>
              <Download className="h-4 w-4 text-slate-600" />
            </button>

            <button
              onClick={handleReset}
              className="w-full flex items-center justify-between rounded border border-rose-200 bg-white p-2.5 hover:bg-rose-50 transition-colors text-left"
            >
              <div>
                <span className="font-semibold text-rose-700 block">
                  Reset Everything to Factory Demonstration Data
                </span>
                <span className="text-[11px] text-slate-500">
                  Restores 1,200 deterministic events and resets all altered records.
                </span>
              </div>
              <RotateCcw className="h-4 w-4 text-rose-600" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500">
            Active Investigations: {investigations.length} dossiers stored locally
          </div>
        </div>
      </div>

      {/* Row 2: Responsible Analysis, Ethics & Limitations Disclosure */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            Methodology, Responsible Analysis & Limitations Disclosure
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 font-mono text-[11px] block">
              1. Non-Causality & Correlation
            </span>
            <p className="text-slate-600 text-[11px]">
              Network topological clustering and propagation velocity reflect observed message relay timestamps.
              They do <strong>not</strong> prove coordinated orchestration, intent, or legal causality without external corroboration.
            </p>
          </div>

          <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 font-mono text-[11px] block">
              2. Privacy & Pseudonymization
            </span>
            <p className="text-slate-600 text-[11px]">
              All authors in the demonstration are pseudonymous identifiers (e.g. <code>@node_042</code>). No real personal
              information, physical coordinates, biological ages, or sensitive profiling data are generated or stored.
            </p>
          </div>

          <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 font-mono text-[11px] block">
              3. Transparent Local NLP
            </span>
            <p className="text-slate-600 text-[11px]">
              Valence and emotional categorizations are produced via documented deterministic lexical dictionaries
              with negation handling. They are presented as analytical aids rather than unassailable ground truth.
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Application Metadata */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-500">
        <div>
          <span>NEXUS — Social Narrative Intelligence Platform</span>
          <span className="mx-2">·</span>
          <span>SIH Problem Statement 26152</span>
        </div>
        <div>Engine: React 19 + TypeScript + Pure SHA-256 Ledger</div>
      </div>
    </div>
  );
};
