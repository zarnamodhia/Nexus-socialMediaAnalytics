import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { generateDeterministicDataset } from '../data/mockDataGenerator';
import { INITIAL_INVESTIGATIONS } from '../data/sampleInvestigations';
import {
  GlobalFilters,
  HashChainVerificationResult,
  Investigation,
  NavigationPage,
  Platform,
  SiteSection,
  SocialEvent,
  SourceType,
} from '../types';
import { computeEventHash, verifyHashChain } from '../utils/crypto';
import { classifyText } from '../utils/nlp';

interface DataContextType {
  events: SocialEvent[];
  filteredEvents: SocialEvent[];
  filters: GlobalFilters;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
  updateFilter: <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => void;
  resetFilters: () => void;
  activeFilterCount: number;

  activePage: NavigationPage;
  setActivePage: (page: NavigationPage) => void;

  siteSection: SiteSection;
  setSiteSection: (section: SiteSection) => void;
  navigateToTerminal: (page?: NavigationPage) => void;

  selectedPostForModal: SocialEvent | null;
  setSelectedPostForModal: (post: SocialEvent | null) => void;

  investigations: Investigation[];
  currentInvestigationId: string | null;
  setCurrentInvestigationId: (id: string | null) => void;
  saveInvestigation: (inv: Investigation) => void;
  deleteInvestigation: (id: string) => void;
  launchInvestigationForTopic: (topic: string) => void;

  dataSourceMode: SourceType;
  importStats: { total: number; valid: number; rejected: number; errors: string[] } | null;
  importData: (rawContent: string, format: 'json' | 'csv') => boolean;
  resetToDemoData: () => void;

  simulateTampering: (targetEventId?: string) => string | null;
  restoreRecord: (targetEventId?: string) => void;
  verifyChainIntegrity: () => HashChainVerificationResult;
  integrityResult: HashChainVerificationResult | null;

  allTopics: string[];
  allPlatforms: Platform[];
  allCommunities: string[];
  minTimestampMs: number;
  maxTimestampMs: number;

  databaseStatus: {
    status: 'connected' | 'unconfigured' | 'error';
    orm: string;
    provider: string;
    counts?: { events: number; investigations: number };
    error?: string | null;
  } | null;
  isDatabaseModalOpen: boolean;
  setIsDatabaseModalOpen: (open: boolean) => void;
  checkDatabaseStatus: () => Promise<void>;
  syncToDatabase: () => Promise<{ success: boolean; count?: number; error?: string }>;
}

