import React from 'react';
import { useData } from '../../context/DataContext';
import { NavigationPage, SiteSection } from '../../types';
import { ShieldCheck, Database, Terminal, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setSiteSection, navigateToTerminal } = useData();

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-slate-200">
          {/* Brand & Overview Column */}
          <div className="md:col-span-2 space-y-3 pr-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight font-sans">
                NEXUS
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-500 font-medium">
                Social Narrative Intelligence
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              An empirical social media intelligence and narrative analysis platform developed for SIH Problem Statement 26152.
              Engineered for researchers, analysts, and public interest watchdogs to track narrative velocity, sentiment shifts,
              and cross-platform propagation with cryptographic SHA-256 evidence integrity.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-400">
              Deterministic Ingest · 1,200 Seeded Events · FIPS 180-4 Verified
            </div>
          </div>

          {/* Terminal Modules */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-900 font-mono text-[11px] uppercase tracking-wider">
              Terminal Suite
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {(
                [
                  ['overview', 'Executive Overview'],
                  ['timeline', 'Temporal Dynamics'],
                  ['sentiment', 'Sentiment & Emotion'],
                  ['trends', 'Trend Explorer'],
                  ['audience', 'Audience Intelligence'],
                  ['network', 'Network Graph'],
                  ['investigation', 'Narrative Dossiers'],
                  ['evidence', 'Cryptographic Ledger'],
                ] as Array<[NavigationPage, string]>
              ).map(([pageId, label]) => (
                <li key={pageId}>
                  <button
                    onClick={() => navigateToTerminal(pageId)}
                    className="hover:text-slate-900 transition-colors text-left"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Forensic Methodology */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-900 font-mono text-[11px] uppercase tracking-wider">
              Forensic Methods
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => setSiteSection('methodology')}
                  className="hover:text-slate-900 transition-colors text-left"
                >
                  Lexical Valence Scoring
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSiteSection('methodology')}
                  className="hover:text-slate-900 transition-colors text-left"
                >
                  Trend Acceleration Score
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSiteSection('methodology')}
                  className="hover:text-slate-900 transition-colors text-left"
                >
                  SHA-256 Provenance Chain
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSiteSection('methodology')}
                  className="hover:text-slate-900 transition-colors text-left"
                >
                  Graph Centrality Metrics
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSiteSection('methodology')}
                  className="hover:text-slate-900 transition-colors text-left"
                >
                  Non-Causality Principle
                </button>
              </li>
            </ul>
          </div>

          {/* Research & Platform */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-900 font-mono text-[11px] uppercase tracking-wider">
              Platform & Standards
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => setSiteSection('case-studies')}
                  className="hover:text-slate-900 transition-colors text-left"
                >
                  Synthetic Audio Outbreak
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSiteSection('case-studies')}
                  className="hover:text-slate-900 transition-colors text-left"
                >
                  AV Perception Inversion
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSiteSection('api-docs')}
                  className="hover:text-slate-900 transition-colors text-left"
                >
                  SocialEvent Schema
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSiteSection('about')}
                  className="hover:text-slate-900 transition-colors text-left"
                >
                  SIH Problem 26152 Brief
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} NEXUS Platform. Built for SIH Problem Statement 26152. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>SHA-256 Integrity Verified</span>
            <span>·</span>
            <span>Zero Demographic Profiling</span>
            <span>·</span>
            <span>Production Grade</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
