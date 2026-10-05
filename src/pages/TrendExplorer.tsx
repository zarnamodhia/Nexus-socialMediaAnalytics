import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  TrendingUp,
  ArrowUpRight,
  Flame,
  SearchCode,
  ChevronRight,
  Info,
  Filter,
} from 'lucide-react';
import { computeTopicTrendMetrics, extractTopKeywords } from '../utils/nlp';
import { TopicTrendMetric } from '../types';

export const TrendExplorer: React.FC = () => {
  const { filteredEvents, launchInvestigationForTopic, setSelectedPostForModal } = useData();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<'all' | 'emerging' | 'growing' | 'saturating'>('all');
  const [selectedTopicDetail, setSelectedTopicDetail] = useState<string | null>(null);

  // Computed Topic Trends
  const trendMetrics = useMemo(() => {
    return computeTopicTrendMetrics(filteredEvents);
  }, [filteredEvents]);

  // Keyword extraction from current active filtered dataset
  const topKeywords = useMemo(() => {
    return extractTopKeywords(filteredEvents, 18);
  }, [filteredEvents]);

  const filteredTrends = useMemo(() => {
    if (activeCategory === 'all') return trendMetrics;
    return trendMetrics.filter((t) => t.classification === activeCategory);
  }, [trendMetrics, activeCategory]);

  const activeTopicMetric = useMemo(() => {
    if (!selectedTopicDetail && trendMetrics.length > 0) return trendMetrics[0];
    return trendMetrics.find((t) => t.topic === selectedTopicDetail) || trendMetrics[0];
  }, [trendMetrics, selectedTopicDetail]);

  const representativePosts = useMemo(() => {
    if (!activeTopicMetric) return [];
    return filteredEvents
      .filter((e) => e.topic === activeTopicMetric.topic)
      .sort((a, b) => (b.engagement.likes + b.engagement.reposts * 2) - (a.engagement.likes + a.engagement.reposts * 2))
      .slice(0, 4);
  }, [filteredEvents, activeTopicMetric]);

  const handleLaunchDossier = (topic: string) => {
    launchInvestigationForTopic(topic);
    navigate('/reports');
  };

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER & CATEGORY TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 font-sans">
            Topic Velocity & Trend Acceleration
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Mathematical topic lifecycle tracking via 1st & 2nd derivative volume changes, engagement velocity, and sentiment entropy.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeCategory === 'all'
                ? 'bg-white text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Vectors ({trendMetrics.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('emerging')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeCategory === 'emerging'
                ? 'bg-white text-rose-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Emerging
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('growing')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeCategory === 'growing'
                ? 'bg-white text-emerald-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Growing
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('saturating')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeCategory === 'saturating'
                ? 'bg-white text-amber-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saturating
          </button>
        </div>
      </div>

      {/* TRANSPARENT SCORING DECOMPOSITION BANNER */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-xs">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-900 text-xs">
              Algorithmic Scoring Decomposition (Deterministic Multi-Variable Index)
            </span>
            <p className="text-slate-600 leading-relaxed font-mono text-[11px]">
              Trend Score = (Volume Growth Rate × 0.40) + (Acceleration Factor × 0.30) + (Engagement Velocity × 0.20) + (Sentiment Shift × 0.10)
            </p>
            <p className="text-slate-500 text-[11px]">
              Every metric is reproducible directly from the ingestion event timestamps, interaction counts, and lexicon weights.
            </p>
          </div>
        </div>
      </div>

      {/* TREND SCORES TABLE */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Ranked Narrative Vectors & Score Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Select any vector to inspect representative posts and launch an evidence-backed investigation
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {filteredTrends.length} Topics Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="py-2.5 px-3 font-semibold">Topic Vector</th>
                <th className="py-2.5 px-3 font-semibold text-center">Lifecycle</th>
                <th className="py-2.5 px-3 font-semibold text-right">Volume</th>
                <th className="py-2.5 px-3 font-semibold text-right">Growth %</th>
                <th className="py-2.5 px-3 font-semibold text-right">Acceleration</th>
                <th className="py-2.5 px-3 font-semibold text-right">Eng. Velocity</th>
                <th className="py-2.5 px-3 font-semibold text-right">Sent. Shift</th>
                <th className="py-2.5 px-3 font-semibold text-right">Score</th>
                <th className="py-2.5 px-3 font-semibold text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredTrends.map((metric) => {
                const isSelected = activeTopicMetric?.topic === metric.topic;

                return (
                  <tr
                    key={metric.topic}
                    onClick={() => setSelectedTopicDetail(metric.topic)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-100/90 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-3 font-sans font-medium text-slate-900 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{metric.topic}</span>
                        {metric.acceleration > 1.0 && (
                          <span title="Accelerating surge">
                            <Flame className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="text-[11px] font-mono text-slate-600 capitalize">
                        {metric.classification}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right text-slate-700 tabular-nums">
                      {metric.totalVolume}
                    </td>

                    <td
                      className={`py-3 px-3 text-right tabular-nums font-bold ${
                        metric.growthRatePct > 50
                          ? 'text-rose-700'
                          : metric.growthRatePct > 0
                          ? 'text-emerald-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {metric.growthRatePct > 0 ? `+${metric.growthRatePct}%` : `${metric.growthRatePct}%`}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-700 tabular-nums">
                      {metric.acceleration}x
                    </td>

                    <td className="py-3 px-3 text-right text-slate-700 tabular-nums">
                      {metric.engagementVelocity}
                    </td>

                    <td
                      className={`py-3 px-3 text-right tabular-nums ${
                        metric.sentimentShift < -0.2
                          ? 'text-rose-700 font-semibold'
                          : metric.sentimentShift > 0.2
                          ? 'text-emerald-700 font-semibold'
                          : 'text-slate-600'
                      }`}
                    >
                      {metric.sentimentShift > 0 ? `+${metric.sentimentShift}` : metric.sentimentShift}
                    </td>

                    <td className="py-3 px-3 text-right font-extrabold text-slate-950 text-sm tabular-nums">
                      {metric.trendScore}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchDossier(metric.topic);
                        }}
                        className="rounded-md border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-[11px] font-sans font-medium text-slate-700 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                      >
                        Investigate →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPRESENTATIVE POSTS & KEYWORD LEXICON */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Representative Evidence Posts */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-slate-400 font-semibold">Active Vector:</span>
                <span className="text-sm font-bold text-slate-950 font-sans">
                  {activeTopicMetric?.topic}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Top viral evidence posts representing this topic trajectory
              </p>
            </div>

            {activeTopicMetric && (
              <button
                type="button"
                onClick={() => handleLaunchDossier(activeTopicMetric.topic)}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                <SearchCode className="h-3.5 w-3.5" />
                <span>Open Dossier</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {representativePosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPostForModal(post)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50/40 p-3.5 hover:bg-white hover:border-slate-300 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1.5 text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-950 font-bold">{post.authorId}</span>
                    <span>·</span>
                    <span className="text-slate-700">{post.platform}</span>
                    <span>·</span>
                    <span className="capitalize">{post.sentiment}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {post.timestamp.slice(11, 16)} UTC
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-800">{post.text}</p>

                <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                  <span>
                    Views: <strong className="text-slate-900">{post.engagement.views.toLocaleString()}</strong> · Reposts: <strong className="text-slate-900">{post.engagement.reposts}</strong>
                  </span>
                  <span className="text-slate-800 flex items-center gap-1 font-sans font-semibold hover:underline">
                    Inspect Ledger <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Keyword Frequency Cloud */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Discovered Keyword Lexicon</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              High-frequency n-grams extracted with emotional valence weighting
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {topKeywords.map((item) => (
              <span
                key={item.word}
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-mono ${
                  item.sentimentWeight < -0.2
                    ? 'border-rose-200 bg-rose-50 text-rose-800'
                    : item.sentimentWeight > 0.2
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <span>{item.word}</span>
                <span className="text-[10px] text-slate-400 font-sans">({item.count})</span>
              </span>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-900">Lexical Valence:</div>
            <div>
              Rose tags represent high risk/critical vocabulary; emerald tags indicate constructive progress or validation terms.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
