import { Investigation } from '../types';

export const INITIAL_INVESTIGATIONS: Investigation[] = [
  {
    id: 'INV-2026-0881',
    title: 'Rapid Disinformation Cascade: Synthetic Election Audio Outbreak',
    topic: 'Deepfake Election Rumors',
    createdAt: '2026-09-30T07:15:00Z',
    keywords: ['deepfake', 'election', 'audio leak', 'tampering', 'deception', 'bot'],
    timeWindow: {
      startMs: 1774771200000,
      endMs: 1774771200000 + 72 * 3600000,
    },
    splitTimestampMs: 1774771200000 + 48 * 3600000, // Hour 48 inflection point
    findings: {
      observedFacts: [
        'Post volume accelerated from a dormant 0.35 posts/hour (Hours 0-47) to 22.8 posts/hour (Hours 48-71), representing a 6,400% volume surge.',
        'Telegram and X/Twitter accounted for 78% of the initial propagation velocity during the first 6 hours post-inflection.',
        'Primary seed nodes traced to Cluster-Delta and Cluster-Beta pseudonymous accounts with high repost-to-original ratios (3.2x baseline).',
        'Cryptographic hashes of original audio excerpts show matching fingerprint fragments circulated across 42 distinct thread branches.',
      ],
      modelInterpretations: [
        'Lexical sentiment shifted sharply to 85% negative with peak emotional resonance split between Fear (58%) and Anger (29%).',
        'High amplification velocity suggests semi-automated distribution or organized cross-platform relay brigading.',
        'Baseline fact-checking rebuttals lagged the initial dissemination burst by an estimated 8.5 hours.',
      ],
      hypotheses: [
        'Hypothesis 1: The timing of the release at T+48h was coordinated to maximize engagement ahead of the weekend news cycle.',
        'Hypothesis 2: Cluster-Delta nodes acted as coordinated relays rather than organic grassroots discussion participants.',
      ],
    },
    evidenceIds: ['evt-00850', 'evt-00855', 'evt-00862', 'evt-00890', 'evt-00920'],
    summaryMetrics: {
      totalEvents: 420,
      dominantSentiment: 'negative',
      peakEmotion: 'fear',
      topPlatform: 'Telegram',
      primaryCommunity: 'Cluster-Delta: Fringe Skeptics & Amplifiers',
      viralityRatio: 4.8,
    },
    analystNotes:
      'Recommend continuous automated ingestion of Telegram bridge channels and cross-referencing audio spectrograph hashes against verified media registries.',
    status: 'active',
  },
  {
    id: 'INV-2026-0882',
    title: 'Sentiment Inversion Analysis: Autonomous Vehicle Perception Incident',
    topic: 'Autonomous Vehicle Safety',
    createdAt: '2026-09-29T18:40:00Z',
    keywords: ['autonomous vehicle', 'crash', 'safety', 'sensor', 'lidar', 'investigation'],
    timeWindow: {
      startMs: 1774771200000,
      endMs: 1774771200000 + 72 * 3600000,
    },
    splitTimestampMs: 1774771200000 + 36 * 3600000, // Hour 36 inflection point
    findings: {
      observedFacts: [
        'Before Hour 36, topic discussion maintained an 80% positive sentiment score (+0.68 avg valence) centered on zero-accident milestones.',
        'At Hour 36, a breaking accident report occurred, triggering an immediate 12x volume spike within a 60-minute window.',
        'Post-inflection sentiment collapsed to 82% negative (-0.72 avg valence) with Anger replacing Joy as the dominant emotional vector.',
        'Cluster-Alpha (Tech & Policy) experienced a 4-hour delay before engaging in technical sensor post-mortem commentary.',
      ],
      modelInterpretations: [
        'Sentiment inversion followed a textbook asymmetric trust loss curve: positive trust accumulated over 36 hours eroded within 120 minutes.',
        'Media mentions on Reddit and YouTube exhibited significantly longer comment thread depth than initial X posts.',
      ],
      hypotheses: [
        'Hypothesis 1: Regulatory calls for testing bans were catalyzed primarily by municipal safety advocate accounts rather than general public accounts.',
        'Hypothesis 2: Tone will stabilize as formal federal transportation telemetry releases provide empirical sensor crash data.',
      ],
    },
    evidenceIds: ['evt-00480', 'evt-00485', 'evt-00492', 'evt-00510'],
    summaryMetrics: {
      totalEvents: 380,
      dominantSentiment: 'negative',
      peakEmotion: 'anger',
      topPlatform: 'Reddit',
      primaryCommunity: 'Cluster-Beta: Citizen Watchdogs',
      viralityRatio: 3.4,
    },
    analystNotes:
      'Compare this incident trajectory against prior historic industrial transport crises to forecast sentiment recovery half-life.',
    status: 'active',
  },
];
