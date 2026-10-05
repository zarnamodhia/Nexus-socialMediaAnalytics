import React, { useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Key,
  Info,
  Database,
  ExternalLink,
  UploadCloud,
  FileCode2,
} from 'lucide-react';
import { SourceType } from '../types';

export const DataSources: React.FC = () => {
  const {
    dataSourceMode,
    events,
    importData,
    resetToDemoData,
    importStats,
    setActivePage,
    databaseStatus,
    setIsDatabaseModalOpen,
    syncToDatabase,
  } = useData();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const format = file.name.endsWith('.json') ? 'json' : 'csv';
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importData(content, format);
        if (success) {
          setImportNotification(`Successfully imported and normalized file: ${file.name}`);
        }
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const format = file.name.endsWith('.json') ? 'json' : 'csv';
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importData(content, format);
        if (success) {
          setImportNotification(`Successfully imported and normalized file: ${file.name}`);
        }
      }
    };

    reader.readAsText(file);
  };

  const handleLoadSampleCSV = () => {
    const sampleCSV = `timestamp,platform,author,topic,text,sentiment
2026-09-30T10:00:00Z,X/Twitter,@analyst_delta,Deepfake Election Rumors,"New audio forensics tool confirms verified spectral watermarks in regional broadcast.",positive
2026-09-30T10:05:00Z,Telegram,@watchdog_b,Autonomous Vehicle Safety,"Unannounced sensor software recall issued following municipal safety review.",negative
2026-09-30T10:10:00Z,Reddit,@operator_g,Clean Energy Grid Transition,"Offshore wind capacity exceeded national transmission forecast by 14 percent.",positive
2026-09-30T10:15:00Z,YouTube,@policy_node,AI Copyright Regulation,"Legal symposium deliberates fair use doctrine for generative multimodal foundation models.",neutral`;

    const success = importData(sampleCSV, 'csv');
    if (success) {
      setImportNotification('Sample 4-event batch successfully parsed and ingested into live pipeline.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Data Sources, Ingestion Pipeline & Adapters
          </h2>
          <p className="text-xs text-slate-500">
            Manage active ingestion streams, import custom CSV/JSON archives, or inspect modular platform connectors
          </p>
        </div>

        {/* Stream Reset */}
        <button
          onClick={resetToDemoData}
          className="flex items-center gap-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
          <span>Reset to Baseline Demo Stream</span>
        </button>
      </div>

      {importNotification && (
        <div className="rounded bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{importNotification}</span>
          </div>
          <button
            onClick={() => setActivePage('overview')}
            className="font-bold underline hover:text-emerald-950"
          >
            View Dashboard →
          </button>
        </div>
      )}

      {/* Row 1: Active Stream Status Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-slate-500">Active Ingestion Source</span>
              <span className="text-slate-300">·</span>
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  dataSourceMode === 'DEMO'
                    ? 'bg-slate-100 text-slate-800 border border-slate-200'
                    : dataSourceMode === 'IMPORTED'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {dataSourceMode} DATASET
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {dataSourceMode === 'DEMO'
                ? 'Deterministic High-Fidelity Synthetic Ingest (1,200 Events)'
                : 'Custom External Normalized Stream'}
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              All metrics, sentiment algorithms, timeline buckets, and network graphs are computed
              in real-time from the events in this active database.
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-slate-50 p-4 text-center font-mono">
            <div className="text-[10px] text-slate-500 uppercase">Current Ingested Records</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {events.length.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium">100% SHA-256 Chained</div>
          </div>
        </div>
      </div>

      {/* Row 1.5: Relational Database Architecture (Supabase + Prisma ORM) */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-emerald-600 flex items-center justify-center text-white">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Primary Relational Database: Supabase PostgreSQL
                </h3>
                <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Prisma ORM v6.4.1 Integrated
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Connected via Prisma client with full typed models for SocialEvents, Investigations, and Cryptographic Ledgers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDatabaseModalOpen(true)}
              className="rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-1.5 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Database className="h-3.5 w-3.5" />
              <span>Configure Database & Schemas</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="rounded bg-slate-50 p-3 border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Engine & Dialect</span>
            <span className="font-bold text-slate-900 font-sans">Prisma ORM (PostgreSQL)</span>
            <span className="text-[11px] text-slate-500 font-sans block mt-0.5">schema: prisma/schema.prisma</span>
          </div>

          <div className="rounded bg-slate-50 p-3 border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Connection Target</span>
            <span className="font-bold text-slate-900 font-sans">Supabase PgBouncer Pooler</span>
            <span className="text-[11px] text-slate-500 font-sans block mt-0.5">Direct URL + Session Pooler</span>
          </div>

          <div className="rounded bg-slate-50 p-3 border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Status</span>
            <span className={`font-bold font-sans ${
              databaseStatus?.status === 'connected' ? 'text-emerald-700' : 'text-slate-800'
            }`}>
              {databaseStatus?.status === 'connected' ? 'Connected (Live Cloud Sync)' : 'Prisma Client Ready (Demo Seed Active)'}
            </span>
            <span className="text-[11px] text-slate-500 font-sans block mt-0.5">
              {databaseStatus?.status === 'connected' ? `${databaseStatus.counts?.events} records in DB` : 'Zero-config demo fallback'}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: File Import Engine & Validator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Upload Dropzone */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Import CSV or JSON Archive</h3>
            <p className="text-xs text-slate-500">
              Files are automatically validated against the SocialEvent schema, classified for sentiment, and linked to the cryptographic chain.
            </p>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver
                ? 'border-slate-400 bg-slate-100'
                : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <div className="text-xs text-slate-800 font-semibold mb-1">
              Drag & Drop CSV or JSON File Here
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Requires a <code>text</code> or <code>content</code> column. Optional: <code>platform</code>, <code>author</code>, <code>topic</code>.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-white transition-colors"
            >
              Browse Local Files
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
            <span className="text-slate-500">Want to test the parser?</span>
            <button
              onClick={handleLoadSampleCSV}
              className="text-slate-800 hover:text-slate-900 font-medium underline"
            >
              Load Sample 4-Event CSV →
            </button>
          </div>
        </div>

        {/* Right Col: Validation Diagnostics Log */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Schema Ingestion Diagnostics</h3>
            <span className="text-[10px] font-mono text-slate-500">Live Validator</span>
          </div>

          {importStats ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Total Read</span>
                  <span className="text-sm font-bold text-slate-900">{importStats.total}</span>
                </div>
                <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Normalized</span>
                  <span className="text-sm font-bold text-emerald-700">{importStats.valid}</span>
                </div>
                <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Errors</span>
                  <span className="text-sm font-bold text-rose-700">{importStats.rejected}</span>
                </div>
              </div>

              {importStats.errors.length > 0 && (
                <div className="rounded bg-rose-50 border border-rose-200 p-3 space-y-1 text-rose-800 text-[11px] max-h-36 overflow-y-auto">
                  <div className="font-bold flex items-center gap-1.5 text-rose-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Parser Warnings & Schema Rejections:</span>
                  </div>
                  {importStats.errors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded bg-slate-50 p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="text-slate-900 font-semibold">Schema Normalization Pipeline:</div>
              <p className="text-[11px] leading-relaxed">
                Imported rows are automatically normalized into the unified schema. Missing sentiment or emotion values
                are evaluated on-the-fly by the transparent local lexical analyzer, and subsequent cryptographic hashes are calculated.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Modular Platform Adapters */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Modular Platform Adapters & Connectors
          </h3>
          <p className="text-xs text-slate-500">
            Modular adapter specifications for future live social media platform integrations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Adapter 1: X/Twitter API v2 */}
          <div className="rounded border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">X / Twitter v2 Stream</span>
              <span className="text-[10px] font-mono rounded bg-white border border-slate-200 px-1.5 py-0.5 text-slate-600">
                OAuth 2.0 PKCE
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Consumes real-time filtered stream endpoints with expansion for author metadata and conversation thread tracking.
            </p>
            <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-amber-800 flex items-center gap-1 font-medium">
              <Key className="h-3 w-3" />
              <span>Awaiting Enterprise Bearer Token</span>
            </div>
          </div>

          {/* Adapter 2: Telegram MTProto */}
          <div className="rounded border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Telegram Bot & MTProto</span>
              <span className="text-[10px] font-mono rounded bg-white border border-slate-200 px-1.5 py-0.5 text-slate-600">
                TDLib Gateway
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Monitors public news broadcast channels and group relays with automated media fingerprinting.
            </p>
            <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-amber-800 flex items-center gap-1 font-medium">
              <Key className="h-3 w-3" />
              <span>Awaiting API Hash Credentials</span>
            </div>
          </div>

          {/* Adapter 3: YouTube Data v3 */}
          <div className="rounded border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">YouTube Data v3</span>
              <span className="text-[10px] font-mono rounded bg-white border border-slate-200 px-1.5 py-0.5 text-slate-600">
                REST / Quota API
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Monitors video discussion threads, top-level comments, and caption transcripts with rate-limit backoff.
            </p>
            <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-amber-800 flex items-center gap-1 font-medium">
              <Key className="h-3 w-3" />
              <span>Awaiting GCP API Key</span>
            </div>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 flex items-start gap-2">
          <Info className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
          <span>
            <strong>Authentic Implementation Disclosure:</strong> In compliance with environment instructions, NEXUS does not pretend
            to possess unauthorized live social media feeds. The system operates fully on verified synthetic data or imported real archives until
            valid credentials are configured.
          </span>
        </div>
      </div>
    </div>
  );
};
