export type Platform = 'X/Twitter' | 'Telegram' | 'YouTube' | 'Reddit' | 'Bluesky';

export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export type EmotionLabel = 'joy' | 'anger' | 'fear' | 'sadness' | 'surprise' | 'neutral';

export type RelationshipType = 'original' | 'reply' | 'repost';

export type SourceType = 'DEMO' | 'IMPORTED' | 'LIVE';

export interface EngagementMetrics {
  likes: number;
  reposts: number;
  comments: number;
  views: number;
}

export interface SocialEvent {
  id: string;
  timestamp: string; // ISO 8601 string
  timestampMs: number;
  platform: Platform;
  authorId: string; // Pseudonymous identifier e.g. @node_742
  authorCluster: string; // e.g. "Cluster-Alpha: Tech & Policy"
  text: string;
  language: string; // 'en' | 'es' | 'fr' | 'de' | 'hi'
  topic: string;
  sentiment: SentimentLabel;
  sentimentScore: number; // -1.0 (very negative) to +1.0 (very positive)
  sentimentConfidence: number; // 0.50 to 0.99
  emotion: EmotionLabel;
  relationship: RelationshipType;
  parentEventId: string | null;
  engagement: EngagementMetrics;
  communityId: string; // e.g. "Cluster-Alpha"
  sourceType: SourceType;
  evidenceHash: string; // SHA-256 hash of (previousHash + payload)
  previousHash: string; // previous record hash for tamper-evident chain
  tampered?: boolean;
}

export interface GlobalFilters {
  searchQuery: string;
  platforms: Platform[];
  topics: string[];
  sentiments: SentimentLabel[];
  emotions: EmotionLabel[];
  languages: string[];
  authorQuery: string;
  dateRange: {
    startMs: number;
    endMs: number;
  } | null;
}

export interface InvestigationFindings {
  observedFacts: string[];
  modelInterpretations: string[];
  hypotheses: string[];
}

export interface Investigation {
  id: string;
  title: string;
  topic: string;
  createdAt: string;
  keywords: string[];
  timeWindow: {
    startMs: number;
    endMs: number;
  };
  splitTimestampMs: number; // For before / after inflection point comparison
  findings: InvestigationFindings;
  evidenceIds: string[];
  summaryMetrics: {
    totalEvents: number;
    dominantSentiment: SentimentLabel;
    peakEmotion: EmotionLabel;
    topPlatform: Platform;
    primaryCommunity: string;
    viralityRatio: number;
  };
  analystNotes: string;
  status: 'active' | 'archived' | 'flagged';
}

export interface HashChainVerificationResult {
  isValid: boolean;
  totalRecords: number;
  verifiedCount: number;
  tamperedIndex: number | null;
  tamperedRecordId: string | null;
  expectedHash?: string;
  computedHash?: string;
  verifiedAt: string;
  elapsedMs: number;
}

export interface TopicTrendMetric {
  topic: string;
  totalVolume: number;
  baselineVolume: number;
  recentVolume: number;
  growthRatePct: number;
  acceleration: number;
  engagementVelocity: number;
  sentimentShift: number; // delta in average sentiment
  trendScore: number;
  classification: 'emerging' | 'growing' | 'saturating' | 'stable';
  dominantEmotion: EmotionLabel;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export type NavigationPage =
  | 'overview'
  | 'timeline'
  | 'sentiment'
  | 'trends'
  | 'audience'
  | 'network'
  | 'investigation'
  | 'evidence'
  | 'sources'
  | 'settings';

export type SiteSection =
  | 'home'
  | 'terminal'
  | 'methodology'
  | 'case-studies'
  | 'api-docs'
  | 'about';

