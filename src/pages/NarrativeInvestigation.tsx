import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Save,
  Download,
  Printer,
  FileText,
  Plus,
  CheckCircle2,
  Split,
} from 'lucide-react';
import { Investigation, SentimentLabel, SocialEvent } from '../types';

export const NarrativeInvestigation: React.FC = () => {
  const {
    investigations,
    currentInvestigationId,
    setCurrentInvestigationId,
    saveInvestigation,
    events,
    allTopics,
    setSelectedPostForModal,
    minTimestampMs,
    maxTimestampMs,
  } = useData();

  // Active investigation
  const activeInvestigation = useMemo(() => {
    return (
      investigations.find((i) => i.id === currentInvestigationId) ||
      investigations[0] ||
      null
    );
  }, [investigations, currentInvestigationId]);

  // Editing state
  const [title, setTitle] = useState<string>(activeInvestigation?.title || '');
  const [topic, setTopic] = useState<string>(activeInvestigation?.topic || allTopics[0] || '');
  const [keywords, setKeywords] = useState<string>(activeInvestigation?.keywords.join(', ') || '');
  const [analystNotes, setAnalystNotes] = useState<string>(activeInvestigation?.analystNotes || '');
  const [observedFacts, setObservedFacts] = useState<string[]>(activeInvestigation?.findings.observedFacts || []);
  const [modelInterpretations, setModelInterpretations] = useState<string[]>(
    activeInvestigation?.findings.modelInterpretations || []
  );
  const [hypotheses, setHypotheses] = useState<string[]>(activeInvestigation?.findings.hypotheses || []);
  const [splitHour, setSplitHour] = useState<number>(36);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  // Sync state when active investigation changes
  React.useEffect(() => {
    if (activeInvestigation) {
      setTitle(activeInvestigation.title);
      setTopic(activeInvestigation.topic);
      setKeywords(activeInvestigation.keywords.join(', '));
      setAnalystNotes(activeInvestigation.analystNotes);
      setObservedFacts(activeInvestigation.findings.observedFacts);
      setModelInterpretations(activeInvestigation.findings.modelInterpretations);
      setHypotheses(activeInvestigation.findings.hypotheses);
      const hourOffset = Math.round((activeInvestigation.splitTimestampMs - minTimestampMs) / 3600000);
      setSplitHour(Math.max(0, Math.min(72, hourOffset)));
    }
  }, [activeInvestigation, minTimestampMs]);

  // Topic specific events
  const topicEvents = useMemo(() => {
    return events.filter((e) => e.topic === topic);
  }, [events, topic]);

  // Before & After Split timestamp
  const splitTimestampMs = minTimestampMs + splitHour * 3600000;

  const { beforeEvents, afterEvents, beforeStats, afterStats } = useMemo(() => {
    const before = topicEvents.filter((e) => e.timestampMs < splitTimestampMs);
    const after = topicEvents.filter((e) => e.timestampMs >= splitTimestampMs);

    const calcStats = (arr: SocialEvent[]) => {
      let pos = 0, neg = 0, neu = 0;
      let totalScore = 0;
      const clusterCounts = new Map<string, number>();

      arr.forEach((e) => {
        if (e.sentiment === 'positive') pos++;
        else if (e.sentiment === 'negative') neg++;
        else neu++;
        totalScore += e.sentimentScore;
        clusterCounts.set(e.authorCluster, (clusterCounts.get(e.authorCluster) || 0) + 1);
      });

      const topCluster = Array.from(clusterCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
      const count = Math.max(1, arr.length);

      return {
        count: arr.length,
        posPct: Math.round((pos / count) * 100),
        negPct: Math.round((neg / count) * 100),
        neuPct: Math.round((neu / count) * 100),
        avgScore: Math.round((totalScore / count) * 100) / 100,
        dominantSentiment: (pos > neg && pos > neu ? 'positive' : neg > pos ? 'negative' : 'neutral') as SentimentLabel,
        topCluster,
      };
    };

    return {
      beforeEvents: before,
      afterEvents: after,
      beforeStats: calcStats(before),
      afterStats: calcStats(after),
    };
  }, [topicEvents, splitTimestampMs]);

  // Evidence posts from topic
  const evidenceRecords = useMemo(() => {
    if (!activeInvestigation) return [];
    return events.filter((e) => activeInvestigation.evidenceIds.includes(e.id) || e.topic === topic).slice(0, 6);
  }, [events, activeInvestigation, topic]);

  const handleSave = () => {
    if (!activeInvestigation) return;

    const updated: Investigation = {
      ...activeInvestigation,
      title,
      topic,
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      splitTimestampMs,
      findings: {
        observedFacts,
        modelInterpretations,
        hypotheses,
      },
      analystNotes,
      summaryMetrics: {
        totalEvents: topicEvents.length,
        dominantSentiment: afterStats.dominantSentiment,
        peakEmotion: afterEvents[0]?.emotion || 'neutral',
        topPlatform: afterEvents[0]?.platform || 'X/Twitter',
        primaryCommunity: afterStats.topCluster,
        viralityRatio: afterStats.count > 0 ? Math.round((afterStats.count / Math.max(1, beforeStats.count)) * 10) / 10 : 1,
      },
    };

    saveInvestigation(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleCreateNew = () => {
    const newId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInv: Investigation = {
      id: newId,
      title: 'New Narrative Analysis Dossier',
      topic: allTopics[0] || 'Clean Energy Grid Transition',
      createdAt: new Date().toISOString(),
      keywords: ['investigation', 'narrative', 'sentiment'],
      timeWindow: { startMs: minTimestampMs, endMs: maxTimestampMs },
      splitTimestampMs: minTimestampMs + 36 * 3600000,
      findings: {
        observedFacts: ['Baseline post volume captured across monitored social media protocols.'],
        modelInterpretations: ['Initial lexical classification reflects balanced baseline engagement.'],
        hypotheses: ['Evaluate network relay velocity across secondary amplification clusters.'],
      },
      evidenceIds: [],
      summaryMetrics: {
        totalEvents: 0,
        dominantSentiment: 'neutral',
        peakEmotion: 'neutral',
        topPlatform: 'X/Twitter',
        primaryCommunity: 'Cluster-Alpha: Tech & Policy Experts',
        viralityRatio: 1.0,
      },
      analystNotes: 'Initial dossier created.',
      status: 'active',
    };
    saveInvestigation(newInv);
    setCurrentInvestigationId(newId);
  };

  const handleExportJSON = () => {
    if (!activeInvestigation) return;
    const exportData = {
      reportType: 'NEXUS Social Media Narrative Investigation Report',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      investigation: {
        id: activeInvestigation.id,
        title,
        topic,
        keywords: keywords.split(',').map((k) => k.trim()),
        splitPoint: `T+${splitHour}h (${new Date(splitTimestampMs).toISOString()})`,
        metricsSummary: {
          totalEventsAnalyzed: topicEvents.length,
          preInflectionVolume: beforeStats.count,
          postInflectionVolume: afterStats.count,
          preInflectionSentimentScore: beforeStats.avgScore,
          postInflectionSentimentScore: afterStats.avgScore,
          primaryAmplificationCluster: afterStats.topCluster,
        },
        findings: {
          observedFacts,
          modelInterpretations,
          hypotheses,
        },
        analystNotes,
        evidenceRecords: evidenceRecords.map((e) => ({
          id: e.id,
          timestamp: e.timestamp,
          platform: e.platform,
          authorId: e.authorId,
          text: e.text,
          sentiment: e.sentiment,
          sha256Hash: e.evidenceHash,
        })),
        methodology: 'Deterministic lexical valence analysis and cryptographic hash chain provenance.',
        disclaimers:
          'Findings are empirical and model-assisted. Topographical network correlations do not establish coordinated intent or real-world legal causation.',
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeInvestigation.id}_investigation_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (evidenceRecords.length === 0) return;
    const headers = ['EventID', 'Timestamp', 'Platform', 'AuthorID', 'Topic', 'Sentiment', 'Emotion', 'Text', 'SHA256Hash'];
    const rows = evidenceRecords.map((e) => [
      e.id,
      e.timestamp,
      e.platform,
      e.authorId,
      `"${e.topic}"`,
      e.sentiment,
      e.emotion,
      `"${e.text.replace(/"/g, '""')}"`,
      e.evidenceHash,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeInvestigation?.id || 'investigation'}_evidence.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Investigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-900 font-bold">
              {activeInvestigation?.id || 'INV-NONE'}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">
              Created: {activeInvestigation ? new Date(activeInvestigation.createdAt).toLocaleDateString() : ''}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-900 mt-0.5">
            Narrative Investigation & Evidence Dossier
          </h2>
        </div>

        {/* Dossier Selection & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={currentInvestigationId || ''}
            onChange={(e) => setCurrentInvestigationId(e.target.value)}
            className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
          >
            {investigations.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.id}: {inv.title.slice(0, 30)}...
              </option>
            ))}
          </select>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-slate-500" />
            <span>New Dossier</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-white transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Dossier</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="rounded bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Investigation dossier successfully updated and saved to storage.</span>
        </div>
      )}

      {/* Dossier Metadata Config */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1 font-medium">
              Investigation Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1 font-medium">
              Target Narrative Vector
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none"
            >
              {allTopics.map((top) => (
                <option key={top} value={top}>
                  {top}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1 font-medium">
            Focus Keywords (comma-separated)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Row 1: Before & After Inflection Split Analysis */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Split className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-900">
                Comparative Before & After Inflection Analysis
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Split timeline at an incident or leak timestamp to measure velocity and sentiment divergence
            </p>
          </div>

          {/* Inflection Split Hour Selector */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Inflection Point:</span>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-2.5 py-1">
              <input
                type="range"
                min="6"
                max="66"
                step="3"
                value={splitHour}
                onChange={(e) => setSplitHour(Number(e.target.value))}
                className="w-24 accent-slate-900 cursor-pointer"
              />
              <span className="font-bold text-slate-900">T+{splitHour}h</span>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phase 1: Before Split */}
          <div className="rounded border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-800 font-mono">
                Phase A: Prior to T+{splitHour}h
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Baseline Phase</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div>
                <span className="text-slate-500 text-[10px] block">Volume Logged</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {beforeStats.count} events
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Valence Score</span>
                <span
                  className={`text-base font-bold tabular-nums ${
                    beforeStats.avgScore > 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {beforeStats.avgScore > 0 ? `+${beforeStats.avgScore}` : beforeStats.avgScore}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Sentiment Distribution</span>
                <span className="text-slate-700 text-[11px]">
                  {beforeStats.posPct}% Pos · {beforeStats.negPct}% Neg
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Primary Community</span>
                <span className="text-slate-700 text-[11px] truncate block font-sans">
                  {beforeStats.topCluster.split(':')[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Phase 2: After Split */}
          <div className="rounded border border-slate-300 bg-slate-50/60 p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-900 font-mono">
                Phase B: Post T+{splitHour}h Inflection
              </span>
              <span className="text-[10px] text-slate-700 font-mono font-bold">Surge Phase</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div>
                <span className="text-slate-500 text-[10px] block">Volume Logged</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {afterStats.count} events
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Valence Score</span>
                <span
                  className={`text-base font-bold tabular-nums ${
                    afterStats.avgScore > 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {afterStats.avgScore > 0 ? `+${afterStats.avgScore}` : afterStats.avgScore}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Sentiment Distribution</span>
                <span className="text-slate-700 text-[11px]">
                  {afterStats.posPct}% Pos · {afterStats.negPct}% Neg
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Primary Amplification</span>
                <span className="text-slate-900 text-[11px] truncate block font-sans font-medium">
                  {afterStats.topCluster.split(':')[0]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Delta Callout */}
        <div className="mt-3 rounded bg-white border border-slate-200 px-3 py-2 text-xs font-mono flex items-center justify-between text-slate-700">
          <span>
            Inflection Shift: Volume{' '}
            <strong className="text-slate-900">
              {beforeStats.count > 0 ? Math.round(((afterStats.count - beforeStats.count) / beforeStats.count) * 100) : 0}%
            </strong>
          </span>
          <span>
            Valence Delta:{' '}
            <strong
              className={afterStats.avgScore < beforeStats.avgScore ? 'text-rose-700' : 'text-emerald-700'}
            >
              {(afterStats.avgScore - beforeStats.avgScore).toFixed(2)}
            </strong>
          </span>
        </div>
      </div>

      {/* Row 2: Evidence-Based Findings (Observed Facts vs Model Interpretations vs Hypotheses) */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Structured Investigative Findings
          </h3>
          <p className="text-xs text-slate-500">
            Strict separation between observed empirical facts, model-generated diagnostics, and investigator hypotheses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Observed Facts */}
          <div className="rounded border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                1. Observed Facts (Empirical)
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {observedFacts.map((fact, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-slate-400 font-mono text-[10px] shrink-0 mt-0.5">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Model Interpretations */}
          <div className="rounded border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                2. Model Interpretations (Algorithmic)
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {modelInterpretations.map((interp, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-slate-400 font-mono text-[10px] shrink-0 mt-0.5">•</span>
                  <span>{interp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Hypotheses */}
          <div className="rounded border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                3. Hypotheses (To Verify)
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {hypotheses.map((hyp, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-slate-400 font-mono text-[10px] shrink-0 mt-0.5">•</span>
                  <span>{hyp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Analyst Notes */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1 font-medium">
            Investigator Notes & Forward Guidance
          </label>
          <textarea
            rows={2}
            value={analystNotes}
            onChange={(e) => setAnalystNotes(e.target.value)}
            className="w-full rounded border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none font-sans"
          />
        </div>
      </div>

      {/* Row 3: Supporting Cryptographic Evidence Locker */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Supporting Evidence Locker & Provenance
            </h3>
            <p className="text-xs text-slate-500">
              Individual social posts referenced as evidentiary grounding with immutable SHA-256 signatures
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {evidenceRecords.length} Grounding Records
          </span>
        </div>

        <div className="space-y-2.5">
          {evidenceRecords.map((ev) => (
            <div
              key={ev.id}
              onClick={() => setSelectedPostForModal(ev)}
              className="cursor-pointer rounded border border-slate-200 bg-slate-50/50 p-3 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-mono mb-1 text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 font-semibold">{ev.id}</span>
                  <span>·</span>
                  <span className="text-slate-600">{ev.platform}</span>
                  <span>·</span>
                  <span>{ev.authorId}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-800 font-sans">{ev.text}</p>

              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-200">
                <span className="truncate max-w-md">SHA-256: {ev.evidenceHash}</span>
                <span className="text-slate-700 font-sans font-medium hover:text-slate-900">Inspect Record →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 text-slate-900 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Export Investigation Dossier</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Download the complete verified intelligence report for <strong>{title}</strong>.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  handleExportJSON();
                  setShowExportModal(false);
                }}
                className="w-full flex items-center justify-between rounded border border-slate-200 bg-white p-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    Download Full Structured JSON Dossier
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Includes all findings, metric summaries, and complete cryptographic hash chain signatures.
                  </div>
                </div>
                <Download className="h-4 w-4 text-slate-600" />
              </button>

              <button
                onClick={() => {
                  handleExportCSV();
                  setShowExportModal(false);
                }}
                className="w-full flex items-center justify-between rounded border border-slate-200 bg-white p-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    Download Evidence CSV Table
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Tabular export of all linked supporting evidence posts with SHA-256 hashes.
                  </div>
                </div>
                <Download className="h-4 w-4 text-slate-600" />
              </button>

              <button
                onClick={() => {
                  setShowExportModal(false);
                  window.print();
                }}
                className="w-full flex items-center justify-between rounded border border-slate-200 bg-white p-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    Print-Friendly Executive Report (PDF)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Formats the current view for clean high-fidelity PDF printing or export.
                  </div>
                </div>
                <Printer className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
