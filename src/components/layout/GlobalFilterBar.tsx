import React from 'react';
import { useData } from '../../context/DataContext';
import {
  Search,
  RotateCcw,
  X,
  Calendar,
  Layers,
  Activity,
} from 'lucide-react';
import { Platform, SentimentLabel } from '../../types';

const PLATFORM_LIST: { id: Platform; label: string; short: string }[] = [
  { id: 'X/Twitter', label: 'X/Twitter', short: 'X' },
  { id: 'Telegram', label: 'Telegram', short: 'TG' },
  { id: 'YouTube', label: 'YouTube', short: 'YT' },
  { id: 'Reddit', label: 'Reddit', short: 'RD' },
  { id: 'Bluesky', label: 'Bluesky', short: 'BS' },
];

export const GlobalFilterBar: React.FC = () => {
  const {
    filters,
    updateFilter,
    resetFilters,
    activeFilterCount,
    filteredEvents,
    events,
    minTimestampMs,
    maxTimestampMs,
  } = useData();

  // Time window presets based on 72-hour synthetic scenario
  const handlePresetWindow = (preset: 'all' | 'day1' | 'av_crisis' | 'deepfake_spike') => {
    if (preset === 'all') {
      updateFilter('dateRange', null);
      return;
    }

    const span = maxTimestampMs - minTimestampMs;
    const hourMs = span / 72;

    if (preset === 'day1') {
      updateFilter('dateRange', {
        startMs: minTimestampMs,
        endMs: minTimestampMs + 24 * hourMs,
      });
    } else if (preset === 'av_crisis') {
      updateFilter('dateRange', {
        startMs: minTimestampMs + 36 * hourMs,
        endMs: minTimestampMs + 48 * hourMs,
      });
    } else if (preset === 'deepfake_spike') {
      updateFilter('dateRange', {
        startMs: minTimestampMs + 48 * hourMs,
        endMs: maxTimestampMs,
      });
    }
  };

  const togglePlatform = (p: Platform) => {
    const active = filters.platforms.includes(p);
    if (active) {
      updateFilter(
        'platforms',
        filters.platforms.filter((item) => item !== p)
      );
    } else {
      updateFilter('platforms', [...filters.platforms, p]);
    }
  };

  const toggleSentiment = (s: SentimentLabel) => {
    const active = filters.sentiments.includes(s);
    if (active) {
      updateFilter(
        'sentiments',
        filters.sentiments.filter((item) => item !== s)
      );
    } else {
      updateFilter('sentiments', [...filters.sentiments, s]);
    }
  };

  // Determine current active preset
  const isAllTime = filters.dateRange === null;

  return (
    <div className="w-full px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* LEFT GROUP: Search & Quick Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          
          {/* Keyword Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              placeholder="Filter topics, authors, or text..."
              className="w-full rounded-md border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none transition-colors"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => updateFilter('searchQuery', '')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Time Window Presets */}
          <div className="flex items-center rounded-md border border-slate-200 bg-slate-100/80 p-0.5 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => handlePresetWindow('all')}
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                isAllTime
                  ? 'bg-white text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              72h All
            </button>
            <button
              type="button"
              onClick={() => handlePresetWindow('day1')}
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                filters.dateRange && !isAllTime && filters.dateRange.endMs < minTimestampMs + (maxTimestampMs - minTimestampMs) * 0.4
                  ? 'bg-white text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Baseline
            </button>
            <button
              type="button"
              onClick={() => handlePresetWindow('av_crisis')}
              className="px-2 py-1 rounded transition-colors text-slate-600 hover:text-slate-900 whitespace-nowrap"
            >
              Crash Inversion
            </button>
            <button
              type="button"
              onClick={() => handlePresetWindow('deepfake_spike')}
              className="px-2 py-1 rounded transition-colors text-slate-600 hover:text-slate-900 whitespace-nowrap"
            >
              Deepfake Surge
            </button>
          </div>

          {/* Platform Segmented Toggles */}
          <div className="hidden md:flex items-center rounded-md border border-slate-200 bg-slate-100/80 p-0.5 font-mono text-[11px]">
            {PLATFORM_LIST.map((p) => {
              const isActive = filters.platforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  title={p.label}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.short}
                </button>
              );
            })}
          </div>

          {/* Sentiment Polarity Toggles */}
          <div className="hidden lg:flex items-center gap-1">
            {(['positive', 'neutral', 'negative'] as SentimentLabel[]).map((sent) => {
              const isActive = filters.sentiments.includes(sent);
              const colorDot =
                sent === 'positive'
                  ? 'bg-emerald-500'
                  : sent === 'negative'
                  ? 'bg-rose-500'
                  : 'bg-slate-400';
              return (
                <button
                  key={sent}
                  type="button"
                  onClick={() => toggleSentiment(sent)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${colorDot}`} />
                  <span className="capitalize">{sent}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT GROUP: Scope Counter & Reset */}
        <div className="flex items-center gap-3">
          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <span className="hidden sm:inline">Scope:</span>
            <span className="font-semibold text-slate-950 tabular-nums">
              {filteredEvents.length.toLocaleString()}
            </span>
            <span className="text-slate-400">/</span>
            <span className="tabular-nums">{events.length.toLocaleString()} events</span>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filters ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
