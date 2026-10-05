import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  Smile,
  Frown,
  Meh,
  BrainCircuit,
  Search,
} from 'lucide-react';
import { classifyText } from '../utils/nlp';
import { EmotionLabel, SentimentLabel, SocialEvent } from '../types';

export const SentimentEmotion: React.FC = () => {
  const {
    filteredEvents,
    setSelectedPostForModal,
    launchInvestigationForTopic,
  } = useData();

  const navigate = useNavigate();

  // Sentiment Filter for table
  const [selectedSentimentFilter, setSelectedSentimentFilter] = useState<string>('all');
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('all');

  // Live Classifier Sandbox State
  const [testInput, setTestInput] = useState<string>(
    'Critical software defect in perception sensors triggered an alarming fatal collision. Immediate emergency investigation required.'
  );

  const testClassification = useMemo(() => {
    return classifyText(testInput);
  }, [testInput]);

  // Aggregate Sentiment Stats
  const sentimentStats = useMemo(() => {
    let pos = 0, neu = 0, neg = 0;
    let totalScore = 0;
    let totalConf = 0;

    filteredEvents.forEach((e) => {
      if (e.sentiment === 'positive') pos++;
      else if (e.sentiment === 'negative') neg++;
      else neu++;
      totalScore += e.sentimentScore;
      totalConf += e.sentimentConfidence;
    });

    const total = Math.max(1, filteredEvents.length);
    return {
      positive: pos,
      neutral: neu,
      negative: neg,
      posPct: Math.round((pos / total) * 100),
      neuPct: Math.round((neu / total) * 100),
      negPct: Math.round((neg / total) * 100),
      avgScore: Math.round((totalScore / total) * 100) / 100,
      avgConfidence: Math.round((totalConf / total) * 100),
    };
  }, [filteredEvents]);

  // Emotion Distribution
  const emotionStats = useMemo(() => {
    const counts: Record<EmotionLabel, number> = {
      joy: 0,
      anger: 0,
      fear: 0,
      sadness: 0,
      surprise: 0,
      neutral: 0,
    };

    filteredEvents.forEach((e) => {
      counts[e.emotion] = (counts[e.emotion] || 0) + 1;
    });

    const total = Math.max(1, filteredEvents.length);
    return (Object.keys(counts) as EmotionLabel[]).map((em) => ({
      emotion: em,
      count: counts[em],
      pct: Math.round((counts[em] / total) * 100),
    }));
  }, [filteredEvents]);

  // Sentiment by Topic Matrix
  const sentimentByTopic = useMemo(() => {
    const map = new Map<string, { pos: number; neu: number; neg: number; total: number }>();
    filteredEvents.forEach((e) => {
      if (!map.has(e.topic)) map.set(e.topic, { pos: 0, neu: 0, neg: 0, total: 0 });
      const entry = map.get(e.topic)!;
      entry.total++;
      if (e.sentiment === 'positive') entry.pos++;
      else if (e.sentiment === 'negative') entry.neg++;
      else entry.neu++;
    });

    return Array.from(map.entries())
      .map(([topic, stats]) => ({
        topic,
        total: stats.total,
        posPct: Math.round((stats.pos / stats.total) * 100),
        neuPct: Math.round((stats.neu / stats.total) * 100),
        negPct: Math.round((stats.neg / stats.total) * 100),
      }))
      .sort((a, b) => b.negPct - a.negPct);
  }, [filteredEvents]);

  // Sentiment by Platform Matrix
  const sentimentByPlatform = useMemo(() => {
    const map = new Map<string, { pos: number; neu: number; neg: number; total: number }>();
    filteredEvents.forEach((e) => {
      if (!map.has(e.platform)) map.set(e.platform, { pos: 0, neu: 0, neg: 0, total: 0 });
      const entry = map.get(e.platform)!;
      entry.total++;
      if (e.sentiment === 'positive') entry.pos++;
      else if (e.sentiment === 'negative') entry.neg++;
      else entry.neu++;
    });

    return Array.from(map.entries()).map(([platform, stats]) => ({
      platform,
      total: stats.total,
      posPct: Math.round((stats.pos / stats.total) * 100),
      neuPct: Math.round((stats.neu / stats.total) * 100),
      negPct: Math.round((stats.neg / stats.total) * 100),
    }));
  }, [filteredEvents]);

  // Filtered underlying posts
  const displayedPosts = useMemo(() => {
    return filteredEvents.filter((e) => {
      if (selectedSentimentFilter !== 'all' && e.sentiment !== selectedSentimentFilter) return false;
      if (selectedEmotionFilter !== 'all' && e.emotion !== selectedEmotionFilter) return false;
      return true;
    });
  }, [filteredEvents, selectedSentimentFilter, selectedEmotionFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Sentiment & Emotion Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Transparent lexical valence analysis, emotional clustering, and cross-platform divergence
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-500">Average Confidence:</span>
          <span className="font-bold text-slate-900">{sentimentStats.avgConfidence}%</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500">Net Valence:</span>
          <span
            className={`font-bold ${
              sentimentStats.avgScore > 0
                ? 'text-emerald-700'
                : sentimentStats.avgScore < 0
                ? 'text-rose-700'
                : 'text-slate-700'
            }`}
          >
            {sentimentStats.avgScore > 0 ? `+${sentimentStats.avgScore}` : sentimentStats.avgScore}
          </span>
        </div>
      </div>

      {/* Row 1: Sentiment Gauges & Emotion Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Sentiment Breakdown Cards */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase font-mono tracking-wider">
            Valence Classification
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center">
            {/* Positive */}
            <div className="rounded border border-slate-200 bg-slate-50/60 p-3">
              <Smile className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-lg font-bold font-mono text-emerald-700">
                {sentimentStats.posPct}%
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {sentimentStats.positive} posts
              </div>
              <span className="text-[10px] text-emerald-800 uppercase font-semibold">Positive</span>
            </div>

            {/* Neutral */}
            <div className="rounded border border-slate-200 bg-slate-50/60 p-3">
              <Meh className="h-5 w-5 text-slate-500 mx-auto mb-1" />
              <div className="text-lg font-bold font-mono text-slate-800">
                {sentimentStats.neuPct}%
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {sentimentStats.neutral} posts
              </div>
              <span className="text-[10px] text-slate-600 uppercase font-semibold">Neutral</span>
            </div>

            {/* Negative */}
            <div className="rounded border border-slate-200 bg-slate-50/60 p-3">
              <Frown className="h-5 w-5 text-rose-600 mx-auto mb-1" />
              <div className="text-lg font-bold font-mono text-rose-700">
                {sentimentStats.negPct}%
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {sentimentStats.negative} posts
              </div>
              <span className="text-[10px] text-rose-800 uppercase font-semibold">Negative</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            Deterministic VADER/AFINN-style baseline model with negation modifiers and intensifier weighting.
          </div>
        </div>

        {/* Right 2 Cols: Emotion Spectrum Distribution */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase font-mono tracking-wider">
              Dominant Emotional Vector Breakdown
            </h3>
            <span className="text-[11px] font-mono text-slate-500">6 Discrete States</span>
          </div>

          <div className="space-y-3">
            {emotionStats.map((item) => {
              const color =
                item.emotion === 'joy'
                  ? 'bg-emerald-600'
                  : item.emotion === 'anger'
                  ? 'bg-rose-600'
                  : item.emotion === 'fear'
                  ? 'bg-amber-600'
                  : item.emotion === 'sadness'
                  ? 'bg-slate-600'
                  : item.emotion === 'surprise'
                  ? 'bg-indigo-600'
                  : 'bg-slate-400';

              return (
                <div key={item.emotion} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize font-medium text-slate-800 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${color}`} />
                      {item.emotion}
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {item.count} events ({item.pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div style={{ width: `${item.pct}%` }} className={`h-full ${color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Sentiment by Topic & Sentiment by Platform */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment by Topic */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Sentiment Divergence by Topic</h3>
            <span className="text-[10px] font-mono text-slate-500">Sorted by Negative %</span>
          </div>

          <div className="space-y-3">
            {sentimentByTopic.map((item) => (
              <div key={item.topic} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      launchInvestigationForTopic(item.topic);
                      navigate('/reports');
                    }}
                    className="font-medium text-slate-800 hover:text-slate-600 truncate max-w-xs transition-colors cursor-pointer"
                  >
                    {item.topic}
                  </button>
                  <span className="font-mono text-[11px] text-slate-500">
                    <strong className="text-rose-700">{item.negPct}% Neg</strong> /{' '}
                    <strong className="text-emerald-700">{item.posPct}% Pos</strong>
                  </span>
                </div>
                <div className="flex h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div style={{ width: `${item.posPct}%` }} className="bg-emerald-600" />
                  <div style={{ width: `${item.neuPct}%` }} className="bg-slate-300" />
                  <div style={{ width: `${item.negPct}%` }} className="bg-rose-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment by Platform */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Sentiment Distribution by Platform</h3>
            <span className="text-[10px] font-mono text-slate-500">Cross-Platform Tone</span>
          </div>

          <div className="space-y-3">
            {sentimentByPlatform.map((item) => (
              <div key={item.platform} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{item.platform}</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {item.total} events ({item.posPct}% Pos / {item.negPct}% Neg)
                  </span>
                </div>
                <div className="flex h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div style={{ width: `${item.posPct}%` }} className="bg-emerald-600" />
                  <div style={{ width: `${item.neuPct}%` }} className="bg-slate-300" />
                  <div style={{ width: `${item.negPct}%` }} className="bg-rose-600" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
            <strong className="text-slate-800 block mb-1">Analytical Takeaway:</strong>
            Telegram conversations harbor higher negative emotional polarization during breaking events,
            whereas Reddit comments show more balanced analytical debate with longer token lengths.
          </div>
        </div>
      </div>

      {/* Row 3: Transparent Classifier Inspector Workbench */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-900">
              Live Explainable Lexical Classifier Workbench
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-medium">
            TRANSPARENT ENGINE
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Type or modify any post below to inspect live keyword extraction, negation detection, and valence scoring.
        </p>

        <textarea
          rows={2}
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          className="w-full rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none font-mono"
        />

        {/* Live scoring output breakdown */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-white border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 block">Classified Valence</span>
            <span
              className={`text-sm font-bold uppercase ${
                testClassification.sentiment === 'positive'
                  ? 'text-emerald-700'
                  : testClassification.sentiment === 'negative'
                  ? 'text-rose-700'
                  : 'text-slate-700'
              }`}
            >
              {testClassification.sentiment} ({testClassification.normalizedScore})
            </span>
          </div>

          <div className="p-3 rounded bg-white border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 block">Dominant Emotion</span>
            <span className="text-sm font-bold uppercase text-amber-800">
              {testClassification.dominantEmotion}
            </span>
          </div>

          <div className="p-3 rounded bg-white border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 block">Confidence Metric</span>
            <span className="text-sm font-bold text-slate-900 font-mono">
              {Math.round(testClassification.confidence * 100)}%
            </span>
          </div>

          <div className="p-3 rounded bg-white border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 block">Matched Keywords</span>
            <span className="text-xs text-slate-700 font-medium">
              {testClassification.detectedNegativeTerms.length + testClassification.detectedPositiveTerms.length} tokens
            </span>
          </div>
        </div>

        <div className="mt-2 text-[11px] text-slate-600 font-mono space-y-1">
          <div>
            <span className="text-rose-700 font-semibold">- Negative Lexicon: </span>
            {testClassification.detectedNegativeTerms.length > 0
              ? testClassification.detectedNegativeTerms.map((t) => `${t.word} (${t.weight})`).join(', ')
              : 'None'}
          </div>
          <div>
            <span className="text-emerald-700 font-semibold">+ Positive Lexicon: </span>
            {testClassification.detectedPositiveTerms.length > 0
              ? testClassification.detectedPositiveTerms.map((t) => `${t.word} (+${t.weight})`).join(', ')
              : 'None'}
          </div>
        </div>
      </div>

      {/* Row 4: Filterable Underlying Posts Inspection Table */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Underlying Social Posts & Evidence
            </h3>
            <p className="text-xs text-slate-500">
              Inspect raw posts supporting the aggregate sentiment analytics
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedSentimentFilter}
              onChange={(e) => setSelectedSentimentFilter(e.target.value)}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:outline-none"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive Only</option>
              <option value="neutral">Neutral Only</option>
              <option value="negative">Negative Only</option>
            </select>

            <select
              value={selectedEmotionFilter}
              onChange={(e) => setSelectedEmotionFilter(e.target.value)}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:outline-none"
            >
              <option value="all">All Emotions</option>
              <option value="joy">Joy</option>
              <option value="anger">Anger</option>
              <option value="fear">Fear</option>
              <option value="sadness">Sadness</option>
              <option value="surprise">Surprise</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-mono uppercase text-slate-500">
                <th className="py-2 px-3 font-medium">Event ID</th>
                <th className="py-2 px-3 font-medium">Platform</th>
                <th className="py-2 px-3 font-medium">Author</th>
                <th className="py-2 px-3 font-medium">Content Excerpt</th>
                <th className="py-2 px-3 font-medium">Sentiment</th>
                <th className="py-2 px-3 font-medium">Emotion</th>
                <th className="py-2 px-3 font-medium text-right">Confidence</th>
                <th className="py-2 px-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {displayedPosts.slice(0, 40).map((ev) => (
                <tr
                  key={ev.id}
                  onClick={() => setSelectedPostForModal(ev)}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <td className="py-2.5 px-3 text-slate-900 font-semibold">{ev.id}</td>
                  <td className="py-2.5 px-3 text-slate-600">{ev.platform}</td>
                  <td className="py-2.5 px-3 text-slate-700">{ev.authorId}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-800 max-w-sm truncate pr-2">
                    {ev.text}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                        ev.sentiment === 'positive'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ev.sentiment === 'negative'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {ev.sentiment}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 capitalize text-amber-800">{ev.emotion}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700 tabular-nums">
                    {Math.round(ev.sentimentConfidence * 100)}%
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 font-sans font-medium hover:text-slate-900">Inspect →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
