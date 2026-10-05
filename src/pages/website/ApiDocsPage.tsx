import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Code2,
  Database,
  Terminal,
  Copy,
  Check,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Layers,
  Radio,
} from 'lucide-react';

export const ApiDocsPage: React.FC = () => {
  const { navigateToTerminal } = useData();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const EVENT_SCHEMA_JSON = `{
  "id": "evt_7923cf2a_0042",
  "timestamp": "2026-09-29T14:32:00.000Z",
  "timestampMs": 1790692320000,
  "platform": "X/Twitter",
  "authorId": "@node_042",
  "authorCluster": "Cluster-Alpha: Tech & Policy",
  "text": "Autonomous perception fail safe verified across municipal benchmark tests.",
  "language": "en",
  "topic": "Autonomous Vehicle Safety",
  "sentiment": "positive",
  "sentimentScore": 0.74,
  "sentimentConfidence": 0.88,
  "emotion": "joy",
  "relationship": "original",
  "parentEventId": null,
  "engagement": {
    "likes": 420,
    "reposts": 88,
    "comments": 31,
    "views": 15400
  },
  "communityId": "Cluster-Alpha",
  "sourceType": "DEMO",
  "previousHash": "3f79a29e16...",
  "evidenceHash": "8b51d6c0a8..."
}`;

  const HASH_CHAIN_TS = `// FIPS 180-4 SHA-256 Recursive Chain Formulation
export function computeEventHash(
  previousHash: string,
  event: Omit<SocialEvent, 'evidenceHash'>
): string {
  const payloadString = [
    previousHash,
    event.id,
    event.timestamp,
    event.platform,
    event.authorId,
    event.topic,
    event.text,
    event.sourceType
  ].join('|');
  
  return sha256(payloadString);
}`;

  const CURL_WEBHOOK = `curl -X POST https://api.nexus-intel.internal/v1/events/ingest \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_PLATFORM_KEY" \\
  -d '{
    "platform": "Telegram",
    "topic": "Deepfake Election Rumors",
    "text": "Urgent audio release allegedly altering vote count procedures",
    "language": "en",
    "authorId": "@anon_watchdog",
    "timestamp": "2026-09-30T08:00:00Z"
  }'`;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-12 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="text-xs font-mono uppercase text-slate-500 font-medium">
          Integration & Schema Specifications
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-sans">
          Developer API & Ingestion Architecture
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          Standardized schemas, platform ingestion adapters, and cryptographic verification specifications
          powering the NEXUS narrative monitoring pipeline.
        </p>
      </div>

      {/* 1. Core Event Schema */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-slate-800" />
            <h2 className="text-lg font-bold text-slate-900">
              1. Universal SocialEvent Canonical Schema
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(EVENT_SCHEMA_JSON, 'schema')}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-950 rounded border border-slate-200 bg-white px-2.5 py-1 font-mono"
          >
            {copiedSection === 'schema' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied JSON
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy JSON Schema
              </>
            )}
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Regardless of origin (X/Twitter, Telegram, YouTube, Reddit, or file imports), all incoming payloads
          are normalized into this shared typed event structure before entering diagnostic classification and the cryptographic ledger.
        </p>

        <div className="rounded-lg border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-slate-200 overflow-x-auto shadow-xs">
          <pre>{EVENT_SCHEMA_JSON}</pre>
        </div>
      </section>

      {/* 2. Cryptographic Ledger API */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-slate-800" />
            <h2 className="text-lg font-bold text-slate-900">
              2. Cryptographic Provenance Chain Formula
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(HASH_CHAIN_TS, 'hash')}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-950 rounded border border-slate-200 bg-white px-2.5 py-1 font-mono"
          >
            {copiedSection === 'hash' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied TypeScript
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy Code
              </>
            )}
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The evidentiary integrity of each event is enforced via an unbroken SHA-256 recursive chain.
          If any record&apos;s text, author, timestamp, or score is altered post-ingest, the chain verification
          fails at the precise index of modification.
        </p>

        <div className="rounded-lg border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-emerald-300 overflow-x-auto shadow-xs">
          <pre>{HASH_CHAIN_TS}</pre>
        </div>
      </section>

      {/* 3. Ingestion Endpoints & Adapters */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-slate-800" />
            <h2 className="text-lg font-bold text-slate-900">
              3. Platform Adapters & Webhook Specification
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(CURL_WEBHOOK, 'curl')}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-950 rounded border border-slate-200 bg-white px-2.5 py-1 font-mono"
          >
            {copiedSection === 'curl' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied cURL
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy cURL
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded border border-slate-200 bg-white p-4 space-y-2">
            <div className="font-mono text-xs font-bold text-slate-900">X / Twitter Adapter</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Ingests v2 filtered stream endpoints, extracting text, reply-to annotations, and engagement counters.
            </p>
            <div className="font-mono text-[10px] text-slate-400">Endpoint: /v1/adapters/twitter/webhook</div>
          </div>

          <div className="rounded border border-slate-200 bg-white p-4 space-y-2">
            <div className="font-mono text-xs font-bold text-slate-900">Telegram Channel Adapter</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Listens to public broadcast channel forwards, cross-posts, and audio attachments using the MTProto spec.
            </p>
            <div className="font-mono text-[10px] text-slate-400">Endpoint: /v1/adapters/telegram/channel</div>
          </div>

          <div className="rounded border border-slate-200 bg-white p-4 space-y-2">
            <div className="font-mono text-xs font-bold text-slate-900">YouTube Comment Adapter</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Extracts top-level comments and commentThreads across monitored video URLs using Google API v3 specs.
            </p>
            <div className="font-mono text-[10px] text-slate-400">Endpoint: /v1/adapters/youtube/comments</div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-sky-300 overflow-x-auto shadow-xs">
          <pre>{CURL_WEBHOOK}</pre>
        </div>
      </section>

      {/* 4. Action Banner */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Test Ingestion with Your Own Data</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Use the built-in Data Sources module to drop CSV or JSON files and run schema validation live.
          </p>
        </div>
        <button
          onClick={() => navigateToTerminal('sources')}
          className="rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Database className="h-3.5 w-3.5" />
          <span>Open Data Sources Ingestion →</span>
        </button>
      </div>
    </div>
  );
};