const DEFAULT_FILTERS: GlobalFilters = {
  searchQuery: '',
  platforms: [],
  topics: [],
  sentiments: [],
  emotions: [],
  languages: [],
  authorQuery: '',
  dateRange: null,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Core Event State (Demo data initialized deterministically)
  const [initialDemo] = useState<SocialEvent[]>(() => generateDeterministicDataset());
  const [events, setEvents] = useState<SocialEvent[]>(initialDemo);
  const [backupEvents, setBackupEvents] = useState<SocialEvent[]>(initialDemo);

  // 2. Global Filters State
  const [filters, setFilters] = useState<GlobalFilters>(DEFAULT_FILTERS);

  // 3. Navigation & Modal State
  const [activePage, setActivePage] = useState<NavigationPage>('overview');
  const [siteSection, setSiteSection] = useState<SiteSection>('home');
  const [selectedPostForModal, setSelectedPostForModal] = useState<SocialEvent | null>(null);

  const navigateToTerminal = (page?: NavigationPage) => {
    setSiteSection('terminal');
    if (page) {
      setActivePage(page);
    }
  };

  // 4. Investigations State
  const [investigations, setInvestigations] = useState<Investigation[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_investigations');
      return saved ? JSON.parse(saved) : INITIAL_INVESTIGATIONS;
    } catch {
      return INITIAL_INVESTIGATIONS;
    }
  });
  const [currentInvestigationId, setCurrentInvestigationId] = useState<string | null>('INV-2026-0881');

  // 5. Data Sources & Verification State
  const [dataSourceMode, setDataSourceMode] = useState<SourceType>('DEMO');
  const [importStats, setImportStats] = useState<{
    total: number;
    valid: number;
    rejected: number;
    errors: string[];
  } | null>(null);
  const [integrityResult, setIntegrityResult] = useState<HashChainVerificationResult | null>(null);

  // 6. Supabase & Prisma ORM State
  const [databaseStatus, setDatabaseStatus] = useState<{
    status: 'connected' | 'unconfigured' | 'error';
    orm: string;
    provider: string;
    counts?: { events: number; investigations: number };
    error?: string | null;
  } | null>(null);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);

  const checkDatabaseStatus = async () => {
    try {
      const res = await fetch('/api/database/status');
      if (res.ok) {
        const data = await res.json();
        setDatabaseStatus(data);
        if (data.status === 'connected') {
          setDataSourceMode('LIVE');
          // Fetch events from Supabase via Prisma
          try {
            const evRes = await fetch('/api/events?limit=2000');
            if (evRes.ok) {
              const evData = await evRes.json();
              if (Array.isArray(evData.events) && evData.events.length > 0) {
                setEvents(evData.events);
                setBackupEvents(evData.events);
              }
            }
          } catch (e) {
            console.warn('Could not fetch events from DB', e);
          }

          // Fetch investigations from Supabase via Prisma
          try {
            const invRes = await fetch('/api/investigations');
            if (invRes.ok) {
              const invData = await invRes.json();
              if (Array.isArray(invData.investigations) && invData.investigations.length > 0) {
                setInvestigations(invData.investigations);
              }
            }
          } catch (e) {
            console.warn('Could not fetch investigations from DB', e);
          }
        }
      }
    } catch (e) {
      console.warn('Backend database status check unavailable in current mode', e);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const syncToDatabase = async (): Promise<{ success: boolean; count?: number; error?: string }> => {
    try {
      const res = await fetch('/api/events/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Sync failed' };
      }
      await checkDatabaseStatus();
      return { success: true, count: data.count };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network request failed' };
    }
  };

  // Sync investigations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nexus_investigations', JSON.stringify(investigations));
    } catch (e) {
      console.warn('Failed to persist investigations to localStorage', e);
    }
  }, [investigations]);

  // Derived metadata from current dataset
  const { allTopics, allPlatforms, allCommunities, minTimestampMs, maxTimestampMs } = useMemo(() => {
    const topicsSet = new Set<string>();
    const platformsSet = new Set<Platform>();
    const communitiesSet = new Set<string>();
    let minTs = Infinity;
    let maxTs = -Infinity;

    events.forEach((ev) => {
      topicsSet.add(ev.topic);
      platformsSet.add(ev.platform);
      communitiesSet.add(ev.authorCluster);
      if (ev.timestampMs < minTs) minTs = ev.timestampMs;
      if (ev.timestampMs > maxTs) maxTs = ev.timestampMs;
    });

    return {
      allTopics: Array.from(topicsSet).sort(),
      allPlatforms: Array.from(platformsSet),
      allCommunities: Array.from(communitiesSet).sort(),
      minTimestampMs: minTs === Infinity ? 0 : minTs,
      maxTimestampMs: maxTs === -Infinity ? Date.now() : maxTs,
    };
  }, [events]);

  // Calculate active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery.trim()) count++;
    if (filters.platforms.length > 0) count += filters.platforms.length;
    if (filters.topics.length > 0) count += filters.topics.length;
    if (filters.sentiments.length > 0) count += filters.sentiments.length;
    if (filters.emotions.length > 0) count += filters.emotions.length;
    if (filters.languages.length > 0) count += filters.languages.length;
    if (filters.authorQuery.trim()) count++;
    if (filters.dateRange !== null) count++;
    return count;
  }, [filters]);

  // Unified Filter pipeline: updates every chart, metric, and table across all pages
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // 1. Keyword search
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesText = ev.text.toLowerCase().includes(query);
        const matchesTopic = ev.topic.toLowerCase().includes(query);
        const matchesAuthor = ev.authorId.toLowerCase().includes(query);
        if (!matchesText && !matchesTopic && !matchesAuthor) return false;
      }

      // 2. Author query
      if (filters.authorQuery.trim()) {
        if (!ev.authorId.toLowerCase().includes(filters.authorQuery.toLowerCase())) return false;
      }

      // 3. Platform filter
      if (filters.platforms.length > 0) {
        if (!filters.platforms.includes(ev.platform)) return false;
      }

      // 4. Topic filter
      if (filters.topics.length > 0) {
        if (!filters.topics.includes(ev.topic)) return false;
      }

      // 5. Sentiment filter
      if (filters.sentiments.length > 0) {
        if (!filters.sentiments.includes(ev.sentiment)) return false;
      }

      // 6. Emotion filter
      if (filters.emotions.length > 0) {
        if (!filters.emotions.includes(ev.emotion)) return false;
      }

      // 7. Language filter
      if (filters.languages.length > 0) {
        if (!filters.languages.includes(ev.language)) return false;
      }

      // 8. Date range filter
      if (filters.dateRange) {
        if (ev.timestampMs < filters.dateRange.startMs || ev.timestampMs > filters.dateRange.endMs) {
          return false;
        }
      }

      return true;
    });
  }, [events, filters]);

  const updateFilter = <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const launchInvestigationForTopic = (topic: string) => {
    // Find or create an investigation for this topic
    const existing = investigations.find((inv) => inv.topic === topic);
    if (existing) {
      setCurrentInvestigationId(existing.id);
    } else {
      const newId = `INV-${Date.now().toString().slice(-4)}`;
      const topicEvents = events.filter((e) => e.topic === topic);
      const newInv: Investigation = {
        id: newId,
        title: `Deep-Dive Investigation: ${topic}`,
        topic,
        createdAt: new Date().toISOString(),
        keywords: [topic.toLowerCase()],
        timeWindow: {
          startMs: minTimestampMs,
          endMs: maxTimestampMs,
        },
        splitTimestampMs: minTimestampMs + (maxTimestampMs - minTimestampMs) * 0.5,
        findings: {
          observedFacts: [
            `Total volume captured: ${topicEvents.length} events across ${allPlatforms.length} monitored platforms.`,
            `Primary amplification cluster identified as ${topicEvents[0]?.authorCluster || 'Multi-cluster'}.`,
          ],
          modelInterpretations: [
            `Lexical classification indicates ${topicEvents.filter((e) => e.sentiment === 'negative').length} negative posts vs ${topicEvents.filter((e) => e.sentiment === 'positive').length} positive posts.`,
          ],
          hypotheses: ['Evaluate network relay velocity and compare against cross-platform benchmark curves.'],
        },
        evidenceIds: topicEvents.slice(0, 5).map((e) => e.id),
        summaryMetrics: {
          totalEvents: topicEvents.length,
          dominantSentiment: 'neutral',
          peakEmotion: 'neutral',
          topPlatform: 'X/Twitter',
          primaryCommunity: 'Cluster-Alpha: Tech & Policy Experts',
          viralityRatio: 2.1,
        },
        analystNotes: `Automated investigation launched from Trend Explorer for topic "${topic}".`,
        status: 'active',
      };
      setInvestigations((prev) => [newInv, ...prev]);
      setCurrentInvestigationId(newId);
    }
    setSiteSection('terminal');
    setActivePage('investigation');
  };

  const saveInvestigation = async (inv: Investigation) => {
    setInvestigations((prev) => {
      const idx = prev.findIndex((i) => i.id === inv.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = inv;
        return updated;
      }
      return [inv, ...prev];
    });

    if (databaseStatus?.status === 'connected') {
      try {
        await fetch('/api/investigations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inv),
        });
      } catch (err) {
        console.warn('Failed to persist investigation to database', err);
      }
    }
  };

  const deleteInvestigation = async (id: string) => {
    setInvestigations((prev) => prev.filter((i) => i.id !== id));
    if (currentInvestigationId === id) {
      setCurrentInvestigationId(null);
    }

    if (databaseStatus?.status === 'connected') {
      try {
        await fetch(`/api/investigations/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Failed to delete investigation from database', err);
      }
    }
  };

  // Cryptographic Tampering Simulation
  const simulateTampering = (targetEventId?: string): string | null => {
    const targetIdx = targetEventId
      ? events.findIndex((e) => e.id === targetEventId)
      : Math.floor(events.length * 0.45); // Pick a middle record

    if (targetIdx < 0 || targetIdx >= events.length) return null;

    const modified = [...events];
    const target = { ...modified[targetIdx] };

    // Maliciously alter the content or sentiment without recomputing previous hash link
    target.text = target.text + ' [TAMPERED_PAYLOAD_INJECTED_FOR_AUDIT_DEMO]';
    target.sentiment = target.sentiment === 'positive' ? 'negative' : 'positive';
    target.tampered = true;
    modified[targetIdx] = target;

    setEvents(modified);

    // Auto-verify immediately to record the verification state
    const result = verifyHashChain(modified);
    setIntegrityResult(result);
    return target.id;
  };

  // Restore Record to pristine state
  const restoreRecord = (targetEventId?: string) => {
    if (targetEventId) {
      const original = backupEvents.find((e) => e.id === targetEventId);
      if (original) {
        setEvents((prev) => prev.map((e) => (e.id === targetEventId ? { ...original, tampered: false } : e)));
      }
    } else {
      setEvents([...backupEvents]);
    }
    const result = verifyHashChain(backupEvents);
    setIntegrityResult(result);
  };

  // Verify hash chain
  const verifyChainIntegrity = (): HashChainVerificationResult => {
    const result = verifyHashChain(events);
    setIntegrityResult(result);
    return result;
  };

  // Reset to initial demo dataset
  const resetToDemoData = () => {
    const fresh = generateDeterministicDataset();
    setEvents(fresh);
    setBackupEvents(fresh);
    setDataSourceMode('DEMO');
    setImportStats(null);
    const result = verifyHashChain(fresh);
    setIntegrityResult(result);
  };

  // Import CSV or JSON data with schema validation and normalization
  const importData = (rawContent: string, format: 'json' | 'csv'): boolean => {
    const errors: string[] = [];
    const normalizedEvents: SocialEvent[] = [];

    try {
      if (format === 'json') {
        const parsed = JSON.parse(rawContent);
        const rawArray = Array.isArray(parsed) ? parsed : [parsed];

        if (rawArray.length === 0) {
          setImportStats({ total: 0, valid: 0, rejected: 0, errors: ['JSON array is empty.'] });
          return false;
        }

        let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

        rawArray.forEach((item, idx) => {
          const rowNum = idx + 1;
          const text = item.text || item.content || item.postText || '';
          if (!text.trim()) {
            errors.push(`Row ${rowNum}: Missing post text/content.`);
            return;
          }

          const platform: Platform = ['X/Twitter', 'Telegram', 'YouTube', 'Reddit', 'Bluesky'].includes(item.platform)
            ? item.platform
            : 'X/Twitter';
          const authorId = item.authorId || item.author || `@anon_${rowNum.toString().padStart(3, '0')}`;
          const topic = item.topic || 'General Social Discussion';
          const ts = item.timestamp ? new Date(item.timestamp).getTime() : Date.now() - (rawArray.length - idx) * 60000;
          const tsIso = new Date(ts).toISOString();

          // Run transparent NLP classifier for sentiment if missing
          const classification = classifyText(text);
          const sentiment = item.sentiment || classification.sentiment;
          const sentimentScore = typeof item.sentimentScore === 'number' ? item.sentimentScore : classification.normalizedScore;
          const sentimentConfidence = typeof item.sentimentConfidence === 'number' ? item.sentimentConfidence : classification.confidence;
          const emotion = item.emotion || classification.dominantEmotion;

          const eventId = item.id || `imp-${rowNum.toString().padStart(5, '0')}`;

          const evidenceHash = computeEventHash({
            id: eventId,
            previousHash: prevHash,
            timestamp: tsIso,
            platform,
            authorId,
            text,
            topic,
            sentiment,
          });

          normalizedEvents.push({
            id: eventId,
            timestamp: tsIso,
            timestampMs: ts,
            platform,
            authorId,
            authorCluster: item.authorCluster || 'Cluster-Beta: Citizen Watchdogs',
            text,
            language: item.language || 'en',
            topic,
            sentiment,
            sentimentScore,
            sentimentConfidence,
            emotion,
            relationship: item.relationship || 'original',
            parentEventId: item.parentEventId || null,
            engagement: {
              likes: item.engagement?.likes || item.likes || 12,
              reposts: item.engagement?.reposts || item.reposts || 4,
              comments: item.engagement?.comments || item.comments || 2,
              views: item.engagement?.views || item.views || 250,
            },
            communityId: item.communityId || 'Cluster-Beta',
            sourceType: 'IMPORTED',
            evidenceHash,
            previousHash: prevHash,
          });

          prevHash = evidenceHash;
        });
      } else {
        // CSV Parsing
        const lines = rawContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setImportStats({ total: 0, valid: 0, rejected: 0, errors: ['CSV file contains no data rows.'] });
          return false;
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
        const textIdx = headers.findIndex((h) => h.includes('text') || h.includes('content') || h.includes('post'));
        const authorIdx = headers.findIndex((h) => h.includes('author') || h.includes('user'));
        const platformIdx = headers.findIndex((h) => h.includes('platform'));
        const topicIdx = headers.findIndex((h) => h.includes('topic'));

        if (textIdx === -1) {
          setImportStats({
            total: lines.length - 1,
            valid: 0,
            rejected: lines.length - 1,
            errors: ['CSV missing required column: "text" or "content". Headers detected: ' + headers.join(', ')],
          });
          return false;
        }

        let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

        for (let i = 1; i < lines.length; i++) {
          const rowNum = i;
          // Simple CSV line split with quote handling
          const line = lines[i];
          const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((p) => p.trim().replace(/^"|"$/g, ''));
          const text = parts[textIdx] || '';

          if (!text.trim()) {
            errors.push(`Row ${rowNum}: Empty text field.`);
            continue;
          }

          const authorId = authorIdx >= 0 && parts[authorIdx] ? parts[authorIdx] : `@csv_author_${rowNum}`;
          const rawPlatform = platformIdx >= 0 && parts[platformIdx] ? parts[platformIdx] : 'X/Twitter';
          const platform: Platform = ['X/Twitter', 'Telegram', 'YouTube', 'Reddit', 'Bluesky'].includes(rawPlatform as Platform)
            ? (rawPlatform as Platform)
            : 'X/Twitter';
          const topic = topicIdx >= 0 && parts[topicIdx] ? parts[topicIdx] : 'Imported Analysis Stream';
          const ts = Date.now() - (lines.length - i) * 120000;
          const tsIso = new Date(ts).toISOString();

          const classification = classifyText(text);
          const eventId = `csv-${rowNum.toString().padStart(5, '0')}`;

          const evidenceHash = computeEventHash({
            id: eventId,
            previousHash: prevHash,
            timestamp: tsIso,
            platform,
            authorId,
            text,
            topic,
            sentiment: classification.sentiment,
          });

          normalizedEvents.push({
            id: eventId,
            timestamp: tsIso,
            timestampMs: ts,
            platform,
            authorId,
            authorCluster: 'Cluster-Beta: Citizen Watchdogs',
            text,
            language: 'en',
            topic,
            sentiment: classification.sentiment,
            sentimentScore: classification.normalizedScore,
            sentimentConfidence: classification.confidence,
            emotion: classification.dominantEmotion,
            relationship: 'original',
            parentEventId: null,
            engagement: { likes: 10, reposts: 2, comments: 1, views: 180 },
            communityId: 'Cluster-Beta',
            sourceType: 'IMPORTED',
            evidenceHash,
            previousHash: prevHash,
          });

          prevHash = evidenceHash;
        }
      }

      setImportStats({
        total: normalizedEvents.length + errors.length,
        valid: normalizedEvents.length,
        rejected: errors.length,
        errors,
      });

      if (normalizedEvents.length > 0) {
        setEvents(normalizedEvents);
        setBackupEvents(normalizedEvents);
        setDataSourceMode('IMPORTED');
        const verification = verifyHashChain(normalizedEvents);
        setIntegrityResult(verification);
        return true;
      }
      return false;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown parsing error';
      setImportStats({
        total: 0,
        valid: 0,
        rejected: 0,
        errors: [`Failed to parse file: ${errMsg}`],
      });
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        events,
        filteredEvents,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        activeFilterCount,
        activePage,
        setActivePage,
        siteSection,
        setSiteSection,
        navigateToTerminal,
        selectedPostForModal,
        setSelectedPostForModal,
        investigations,
        currentInvestigationId,
        setCurrentInvestigationId,
        saveInvestigation,
        deleteInvestigation,
        launchInvestigationForTopic,
        dataSourceMode,
        importStats,
        importData,
        resetToDemoData,
        simulateTampering,
        restoreRecord,
        verifyChainIntegrity,
        integrityResult,
        allTopics,
        allPlatforms,
        allCommunities,
        minTimestampMs,
        maxTimestampMs,
        databaseStatus,
        isDatabaseModalOpen,
        setIsDatabaseModalOpen,
        checkDatabaseStatus,
        syncToDatabase,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
