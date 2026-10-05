import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { ShieldCheck, Database, Terminal, ArrowUpRight } from 'lucide-react';

export const WebsiteFooter: React.FC = () => {
  const { integrityResult, events } = useData();

  const isLedgerVerified = integrityResult?.isValid ?? true;

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700">
      {/* Top Banner / Ingest Telemetry ticker */}
      <div className="border-b border-slate-100 bg-slate-50 py-3 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-900 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              NEXUS DISCOURSE SURVEILLANCE
            </span>
            <span>·</span>
            <span>{events.length.toLocaleString()} Canonical Records Ingested</span>
            <span>·</span>
            <span className="hidden sm:inline">5 Connected Platforms</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isLedgerVerified ? 'SHA-256 Provenance Verified' : 'Audit Notice'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & SIH Mandate */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-950 font-sans text-base">NEXUS</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-500 font-normal">Social Media Intelligence</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Empirical social media intelligence, transparent sentiment velocity, and cryptographic provenance
              engineered for researchers and investigative analysts.
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              SIH Problem Statement 26152: Social Media Analytics
            </div>
          </div>

          {/* Col 2: Primary Analytics Routes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Intelligence Suites
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Overview Dashboard
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Topic Trends & Velocity
                </Link>
              </li>
              <li>
                <Link to="/content" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Content & Timeline Stream
                </Link>
              </li>
              <li>
                <Link to="/audience" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Audience & Community Clusters
                </Link>
              </li>
              <li>
                <Link to="/insights" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Sentiment & Emotional Polarity
                </Link>
              </li>
              <li>
                <Link to="/reports" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Narrative Reports & Dossiers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: System Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Forensics & Ingestion
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/network" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Network Diffusion Graph
                </Link>
              </li>
              <li>
                <Link to="/evidence" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Cryptographic Evidence Ledger
                </Link>
              </li>
              <li>
                <Link to="/sources" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Data Ingestion & CSV Upload
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Settings & Supabase Config
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Research */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Research & Docs
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/case-studies" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Investigative Case Studies
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Mathematical Methodology
                </Link>
              </li>
              <li>
                <Link to="/api-docs" className="text-slate-600 hover:text-slate-950 transition-colors">
                  API & Ingestion Schemas
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-600 hover:text-slate-950 transition-colors">
                  About SIH 26152 Initiative
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} NEXUS Platform. Designed for SIH Problem Statement 26152.
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Deterministic Model</span>
            <span>·</span>
            <span>Privacy Compliant</span>
            <span>·</span>
            <span>FIPS 180-4 SHA-256</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
