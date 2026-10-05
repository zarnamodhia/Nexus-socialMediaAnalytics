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
  Info,
} from 'lucide-react';

interface NavItem {
  id: NavigationPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'timeline', label: 'Timeline', icon: Activity },
  { id: 'sentiment', label: 'Sentiment & Emotion', icon: Smile },
  { id: 'trends', label: 'Trend Explorer', icon: TrendingUp },
  { id: 'audience', label: 'Audience Intelligence', icon: Users },
  { id: 'network', label: 'Network Graph', icon: Share2 },
  { id: 'investigation', label: 'Narrative Investigation', icon: FolderKanban },
  { id: 'evidence', label: 'Evidence & Provenance', icon: ShieldCheck },
  { id: 'sources', label: 'Data Sources', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<{
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}> = ({ isOpenMobile, onCloseMobile }) => {
  const { activePage, setActivePage, investigations, integrityResult } = useData();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 w-60 border-r border-slate-200 bg-white flex flex-col justify-between transition-transform duration-150 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
          <div className="px-2.5 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">
            Intelligence Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  onCloseMobile();
                }}
                className={`group flex w-full items-center justify-between rounded px-2.5 py-2 text-xs transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.id === 'investigation' && (
                  <span className="ml-2 font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                    {investigations.length}
                  </span>
                )}

                {item.id === 'evidence' && integrityResult && !integrityResult.isValid && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-rose-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Responsible Analysis Note */}
        <div className="border-t border-slate-200 p-3 bg-slate-50/60">
          <div className="rounded border border-slate-200 bg-white p-2.5 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <Info className="h-3 w-3 text-slate-500 shrink-0" />
              <span>SIH Problem #26152</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500">
              Deterministic analytical pipeline. Pseudonymous actor identities with SHA-256 evidence chain.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
