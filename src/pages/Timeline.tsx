import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Calendar,
  Layers,
  Clock,
  ArrowRight,
  Eye,
  Repeat2,
  Heart,
  MessageSquare,
  Share2,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { SentimentLabel, SocialEvent } from '../types';

export const Timeline: React.FC = () => {
  const {
    filteredEvents,
    allTopics,
    setSelectedPostForModal,
    minTimestampMs,
    maxTimestampMs,
  } = useData();

  // Timeline Interval: 1h, 3h, 6h, 12h
  const [intervalHours, setIntervalHours] = useState<number>(3);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedBucketIndex, setSelectedBucketIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'engagement' | 'views'>('engagement');

  // Time bucket calculation
  const timelineData = useMemo(() => {
    if (filteredEvents.length === 0) return { buckets: [], maxVolume: 0, maxEngagement: 0 };

    const span = Math.max(1, maxTimestampMs - minTimestampMs);
    const bucketDurationMs = intervalHours * 3600000;
    const bucketCount = Math.max(1, Math.ceil(span / bucketDurationMs));

    const buckets = Array.from({ length: bucketCount }, (_, i) => ({
      index: i,
      startMs: minTimestampMs + i * bucketDurationMs,
      endMs: Math.min(maxTimestampMs, minTimestampMs + (i + 1) * bucketDurationMs),
      hourLabel: `T+${i * intervalHours}h`,
      totalCount: 0,
      positiveCount: 0,
      neutralCount: 0,
      negativeCount: 0,
      totalEngagement: 0,
      events: [] as SocialEvent[],
      topicBreakdown: new Map<string, number>(),
    }));

    filteredEvents.forEach((ev) => {
      if (selectedTopic !== 'all' && ev.topic !== selectedTopic) return;

      const idx = Math.min(bucketCount - 1, Math.floor((ev.timestampMs - minTimestampMs) / bucketDurationMs));
      if (idx >= 0 && idx < bucketCount) {
        const b = buckets[idx];
        b.totalCount++;
        b.events.push(ev);
        b.totalEngagement += ev.engagement.likes + ev.engagement.reposts * 2;
        if (ev.sentiment === 'positive') b.positiveCount++;
        else if (ev.sentiment === 'negative') b.negativeCount++;
        else b.neutralCount++;

        b.topicBreakdown.set(ev.topic, (b.topicBreakdown.get(ev.topic) || 0) + 1);
      }
    });

    const maxVolume = Math.max(1, ...buckets.map((b) => b.totalCount));
    const maxEngagement = Math.max(1, ...buckets.map((b) => b.totalEngagement));

    return { buckets, maxVolume, maxEngagement };
  }, [filteredEvents, intervalHours, selectedTopic, minTimestampMs, maxTimestampMs]);

  // Key historical inflection pins
  const inflectionEvents = [
    {
      hour: 36,
      label: 'AV Perception Incident',
      description: 'Collision report leads to 82% negative sentiment inversion.',
      topic: 'Autonomous Vehicle Safety',
    },
    {
      hour: 48,
      label: 'Synthetic Audio Outbreak',
      description: 'Viral Telegram relay triggers 64x volume acceleration.',
      topic: 'Deepfake Election Rumors',
    },
    {
      hour: 56,
      label: 'Cryptographic Forensics Leak',
      description: 'Fact-checker hashes debunk audio tampering.',
      topic: 'Deepfake Election Rumors',
    },
  ];

  // Active post list: either from the selected bucket, or top sorted posts across filtered set
  const displayedPosts = useMemo(() => {
    let source = selectedBucketIndex !== null && timelineData.buckets[selectedBucketIndex]
      ? timelineData.buckets[selectedBucketIndex].events
      : (selectedTopic === 'all' ? filteredEvents : filteredEvents.filter(e => e.topic === selectedTopic));

    return [...source].sort((a, b) => {
      if (sortBy === 'time') return b.timestampMs - a.timestampMs;
      if (sortBy === 'views') return b.engagement.views - a.engagement.views;
      const scoreA = a.engagement.likes + a.engagement.reposts * 2 + a.engagement.comments * 3;
      const scoreB = b.engagement.likes + b.engagement.reposts * 2 + b.engagement.comments * 3;
      return scoreB - scoreA;
    });
  }, [selectedBucketIndex, timelineData.buckets, selectedTopic, filteredEvents, sortBy]);

  const activeBucket = selectedBucketIndex !== null ? timelineData.buckets[selectedBucketIndex] : null;

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER & CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 font-sans">
            Content Chronology & Engagement Performance
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Granular post analysis, viral trajectory tracking, and temporal discourse surges across connected platforms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Topic Stream Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Stream:</span>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setSelectedBucketIndex(null);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
            >
              <option value="all">All Topics ({allTopics.length})</option>
              {allTopics.map((top) => (
                <option key={top} value={top}>
                  {top}
                </option>
              ))}
            </select>
          </div>

          {/* Time Resolution Interval */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-mono">
            <span className="px-2 text-slate-400 text-[10px]">Step:</span>
            {[1, 3, 6, 12].map((hrs) => (
              <button
                key={hrs}
                type="button"
                onClick={() => {
                  setIntervalHours(hrs);
                  setSelectedBucketIndex(null);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  intervalHours === hrs
                    ? 'bg-white text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {hrs}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN INTERACTIVE VOLUME & SENTIMENT CHART */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-950">Temporal Post Distribution</h2>
            <p className="text-xs text-slate-500">
              Stacked sentiment density. Click any bar to isolate that time frame.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Pos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-300" /> Neu
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Neg
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Viral Surge
            </span>
          </div>
        </div>

        {/* Dynamic Stacked Bar Chart */}
        <div className="relative h-64 w-full flex items-end gap-1.5 pt-8 pb-2 border-b border-slate-200">
          {timelineData.buckets.map((bucket) => {
            const isSelected = selectedBucketIndex === bucket.index;
            const heightPct = Math.max(8, (bucket.totalCount / timelineData.maxVolume) * 100);
            const posPct = bucket.totalCount > 0 ? (bucket.positiveCount / bucket.totalCount) * 100 : 0;
            const negPct = bucket.totalCount > 0 ? (bucket.negativeCount / bucket.totalCount) * 100 : 0;
            const neuPct = 100 - posPct - negPct;
            const isSpike = bucket.totalEngagement > timelineData.maxEngagement * 0.45;

            return (
              <div
                key={bucket.index}
                onClick={() => setSelectedBucketIndex(isSelected ? null : bucket.index)}
                className={`group relative flex-1 flex flex-col justify-end h-full cursor-pointer transition-all ${
                  isSelected ? 'z-10' : 'hover:opacity-90'
                }`}
              >
                {/* Engagement Marker Pin on Top of Spikes */}
                {isSpike && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-100" />
                  </div>
                )}

                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-30 pointer-events-none rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-[11px] font-mono text-white whitespace-nowrap shadow-xl">
                  <div className="font-bold text-slate-100">
                    {bucket.hourLabel} ({new Date(bucket.startMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </div>
                  <div className="text-slate-300 font-semibold mt-0.5">{bucket.totalCount} posts</div>
                  <div className="text-emerald-400 font-medium">+{bucket.positiveCount} positive</div>
                  <div className="text-slate-400 font-medium">{bucket.neutralCount} neutral</div>
                  <div className="text-rose-400 font-medium">-{bucket.negativeCount} negative</div>
                </div>

                {/* Stacked Vertical Bar */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t overflow-hidden flex flex-col-reverse transition-all ${
                    isSelected ? 'ring-2 ring-slate-950' : ''
                  }`}
                >
                  <div style={{ height: `${posPct}%` }} className="bg-emerald-600" />
                  <div style={{ height: `${neuPct}%` }} className="bg-slate-300" />
                  <div style={{ height: `${negPct}%` }} className="bg-rose-600" />
                </div>

                <span className="mt-1 text-[9px] font-mono text-slate-400 truncate w-full text-center">
                  {bucket.index % 4 === 0 ? bucket.hourLabel : ''}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Click any bar to filter the feed below</span>
          {activeBucket && (
            <button
              type="button"
              onClick={() => setSelectedBucketIndex(null)}
              className="text-slate-900 font-semibold hover:underline"
            >
              Clear Window Filter (Showing {activeBucket.hourLabel}) ×
            </button>
          )}
        </div>
      </div>

      {/* INFLECTION MILESTONES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {inflectionEvents.map((inf) => (
          <div
            key={inf.hour}
            onClick={() => {
              setSelectedTopic(inf.topic);
              const bIdx = Math.floor(inf.hour / intervalHours);
              setSelectedBucketIndex(bIdx);
            }}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-mono font-bold text-slate-950 text-xs">T+{inf.hour}:00h</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">{inf.topic}</span>
            </div>
            <h3 className="text-xs font-bold text-slate-900">{inf.label}</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{inf.description}</p>
            <div className="mt-2 text-[10px] font-mono text-slate-900 flex items-center gap-1 font-semibold">
              <span>Filter time window</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        ))}
      </div>

      {/* DETAILED CONTENT PERFORMANCE STREAM */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        
        {/* Table Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-950">
                {activeBucket ? `${activeBucket.hourLabel} Window Feed` : 'Content Performance Stream'}
              </h2>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-mono text-slate-500">
                {displayedPosts.length.toLocaleString()} matching records
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ranked by cross-platform virality, repost acceleration, and sentiment weight
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1 text-xs font-mono border border-slate-200 bg-slate-50 p-1 rounded-lg">
            <span className="text-slate-400 px-1 text-[11px]">Sort:</span>
            <button
              type="button"
              onClick={() => setSortBy('engagement')}
              className={`px-2 py-0.5 rounded transition-colors ${
                sortBy === 'engagement' ? 'bg-white font-bold text-slate-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              Virality
            </button>
            <button
              type="button"
              onClick={() => setSortBy('views')}
              className={`px-2 py-0.5 rounded transition-colors ${
                sortBy === 'views' ? 'bg-white font-bold text-slate-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              Views
            </button>
            <button
              type="button"
              onClick={() => setSortBy('time')}
              className={`px-2 py-0.5 rounded transition-colors ${
                sortBy === 'time' ? 'bg-white font-bold text-slate-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              Recency
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto max-h-[540px] divide-y divide-slate-100">
          {displayedPosts.slice(0, 40).map((post, idx) => {
            const sentimentDot =
              post.sentiment === 'positive'
                ? 'bg-emerald-500'
                : post.sentiment === 'negative'
                ? 'bg-rose-500'
                : 'bg-slate-400';

            return (
              <div
                key={post.id}
                onClick={() => setSelectedPostForModal(post)}
                className="py-3 px-2 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer rounded-lg group"
              >
                {/* Left: Author & Excerpt */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="font-mono text-xs font-semibold text-slate-400 w-6 pt-0.5 shrink-0">
                    {idx < 9 ? `0${idx + 1}` : idx + 1}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
                      <span className="font-bold text-slate-950">{post.authorId}</span>
                      <span>·</span>
                      <span className="text-slate-700">{post.platform}</span>
                      <span>·</span>
                      <span className="text-slate-600 font-sans">{post.topic}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 capitalize">
                        <span className={`h-1.5 w-1.5 rounded-full ${sentimentDot}`} />
                        {post.sentiment}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed group-hover:text-slate-950">
                      {post.text}
                    </p>
                  </div>
                </div>

                {/* Right: Metrics & Actions */}
                <div className="flex items-center gap-6 shrink-0 pl-9 md:pl-0 text-xs font-mono text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1" title="Views">
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      <span className="tabular-nums">{post.engagement.views.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center gap-1" title="Reposts / Shares">
                      <Repeat2 className="h-3.5 w-3.5 text-slate-400" />
                      <span className="tabular-nums">{post.engagement.reposts.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center gap-1" title="Likes">
                      <Heart className="h-3.5 w-3.5 text-slate-400" />
                      <span className="tabular-nums">{post.engagement.likes.toLocaleString()}</span>
                    </span>
                  </div>

                  <span className="text-xs font-sans font-semibold text-slate-900 group-hover:underline flex items-center gap-0.5">
                    Inspect →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
