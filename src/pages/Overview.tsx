import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  Users,
  MessageSquare,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  Share2,
  Eye,
  Heart,
  Repeat2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { computeTopicTrendMetrics } from '../utils/nlp';
import { SentimentLabel, SocialEvent } from '../types';

export const Overview: React.FC = () => {
  const {
    filteredEvents,
    events,
    updateFilter,
    setSelectedPostForModal,
    launchInvestigationForTopic,
  } = useData();

  const navigate = useNavigate();

  // 1. Metric calculations
  const totalPosts = filteredEvents.length;
  const uniqueAuthors = useMemo(() => {
    return new Set(filteredEvents.map((e) => e.authorId)).size;
  }, [filteredEvents]);

  const activeTopicsCount = useMemo(() => {
    return new Set(filteredEvents.map((e) => e.topic)).size;
  }, [filteredEvents]);

  const totalViews = useMemo(() => {
    return filteredEvents.reduce((acc, ev) => acc + (ev.engagement.views || 0), 0);
  }, [filteredEvents]);

  const totalLikes = useMemo(() => {
    return filteredEvents.reduce((acc, ev) => acc + (ev.engagement.likes || 0), 0);
  }, [filteredEvents]);

  const totalShares = useMemo(() => {
    return filteredEvents.reduce((acc, ev) => acc + (ev.engagement.reposts || 0), 0);
  }, [filteredEvents]);

  const totalComments = useMemo(() => {
    return filteredEvents.reduce((acc, ev) => acc + (ev.engagement.comments || 0), 0);
  }, [filteredEvents]);

  const avgEngagementRate = useMemo(() => {
    if (totalViews === 0) return 0;
    const totalInteractions = totalLikes + totalShares + totalComments;
    return Number(((totalInteractions / totalViews) * 100).toFixed(2));
  }, [totalViews, totalLikes, totalShares, totalComments]);

  const sentimentCounts = useMemo(() => {
    let pos = 0, neu = 0, neg = 0;
    filteredEvents.forEach((e) => {
      if (e.sentiment === 'positive') pos++;
      else if (e.sentiment === 'negative') neg++;
      else neu++;
    });
    return {
      positive: pos,
      neutral: neu,
      negative: neg,
      posPct: totalPosts > 0 ? Math.round((pos / totalPosts) * 100) : 0,
      neuPct: totalPosts > 0 ? Math.round((neu / totalPosts) * 100) : 0,
      negPct: totalPosts > 0 ? Math.round((neg / totalPosts) * 100) : 0,
    };
  }, [filteredEvents, totalPosts]);

  // 2. Platform distribution
  const platformCounts = useMemo(() => {
    const map = new Map<string, number>();
    filteredEvents.forEach((e) => {
      map.set(e.platform, (map.get(e.platform) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([platform, count]) => ({
        platform,
        count,
        pct: totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredEvents, totalPosts]);

  // 3. Computed Trends
  const trendMetrics = useMemo(() => {
    return computeTopicTrendMetrics(filteredEvents);
  }, [filteredEvents]);

  // 4. Emerging Alerts
  const alerts = useMemo(() => {
    return trendMetrics
      .filter((t) => t.acceleration > 0.6 || (t.sentimentBreakdown.negative > t.sentimentBreakdown.positive && t.growthRatePct > 20))
      .slice(0, 3);
  }, [trendMetrics]);

  // 5. Volume over time (24 hourly buckets)
  const timeBuckets = useMemo(() => {
    if (filteredEvents.length === 0) return [];
    const minTs = Math.min(...filteredEvents.map((e) => e.timestampMs));
    const maxTs = Math.max(...filteredEvents.map((e) => e.timestampMs));
    const span = Math.max(1, maxTs - minTs);
    const bucketCount = 24;
    const bucketSize = span / bucketCount;

    const buckets = Array.from({ length: bucketCount }, (_, i) => ({
      index: i,
      hourLabel: `T+${i * 3}h`,
      count: 0,
      posCount: 0,
      neuCount: 0,
      negCount: 0,
    }));

    filteredEvents.forEach((ev) => {
      const idx = Math.min(bucketCount - 1, Math.floor((ev.timestampMs - minTs) / bucketSize));
      if (idx >= 0 && idx < bucketCount) {
        buckets[idx].count++;
        if (ev.sentiment === 'positive') buckets[idx].posCount++;
        else if (ev.sentiment === 'negative') buckets[idx].negCount++;
        else buckets[idx].neuCount++;
      }
    });

    const maxCount = Math.max(1, ...buckets.map((b) => b.count));
    return buckets.map((b) => ({ ...b, heightPct: Math.round((b.count / maxCount) * 100) }));
  }, [filteredEvents]);

  // 6. High-impact posts
  const topImpactEvents = useMemo(() => {
    return [...filteredEvents]
      .sort((a, b) => (b.engagement.views + b.engagement.reposts * 3) - (a.engagement.views + a.engagement.reposts * 3))
      .slice(0, 6);
  }, [filteredEvents]);

  const handleTopicInvestigation = (topic: string) => {
    launchInvestigationForTopic(topic);
    navigate('/reports');
  };

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 font-sans">
            Social Media Intelligence Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Surveillance of cross-platform narrative propagation, engagement velocity, and sentiment inflection points.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/analytics')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors shadow-xs"
          >
            <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
            <span>Detailed Analytics</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-white transition-colors shadow-xs"
          >
            <span>Dossier Generator</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* EXECUTIVE KPI SECTION (ASYMMETRIC DOMINANCE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* DOMINANT HERO METRIC: Total Reach & Impressions (Spans 2 cols on lg) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Total Monitored Impressions & Reach
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-950 tabular-nums">
                  {totalViews.toLocaleString()}
                </span>
                <span className="flex items-center gap-0.5 text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +14.8% vs 72h baseline
                </span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
              <Eye className="h-5 w-5" />
            </div>
          </div>

          {/* Mini Sparkline Visualization */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-end justify-between gap-1 h-10 w-full mb-1.5">
              {timeBuckets.map((b) => (
                <div
                  key={b.index}
                  title={`${b.hourLabel}: ${b.count} events`}
                  style={{ height: `${Math.max(12, b.heightPct)}%` }}
                  className="w-full bg-slate-900/85 hover:bg-slate-900 rounded-t-xs transition-colors"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>{totalPosts.toLocaleString()} discrete records ingested</span>
              <span>Across {platformCounts.length} active platforms</span>
            </div>
          </div>
        </div>

        {/* SECONDARY METRIC 1: Average Engagement Rate */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Avg Engagement Rate</span>
              <Share2 className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-950 tabular-nums">
                {avgEngagementRate}%
              </span>
              <span className="text-[11px] font-mono font-semibold text-emerald-700 flex items-center">
                <ArrowUpRight className="h-3 w-3" />
                +1.8%
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Likes, shares and comments per 1k views
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1 text-[11px] font-mono">
            <div>
              <div className="text-slate-400 text-[10px]">Likes</div>
              <div className="font-semibold text-slate-800 tabular-nums">{totalLikes.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Shares</div>
              <div className="font-semibold text-slate-800 tabular-nums">{totalShares.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Replies</div>
              <div className="font-semibold text-slate-800 tabular-nums">{totalComments.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* SECONDARY METRIC 2: Net Sentiment & Health */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Sentiment Polarity</span>
              <Activity className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-950 tabular-nums">
                {sentimentCounts.posPct - sentimentCounts.negPct > 0 ? '+' : ''}
                {sentimentCounts.posPct - sentimentCounts.negPct}
              </span>
              <span className="text-[11px] font-mono text-slate-500">Net Index</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {sentimentCounts.positive} pos · {sentimentCounts.neutral} neu · {sentimentCounts.negative} neg
            </p>
          </div>

          {/* Tri-color Segment Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div style={{ width: `${sentimentCounts.posPct}%` }} className="bg-emerald-600" title={`Positive: ${sentimentCounts.posPct}%`} />
              <div style={{ width: `${sentimentCounts.neuPct}%` }} className="bg-slate-300" title={`Neutral: ${sentimentCounts.neuPct}%`} />
              <div style={{ width: `${sentimentCounts.negPct}%` }} className="bg-rose-600" title={`Negative: ${sentimentCounts.negPct}%`} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="text-emerald-700 font-semibold">{sentimentCounts.posPct}% Pos</span>
              <span>{sentimentCounts.neuPct}% Neu</span>
              <span className="text-rose-700 font-semibold">{sentimentCounts.negPct}% Neg</span>
            </div>
          </div>
        </div>
      </div>

      {/* DISCOURSE ACCELERATION & CRITICAL ALERTS */}
      {alerts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-950 font-mono uppercase tracking-wider">
                  Critical Narrative Anomalies Detected ({alerts.length})
                </h3>
                <span className="text-[11px] text-amber-800 font-medium">Algorithmic Alert Feed</span>
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                {alerts.map((alert) => (
                  <div key={alert.topic} className="rounded-lg border border-amber-200/80 bg-white p-3 shadow-xs">
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-semibold text-slate-900 line-clamp-1">{alert.topic}</span>
                      <span className="text-[10px] font-mono font-bold text-rose-700 shrink-0">
                        +{alert.growthRatePct}%
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Accel: {alert.acceleration.toFixed(2)}x</span>
                      <button
                        type="button"
                        onClick={() => handleTopicInvestigation(alert.topic)}
                        className="text-slate-900 font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        Investigate <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROW 3: TEMPORAL VOLUME CHART & PLATFORM DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Temporal Progression Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-950">Discourse Velocity & Inflection Curve</h2>
              <p className="text-xs text-slate-500">
                24 chronological buckets indicating surge points and polarity shifts
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Pos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-300" /> Neu
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Neg
              </span>
            </div>
          </div>

          {/* Interactive Stacked Bar Chart */}
          <div className="relative h-60 w-full flex items-end gap-1.5 pt-6 pb-2 border-b border-slate-200">
            {timeBuckets.map((b) => {
              const posHeight = b.count > 0 ? (b.posCount / b.count) * 100 : 0;
              const neuHeight = b.count > 0 ? (b.neuCount / b.count) * 100 : 0;
              const negHeight = b.count > 0 ? (b.negCount / b.count) * 100 : 0;

              return (
                <div
                  key={b.index}
                  className="group relative flex-1 flex flex-col justify-end h-full items-center cursor-pointer"
                  onClick={() => navigate('/content')}
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -top-14 z-30 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-mono text-white shadow-md">
                    <div className="font-semibold">{b.hourLabel} · {b.count} events</div>
                    <div className="text-[10px] text-slate-300">
                      {b.posCount} pos · {b.neuCount} neu · {b.negCount} neg
                    </div>
                  </div>

                  {/* Stacked Bar */}
                  <div
                    style={{ height: `${Math.max(8, b.heightPct)}%` }}
                    className="w-full flex flex-col overflow-hidden rounded-t-xs transition-transform group-hover:scale-y-105 origin-bottom"
                  >
                    <div style={{ height: `${posHeight}%` }} className="bg-emerald-600" />
                    <div style={{ height: `${neuHeight}%` }} className="bg-slate-300" />
                    <div style={{ height: `${negHeight}%` }} className="bg-rose-600" />
                  </div>

                  <span className="mt-1 text-[9px] font-mono text-slate-400 truncate w-full text-center">
                    {b.index % 4 === 0 ? b.hourLabel : ''}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>T+0h Baseline</span>
            <span>T+36h Autonomous Collision Incident</span>
            <span>T+72h Conclusion</span>
          </div>
        </div>

        {/* Right 1 Col: Cross-Platform Share */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-950">Platform Distribution</h2>
            <p className="text-xs text-slate-500">
              Cross-platform ingest density & volume share
            </p>

            <div className="mt-4 space-y-3">
              {platformCounts.map((item) => (
                <div key={item.platform} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-medium text-slate-800">{item.platform}</span>
                    <span className="text-slate-500 tabular-nums">
                      {item.count.toLocaleString()} ({item.pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.pct}%` }}
                      className="h-full bg-slate-900 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs flex items-center justify-between text-slate-500">
            <span>{uniqueAuthors} pseudonymous nodes</span>
            <button
              type="button"
              onClick={() => navigate('/audience')}
              className="text-slate-900 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Audience Intel <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ROW 4: TOPIC VELOCITY LEADERBOARD & RECENT HIGH-IMPACT FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Topic Velocity Leaderboard */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-950">Topic Velocity & Trajectory</h2>
              <p className="text-xs text-slate-500">
                Topics ranked by 1st derivative growth velocity and sentiment drift
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/analytics')}
              className="text-xs font-semibold text-slate-900 hover:underline inline-flex items-center gap-1"
            >
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {trendMetrics.slice(0, 5).map((metric, idx) => (
              <div key={metric.topic} className="py-2.5 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-slate-400 text-xs w-4">0{idx + 1}</span>
                  <div className="truncate">
                    <div className="font-semibold text-slate-900 truncate group-hover:text-slate-700">
                      {metric.topic}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {metric.totalVolume} events · {metric.dominantEmotion}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`font-mono font-bold text-xs ${
                      metric.growthRatePct > 0 ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {metric.growthRatePct > 0 ? '+' : ''}
                    {metric.growthRatePct}%
                  </span>

                  <button
                    type="button"
                    onClick={() => handleTopicInvestigation(metric.topic)}
                    className="rounded border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 transition-colors"
                  >
                    Investigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High-Impact Content Stream */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-950">High-Impact Discourse Stream</h2>
              <p className="text-xs text-slate-500">
                Top viral posts with cryptographic tamper-evident hashes
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/content')}
              className="text-xs font-semibold text-slate-900 hover:underline inline-flex items-center gap-1"
            >
              Explore Stream <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {topImpactEvents.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPostForModal(post)}
                className="p-3 rounded-lg border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{post.authorId}</span>
                    <span>·</span>
                    <span>{post.platform}</span>
                    <span>·</span>
                    <span className="capitalize">{post.sentiment}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {post.timestamp.slice(11, 16)} UTC
                  </span>
                </div>

                <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                  {post.text}
                </p>

                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {post.engagement.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Repeat2 className="h-3 w-3" /> {post.engagement.reposts}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {post.engagement.likes}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    Hash: {post.evidenceHash.slice(0, 10)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
