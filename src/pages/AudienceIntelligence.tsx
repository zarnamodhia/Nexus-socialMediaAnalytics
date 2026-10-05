import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Users,
  Globe,
  Info,
} from 'lucide-react';
import { COMMUNITIES, PLATFORMS } from '../data/mockDataGenerator';

export const AudienceIntelligence: React.FC = () => {
  const { filteredEvents, updateFilter, setSelectedPostForModal } = useData();

  const [selectedClusterId, setSelectedClusterId] = useState<string>('all');

  // 1. Community Cluster Analytics
  const clusterStats = useMemo(() => {
    return COMMUNITIES.map((c) => {
      const clusterEvents = filteredEvents.filter((e) => e.communityId === c.id);
      const uniqueAuthors = new Set(clusterEvents.map((e) => e.authorId)).size;
      const totalLikes = clusterEvents.reduce((s, e) => s + e.engagement.likes, 0);
      const totalReposts = clusterEvents.reduce((s, e) => s + e.engagement.reposts, 0);

      // Top topic for this cluster
      const topicCounts = new Map<string, number>();
      clusterEvents.forEach((e) => {
        topicCounts.set(e.topic, (topicCounts.get(e.topic) || 0) + 1);
      });
      const topTopic = Array.from(topicCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

      return {
        ...c,
        eventCount: clusterEvents.length,
        authorCount: uniqueAuthors,
        totalLikes,
        totalReposts,
        avgEngagement: clusterEvents.length > 0 ? Math.round((totalLikes + totalReposts * 2) / clusterEvents.length) : 0,
        topTopic,
      };
    });
  }, [filteredEvents]);

  // 2. Language Breakdown
  const languageStats = useMemo(() => {
    const counts = new Map<string, number>();
    filteredEvents.forEach((e) => {
      counts.set(e.language, (counts.get(e.language) || 0) + 1);
    });

    const total = Math.max(1, filteredEvents.length);
    const names: Record<string, string> = {
      en: 'English (en)',
      es: 'Spanish (es)',
      fr: 'French (fr)',
      de: 'German (de)',
      hi: 'Hindi (hi)',
    };

    return Array.from(counts.entries())
      .map(([lang, count]) => ({
        code: lang,
        name: names[lang] || lang,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredEvents]);

  // 3. Platform Affinity by Cluster Matrix
  const platformAffinity = useMemo(() => {
    return COMMUNITIES.map((c) => {
      const clusterEvents = filteredEvents.filter((e) => e.communityId === c.id);
      const total = Math.max(1, clusterEvents.length);

      const platformsMap: Record<string, number> = {};
      PLATFORMS.forEach((p) => {
        const count = clusterEvents.filter((e) => e.platform === p).length;
        platformsMap[p] = Math.round((count / total) * 100);
      });

      return {
        clusterId: c.id,
        clusterName: c.name.split(':')[0],
        totalEvents: clusterEvents.length,
        platforms: platformsMap,
      };
    });
  }, [filteredEvents]);

  // 4. Active Pseudonymous Nodes in selected cluster
  const activeNodes = useMemo(() => {
    const eventsToUse =
      selectedClusterId === 'all'
        ? filteredEvents
        : filteredEvents.filter((e) => e.communityId === selectedClusterId);

    const authorMap = new Map<
      string,
      { authorId: string; cluster: string; count: number; totalViews: number; samplePost: string }
    >();

    eventsToUse.forEach((e) => {
      if (!authorMap.has(e.authorId)) {
        authorMap.set(e.authorId, {
          authorId: e.authorId,
          cluster: e.authorCluster,
          count: 0,
          totalViews: 0,
          samplePost: e.text,
        });
      }
      const entry = authorMap.get(e.authorId)!;
      entry.count++;
      entry.totalViews += e.engagement.views;
    });

    return Array.from(authorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [filteredEvents, selectedClusterId]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Audience & Community Cluster Intelligence
          </h2>
          <p className="text-xs text-slate-500">
            Structural community grouping, language distribution, and platform affinity without invasive profiling
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">Analyzed Nodes:</span>
          <span className="font-bold text-slate-900">120 Pseudonyms</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500">5 Distinct Clusters</span>
        </div>
      </div>

      {/* Mandatory Privacy & Responsible Demographics Disclosure */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-900 block">
              Ethical Data Policy: Zero Invasive Demographic Inference
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              NEXUS strictly adheres to responsible intelligence standards. This platform does not infer or fabricate
              real-world biological age, gender, ethnicity, religious beliefs, or private coordinates. All audience groupings
              represent <strong>structural behavioral clusters</strong> derived from observed public communication topology.
            </p>
          </div>
        </div>
      </div>

      {/* Row 1: The 5 Behavioral Community Clusters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {clusterStats.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedClusterId(selectedClusterId === c.id ? 'all' : c.id)}
            className={`cursor-pointer rounded-lg border p-4 transition-all ${
              selectedClusterId === c.id
                ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider mb-1">
              {c.id}
            </div>
            <h3 className="text-xs font-semibold text-slate-900 line-clamp-1">{c.name.split(':')[1]}</h3>
            <p className="text-[11px] text-slate-500 mt-1 mb-3">Focus: {c.focus}</p>

            <div className="space-y-1.5 pt-2 border-t border-slate-200 text-[11px] font-mono">
              <div className="flex justify-between text-slate-700">
                <span className="text-slate-400">Nodes:</span>
                <span className="font-bold tabular-nums">{c.authorCount}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="text-slate-400">Events:</span>
                <span className="font-bold tabular-nums">{c.eventCount}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="text-slate-400">Avg Eng.:</span>
                <span className="text-slate-900 font-bold tabular-nums">{c.avgEngagement}</span>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-slate-500 truncate pt-1 border-t border-slate-100">
              Primary: <strong className="text-slate-700 font-medium">{c.topTopic}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Platform Affinity Matrix & Language Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Platform Affinity Heatmap Matrix */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Platform Affinity by Community Cluster
              </h3>
              <p className="text-xs text-slate-500">
                Percentage of community communication distributed across supported social protocols
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">% Affinity</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500 bg-slate-50">
                  <th className="py-2 px-3 font-medium">Community Cluster</th>
                  {PLATFORMS.map((p) => (
                    <th key={p} className="py-2 px-3 font-medium text-right">
                      {p.replace('/Twitter', '')}
                    </th>
                  ))}
                  <th className="py-2 px-3 font-medium text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {platformAffinity.map((row) => (
                  <tr key={row.clusterId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                      {row.clusterName}
                    </td>
                    {PLATFORMS.map((p) => {
                      const val = row.platforms[p] || 0;
                      return (
                        <td key={p} className="py-2.5 px-3 text-right tabular-nums">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                              val > 35
                                ? 'bg-slate-900 text-white'
                                : val > 15
                                ? 'text-slate-800 font-medium'
                                : 'text-slate-400'
                            }`}
                          >
                            {val}%
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums">
                      {row.totalEvents}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Language Distribution */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Language Demographics</h3>
            <Globe className="h-4 w-4 text-slate-500" />
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Polyglot narrative monitoring across international language streams.
          </p>

          <div className="space-y-3">
            {languageStats.map((item) => (
              <div
                key={item.code}
                onClick={() => updateFilter('languages', [item.code])}
                className="cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                    {item.name}
                  </span>
                  <span className="font-mono text-slate-500 tabular-nums">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${item.pct}%` }}
                    className="h-full bg-slate-700 group-hover:bg-slate-900 transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Pseudonymous Author Directory */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              High-Connectivity Pseudonymous Node Directory
            </h3>
            <p className="text-xs text-slate-500">
              Filtered by cluster: <strong className="text-slate-800">{selectedClusterId}</strong>
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Top {activeNodes.length} active nodes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500 bg-slate-50">
                <th className="py-2 px-3 font-medium">Node ID</th>
                <th className="py-2 px-3 font-medium">Community Cluster</th>
                <th className="py-2 px-3 font-medium text-right">Events Authored</th>
                <th className="py-2 px-3 font-medium text-right">Total Reach</th>
                <th className="py-2 px-3 font-medium">Sample Content Excerpt</th>
                <th className="py-2 px-3 font-medium text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeNodes.map((node) => (
                <tr key={node.authorId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-900 font-semibold">{node.authorId}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-sans">{node.cluster}</td>
                  <td className="py-2.5 px-3 text-right text-slate-900 font-bold tabular-nums">
                    {node.count}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums">
                    {node.totalViews.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 max-w-xs truncate pr-2">
                    {node.samplePost}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <button
                      onClick={() => updateFilter('authorQuery', node.authorId)}
                      className="text-slate-700 hover:text-slate-900 font-medium"
                    >
                      Filter Node →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
