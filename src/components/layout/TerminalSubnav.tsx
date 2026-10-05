import React from 'react';
import { useData } from '../../context/DataContext';
import { NavigationPage } from '../../types';
import {
  LayoutDashboard,
  Activity,
  Smile,
  TrendingUp,
  Users,
  Share2,
  FolderKanban,
  ShieldCheck,
  Database,
  Settings,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

interface TerminalTab {
  id: NavigationPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const TerminalSubnav: React.FC = () => {
  const {
    activePage,
    setActivePage,
    setSiteSection,
    investigations,
    integrityResult,
    dataSourceMode,
    filteredEvents,
    events,
  } = useData();

  const isLedgerVerified = integrityResult?.isValid ?? true;

  const TABS: TerminalTab[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'sentiment', label: 'Sentiment & Emotion', icon: Smile },
    { id: 'trends', label: 'Trend Explorer', icon: TrendingUp },
    { id: 'audience', label: 'Audience Intelligence', icon: Users },
    { id: 'network', label: 'Network Graph', icon: Share2 },
    {
      id: 'investigation',
      label: 'Investigations',
      icon: FolderKanban,
      badge: investigations.length,
    },
    {
      id: 'evidence',
      label: 'Evidence Ledger',
      icon: ShieldCheck,
      badge: isLedgerVerified ? 'Verified' : 'Alert',
    },
    {
      id: 'sources',
      label: 'Data Sources',
      icon: Database,
      badge: dataSourceMode,
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const currentTab = TABS.find((t) => t.id === activePage);

  return (
    <div className="border-b border-slate-200 bg-white shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Breadcrumb & Metadata line */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-sans">
            <button
              onClick={() => {
                setSiteSection('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-950 font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Website Home</span>
            </button>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="text-slate-500">Live Terminal</span>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="text-slate-900 font-semibold">{currentTab?.label || 'Overview'}</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
            <span className="hidden sm:inline">Active Scope:</span>
            <span className="font-semibold text-slate-900 tabular-nums">
              {filteredEvents.length.toLocaleString()} of {events.length.toLocaleString()} events
            </span>
          </div>
        </div>

        {/* Horizontal Scrollable Module Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActivePage(tab.id);
                }}
                className={`flex items-center gap-2 whitespace-nowrap rounded px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>

                {tab.badge !== undefined && (
                  <span
                    className={`ml-0.5 rounded px-1.5 py-0.2 text-[10px] font-mono leading-none ${
                      isActive
                        ? 'bg-slate-800 text-slate-200'
                        : tab.badge === 'Alert'
                        ? 'bg-rose-100 text-rose-700 font-bold'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
