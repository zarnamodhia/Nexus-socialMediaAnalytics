import React from 'react';
import { useData } from '../../context/DataContext';
import { ShieldCheck, Plus, Database } from 'lucide-react';
import { NavigationPage } from '../../types';

const PAGE_NAMES: Record<NavigationPage, string> = {
  overview: 'Executive Overview',
  timeline: 'Temporal Narrative Dynamics',
  sentiment: 'Sentiment & Emotion Diagnostics',
  trends: 'Emergent Trend Explorer',
  audience: 'Audience & Community Clusters',
  network: 'Cross-Platform Network Topology',
  investigation: 'Narrative Investigation Dossiers',
  evidence: 'Cryptographic Evidence & Provenance',
  sources: 'Data Sources & Stream Ingestion',
  settings: 'System Configuration & Disclosures',
};

export const Header: React.FC = () => {
  const {
    activePage,
    setActivePage,
    dataSourceMode,
    filteredEvents,
    events,
    setCurrentInvestigationId,
  } = useData();

  const handleNewInvestigation = () => {
    setCurrentInvestigationId(null);
    setActivePage('investigation');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      {/* Zone 1: Brand Wordmark (Clean, restrained text element) */}
      <div className="flex items-center gap-3">
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            setActivePage('overview');
          }}
          className="flex items-center gap-2 hover:opacity-85 transition-opacity"
        >
          <span className="font-bold tracking-tight text-slate-900 text-sm">NEXUS</span>
          <span className="text-slate-300 font-normal">|</span>
          <span className="hidden sm:inline text-xs text-slate-500 font-normal">
            Social Narrative Intelligence
          </span>
        </a>

        <span className="hidden md:inline text-slate-300">/</span>
        <span className="hidden md:inline text-xs font-medium text-slate-600">
          {PAGE_NAMES[activePage]}
        </span>
      </div>

      {/* Zone 2: Navigation Breadcrumb & Status */}
      <div className="flex items-center gap-4 text-xs">
        <div className="hidden lg:flex items-center gap-2 text-slate-500 font-mono text-[11px]">
          <span>Ingested Records:</span>
          <span className="text-slate-900 font-medium tabular-nums">
            {filteredEvents.length.toLocaleString()} / {events.length.toLocaleString()}
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Database className="h-3 w-3 text-slate-400" />
            {dataSourceMode} STREAM
          </span>
        </div>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActivePage('evidence')}
          title="Verify Cryptographic Chain Integrity"
          className="hidden sm:flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
          <span>SHA-256 Ledger</span>
        </button>

        <button
          onClick={handleNewInvestigation}
          className="flex items-center gap-1.5 rounded bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-white transition-colors whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Investigation</span>
        </button>
      </div>
    </header>
  );
};
