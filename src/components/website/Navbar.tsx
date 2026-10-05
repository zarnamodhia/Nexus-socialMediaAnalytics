import React from 'react';
import { useData } from '../../context/DataContext';
import { SiteSection } from '../../types';
import { ShieldCheck, ArrowRight, Terminal } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { siteSection, setSiteSection, navigateToTerminal, events, integrityResult } = useData();

  const navLinks: Array<{ id: SiteSection; label: string }> = [
    { id: 'home', label: 'Platform' },
    { id: 'terminal', label: 'Live Terminal' },
    { id: 'methodology', label: 'Methodology' },
    { id: 'case-studies', label: 'Case Studies' },
    { id: 'api-docs', label: 'API & Ingestion' },
    { id: 'about', label: 'Problem Brief' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSiteSection('home')}
            className="flex items-center gap-2 text-left"
          >
            <span className="text-base font-bold tracking-tight text-slate-900 font-sans">
              NEXUS
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 font-normal">|</span>
            <span className="hidden sm:inline text-xs text-slate-500 font-normal">
              Social Narrative Intelligence
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single line, restrained text) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          {navLinks.map((link) => {
            const isActive = siteSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setSiteSection(link.id)}
                className={`transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-slate-950 font-semibold'
                    : 'hover:text-slate-950'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigateToTerminal('evidence')}
            title="Verify Cryptographic Chain Integrity"
            className="hidden lg:flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ShieldCheck
              className={`h-3.5 w-3.5 ${
                integrityResult && !integrityResult.isValid ? 'text-rose-600' : 'text-slate-500'
              }`}
            />
            <span className="font-mono text-[11px]">Ledger</span>
          </button>

          <button
            onClick={() => navigateToTerminal('overview')}
            className="flex items-center gap-1.5 rounded bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-white transition-colors whitespace-nowrap shadow-xs"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Launch Terminal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
