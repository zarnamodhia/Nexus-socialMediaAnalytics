import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  UploadCloud,
  FileCode2,
  ExternalLink,
  Server,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export const DatabaseConfigModal: React.FC = () => {
  const {
    isDatabaseModalOpen,
    setIsDatabaseModalOpen,
    databaseStatus,
    checkDatabaseStatus,
    syncToDatabase,
    events,
    investigations,
  } = useData();

  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'sql' | 'guide'>('status');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  const [dbUrlInput, setDbUrlInput] = useState('');
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('https://pcofinfoogzsqdpicgxs.supabase.co');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);

  if (!isDatabaseModalOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnectError(null);
    setConnectSuccess(null);

    try {
      const res = await fetch('/api/database/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseUrl: dbUrlInput.trim(),
          supabaseUrl: supabaseUrlInput.trim(),
          supabaseAnonKey: supabaseKeyInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.status === 'connected') {
        setConnectSuccess('Connected to Supabase PostgreSQL via Prisma ORM!');
        await checkDatabaseStatus();
      } else {
        setConnectError(data.error || 'Failed to connect to Supabase database. Please check your credentials.');
      }
    } catch (err: any) {
      setConnectError(err?.message || 'Network error connecting to backend.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncToDatabase();
      if (res.success) {
        setSyncResult({
          success: true,
          message: `Successfully synchronized ${res.count || events.length} canonical records to Supabase via Prisma ORM.`,
        });
      } else {
        setSyncResult({
          success: false,
          message: res.error || 'Failed to sync to database.',
        });
      }
    } catch (e: any) {
      setSyncResult({
        success: false,
        message: e?.message || 'Unexpected sync error',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const PRISMA_SCHEMA_CODE = `// prisma/schema.prisma
// Integrated with Supabase PostgreSQL via Prisma ORM v6.4.1

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model SocialEvent {
  id                  String   @id
  timestamp           DateTime
  timestampMs         Float
  platform            String
  authorId            String
  authorCluster       String
  text                String
  language            String
  topic               String
  sentiment           String   // positive, neutral, negative
  sentimentScore      Float
  sentimentConfidence Float
  emotion             String   // joy, anger, fear, sadness, surprise, neutral
  relationship        String   // original, reply, repost
  parentEventId       String?
  likes               Int      @default(0)
  reposts             Int      @default(0)
  comments            Int      @default(0)
  views               Int      @default(0)
  communityId         String
  sourceType          String   @default("DEMO")
  evidenceHash        String
  previousHash        String
  tampered            Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([topic])
  @@index([platform])
  @@index([sentiment])
  @@index([timestampMs])
}

model Investigation {
  id                   String   @id
  title                String
  topic                String
  keywords             String[]
  startMs              Float
  endMs                Float
  splitTimestampMs     Float
  observedFacts        String[]
  modelInterpretations String[]
  hypotheses           String[]
  evidenceIds          String[]
  dominantSentiment    String
  peakEmotion          String
  topPlatform          String
  primaryCommunity     String
  viralityRatio        Float
  totalEvents          Int
  analystNotes         String   @default("")
  status               String   @default("active")
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}`;

  const SUPABASE_SQL_DDL = `-- Supabase PostgreSQL Migration Script for NEXUS
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

CREATE TABLE IF NOT EXISTS "SocialEvent" (
  "id" TEXT PRIMARY KEY,
  "timestamp" TIMESTAMPTZ NOT NULL,
  "timestampMs" DOUBLE PRECISION NOT NULL,
  "platform" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "authorCluster" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "sentiment" TEXT NOT NULL,
  "sentimentScore" DOUBLE PRECISION NOT NULL,
  "sentimentConfidence" DOUBLE PRECISION NOT NULL,
  "emotion" TEXT NOT NULL,
  "relationship" TEXT NOT NULL,
  "parentEventId" TEXT,
  "likes" INTEGER NOT NULL DEFAULT 0,
  "reposts" INTEGER NOT NULL DEFAULT 0,
  "comments" INTEGER NOT NULL DEFAULT 0,
  "views" INTEGER NOT NULL DEFAULT 0,
  "communityId" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL DEFAULT 'DEMO',
  "evidenceHash" TEXT NOT NULL,
  "previousHash" TEXT NOT NULL,
  "tampered" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_social_event_topic" ON "SocialEvent"("topic");
CREATE INDEX IF NOT EXISTS "idx_social_event_platform" ON "SocialEvent"("platform");
CREATE INDEX IF NOT EXISTS "idx_social_event_sentiment" ON "SocialEvent"("sentiment");
CREATE INDEX IF NOT EXISTS "idx_social_event_timestamp_ms" ON "SocialEvent"("timestampMs");

CREATE TABLE IF NOT EXISTS "Investigation" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "keywords" TEXT[] NOT NULL DEFAULT '{}',
  "startMs" DOUBLE PRECISION NOT NULL,
  "endMs" DOUBLE PRECISION NOT NULL,
  "splitTimestampMs" DOUBLE PRECISION NOT NULL,
  "observedFacts" TEXT[] NOT NULL DEFAULT '{}',
  "modelInterpretations" TEXT[] NOT NULL DEFAULT '{}',
  "hypotheses" TEXT[] NOT NULL DEFAULT '{}',
  "evidenceIds" TEXT[] NOT NULL DEFAULT '{}',
  "dominantSentiment" TEXT NOT NULL,
  "peakEmotion" TEXT NOT NULL,
  "topPlatform" TEXT NOT NULL,
  "primaryCommunity" TEXT NOT NULL,
  "viralityRatio" DOUBLE PRECISION NOT NULL,
  "totalEvents" INTEGER NOT NULL,
  "analystNotes" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-950 font-sans">
                  Database & Storage Architecture
                </h3>
                <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Supabase + Prisma
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Relational PostgreSQL persistence via Prisma ORM v6.4.1
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDatabaseModalOpen(false)}
            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-200 bg-white px-6 gap-2 pt-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-slate-900 text-slate-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Connection Status
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-slate-900 text-slate-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Prisma Schema
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-slate-900 text-slate-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Supabase SQL DDL
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'guide'
                ? 'border-slate-900 text-slate-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Configuration Guide
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div
                className={`rounded-lg border p-4 flex items-start justify-between gap-4 ${
                  databaseStatus?.status === 'connected'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                    : 'border-amber-200 bg-amber-50 text-amber-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  {databaseStatus?.status === 'connected' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold">
                      {databaseStatus?.status === 'connected'
                        ? 'Connected to Supabase PostgreSQL via Prisma'
                        : 'Operating in High-Performance Local / Seed Mode'}
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed text-slate-700">
                      {databaseStatus?.status === 'connected'
                        ? `Live connection verified. Records stored in Supabase: ${databaseStatus.counts?.events.toLocaleString()} events, ${databaseStatus.counts?.investigations} investigations.`
                        : 'Prisma ORM is integrated and configured. When DATABASE_URL is added to your environment secrets, NEXUS automatically connects and switches to live cloud persistence.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => checkDatabaseStatus()}
                  className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Check Status</span>
                </button>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="rounded border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">ORM Engine</div>
                  <div className="font-bold text-slate-900 font-sans text-sm">Prisma ORM v6.4.1</div>
                  <div className="text-[11px] text-slate-500 font-sans">Type-safe PostgreSQL Client & Migrations</div>
                </div>

                <div className="rounded border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Database Backend</div>
                  <div className="font-bold text-slate-900 font-sans text-sm">Supabase PostgreSQL</div>
                  <div className="text-[11px] text-slate-500 font-sans">PgBouncer Pooler & Direct Connection</div>
                </div>

                <div className="rounded border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Local Canonical Dataset</div>
                  <div className="font-bold text-slate-900 font-sans text-sm">{events.length.toLocaleString()} Events</div>
                  <div className="text-[11px] text-slate-500 font-sans">72h Narrative Inflection Benchmark</div>
                </div>

                <div className="rounded border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Investigation Dossiers</div>
                  <div className="font-bold text-slate-900 font-sans text-sm">{investigations.length} Active Dossiers</div>
                  <div className="text-[11px] text-slate-500 font-sans">Synchronized with Database Models</div>
                </div>
              </div>

              {/* Supabase Quick Connect Form */}
              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Connect Supabase Project</span>
                      <a
                        href="https://supabase.com/dashboard/projects"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-700 hover:underline font-normal inline-flex items-center gap-1"
                      >
                        <span>Open Supabase Console</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Paste your Supabase database URI or connection parameters to establish immediate live PostgreSQL sync with Prisma.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleConnect} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-slate-600 mb-1">
                      DATABASE_URL (Supabase Connection Pooler or Direct URI)
                    </label>
                    <input
                      type="text"
                      value={dbUrlInput}
                      onChange={(e) => setDbUrlInput(e.target.value)}
                      placeholder="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
                      className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      From your Supabase Project Settings → Database → Connection string (URI).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono font-semibold uppercase text-slate-600 mb-1">
                        SUPABASE_URL (Optional API URL)
                      </label>
                      <input
                        type="text"
                        value={supabaseUrlInput}
                        onChange={(e) => setSupabaseUrlInput(e.target.value)}
                        placeholder="https://[project-ref].supabase.co"
                        className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-semibold uppercase text-slate-600 mb-1">
                        SUPABASE_ANON_KEY (Optional Public Key)
                      </label>
                      <input
                        type="password"
                        value={supabaseKeyInput}
                        onChange={(e) => setSupabaseKeyInput(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="submit"
                      disabled={isConnecting || (!dbUrlInput.trim() && !supabaseKeyInput.trim())}
                      className="rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
                      <span>{isConnecting ? 'Connecting & Verifying...' : 'Connect to Supabase'}</span>
                    </button>

                    <span className="text-[11px] text-slate-400">
                      Credentials are kept securely in runtime memory
                    </span>
                  </div>

                  {connectSuccess && (
                    <div className="rounded bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{connectSuccess}</span>
                    </div>
                  )}

                  {connectError && (
                    <div className="rounded bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>{connectError}</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Action Buttons */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      Synchronize Canonical Dataset to Supabase
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Upserts all {events.length.toLocaleString()} benchmark events and investigations into Supabase PostgreSQL.
                    </p>
                  </div>

                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs px-3.5 py-2 transition-colors shadow-xs"
                  >
                    <UploadCloud className={`h-3.5 w-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                    <span>{isSyncing ? 'Synchronizing...' : 'Sync to Supabase'}</span>
                  </button>
                </div>

                {syncResult && (
                  <div
                    className={`rounded p-2.5 text-xs flex items-center gap-2 ${
                      syncResult.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {syncResult.success ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{syncResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">prisma/schema.prisma</h4>
                  <p className="text-[11px] text-slate-500">Defined models and relational indexes</p>
                </div>
                <button
                  onClick={() => copyToClipboard(PRISMA_SCHEMA_CODE, 'prisma')}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-950 rounded border border-slate-200 bg-white px-2.5 py-1 font-mono"
                >
                  {copiedSection === 'prisma' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Schema
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-96">
                <pre>{PRISMA_SCHEMA_CODE}</pre>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Supabase SQL Editor Script</h4>
                  <p className="text-[11px] text-slate-500">Run directly in Supabase Dashboard SQL Editor</p>
                </div>
                <button
                  onClick={() => copyToClipboard(SUPABASE_SQL_DDL, 'sql')}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-950 rounded border border-slate-200 bg-white px-2.5 py-1 font-mono"
                >
                  {copiedSection === 'sql' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied SQL
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy SQL
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-emerald-300 overflow-x-auto max-h-96">
                <pre>{SUPABASE_SQL_DDL}</pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">How to Connect Your Supabase Project</h4>
                
                <ol className="list-decimal list-inside space-y-2 text-slate-600">
                  <li>
                    Log in to your <strong>Supabase Dashboard</strong> and open your project (or create a new free project at{' '}
                    <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-medium">
                      supabase.com
                    </a>
                    ).
                  </li>
                  <li>
                    Go to <strong>Project Settings → Database → Connection String</strong>.
                  </li>
                  <li>
                    Select the <strong>URI</strong> tab and copy the connection string:
                    <div className="mt-1 p-2 rounded bg-slate-900 text-slate-200 font-mono text-[11px]">
                      postgresql://postgres.[project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
                    </div>
                  </li>
                  <li>
                    Set this as <code>DATABASE_URL</code> in your environment secrets or <code>.env</code> file.
                  </li>
                  <li>
                    Optionally set <code>DIRECT_URL</code> pointing to port <code>5432</code> for running direct migrations.
                  </li>
                  <li>
                    Run <strong>Sync to Supabase</strong> above to populate the tables with all 1,200 events and investigations!
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Prisma Client v6.4.1 Generated</span>
          </div>

          <button
            onClick={() => setIsDatabaseModalOpen(false)}
            className="rounded bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-1.5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
