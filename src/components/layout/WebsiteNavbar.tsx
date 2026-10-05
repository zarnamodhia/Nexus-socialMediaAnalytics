import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import {
  Database,
  Plus,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Share2,
  FileText,
  Sliders,
  Sparkles,
  BookOpen,
  Code,
  Layers,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  badge?: string | number;
}

const PRIMARY_NAV: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/content', label: 'Content' },
  { path: '/audience', label: 'Audience' },
  { path: '/insights', label: 'Insights' },
  { path: '/reports', label: 'Reports' },
  { path: '/network', label: 'Network' },
];

const SECONDARY_NAV: { path: string; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { path: '/evidence', label: 'Evidence Ledger', desc: 'SHA-256 cryptographic provenance & audit chain', icon: ShieldCheck },
  { path: '/sources', label: 'Data Sources & Ingest', desc: 'CSV, JSON upload & platform stream feeds', icon: Database },
  { path: '/case-studies', label: 'Investigative Case Studies', desc: 'Documented narrative contagion breakdowns', icon: FileText },
  { path: '/methodology', label: 'Mathematical Proofs', desc: 'Volume velocity, entropy & sentiment formulas', icon: BookOpen },
  { path: '/api-docs', label: 'API & Ingestion Schema', desc: 'REST endpoints and data normalization spec', icon: Code },
  { path: '/settings', label: 'Settings & Disclosures', desc: 'Environment variables & database config', icon: Sliders },
];

export const WebsiteNavbar: React.FC = () => {
  const {
    events,
    databaseStatus,
    setIsDatabaseModalOpen,
    setCurrentInvestigationId,
  } = useData();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  }, [location.pathname]);

  const handleNewReport = () => {
    setCurrentInvestigationId(null);
    navigate('/reports');
  };

  const isMoreActive = SECONDARY_NAV.some((item) => location.pathname === item.path);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          
          {/* ZONE 1: BRAND LOGO & TAGLINE */}
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 group text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-950 font-sans">
                  NEXUS
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-500 border border-slate-200 px-1.5 py-0.2 rounded bg-slate-50">
                  Analytics
                </span>
                <span className="relative flex h-2 w-2" title="Live ingest active">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </Link>

            {/* ZONE 2: PRIMARY NAVIGATION LINKS */}
            <div className="hidden lg:flex items-center gap-1">
              {PRIMARY_NAV.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-xs font-medium transition-colors relative ${
                      isActive
                        ? 'text-slate-950 font-semibold after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-[2px] after:bg-slate-950'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              {/* 'More' Structured Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-md flex items-center gap-1 ${
                    isMoreActive
                      ? 'text-slate-950 font-semibold bg-slate-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>More</span>
                  <ChevronDown
                    className={`h-3 w-3 text-slate-400 transition-transform duration-150 ${
                      moreDropdownOpen ? 'rotate-180 text-slate-700' : ''
                    }`}
                  />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      System & Intelligence Tools
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {SECONDARY_NAV.map((sub) => {
                        const Icon = sub.icon;
                        const isActive = location.pathname === sub.path;
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={`flex items-start gap-2.5 p-2 rounded-md transition-colors ${
                              isActive
                                ? 'bg-slate-100 text-slate-950'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                            }`}
                          >
                            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                            <div className="flex flex-col text-left">
                              <span className="text-xs font-medium leading-snug">{sub.label}</span>
                              <span className="text-[11px] text-slate-500 leading-tight">{sub.desc}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ZONE 3: UTILITY & ACTION BUTTONS */}
          <div className="flex items-center gap-2.5">
            {/* Database / Supabase Connection Indicator */}
            <button
              type="button"
              onClick={() => setIsDatabaseModalOpen(true)}
              title="Configure live Supabase PostgreSQL connection"
              className="flex items-center gap-1.5 text-xs font-mono border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              <Database className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-semibold text-slate-800 text-[11px]">
                {databaseStatus?.status === 'connected' ? 'SUPABASE LIVE' : 'SUPABASE + PRISMA'}
              </span>
              <span className="hidden md:inline text-slate-300">·</span>
              <span className="hidden md:inline tabular-nums text-slate-600 text-[11px]">
                {events.length.toLocaleString()} events
              </span>
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleNewReport}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-1.5 transition-colors shadow-xs active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Report</span>
              <span className="sm:hidden">Report</span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-50"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 animate-in fade-in duration-150">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Primary Analytics
            </div>
            <div className="grid grid-cols-2 gap-1">
              {PRIMARY_NAV.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Tools & Investigations
            </div>
            <div className="space-y-1">
              {SECONDARY_NAV.map((sub) => {
                const Icon = sub.icon;
                const isActive = location.pathname === sub.path;
                return (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive ? 'bg-slate-100 text-slate-950 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span>{sub.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
