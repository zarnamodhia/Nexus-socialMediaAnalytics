import { EmotionLabel, Platform, RelationshipType, SentimentLabel, SocialEvent } from '../types';
import { computeEventHash } from '../utils/crypto';

// Deterministic Mulberry32 PRNG with fixed seed
export function createMulberry32(seed: number) {
  let state = seed | 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface AuthorProfile {
  id: string;
  cluster: string;
  communityId: string;
  preferredPlatform: Platform;
  language: string;
}

export const COMMUNITIES = [
  { id: 'Cluster-Alpha', name: 'Cluster-Alpha: Tech & Policy Experts', focus: 'AI & Regulation' },
  { id: 'Cluster-Beta', name: 'Cluster-Beta: Citizen Watchdogs', focus: 'Misinformation & Disinformation' },
  { id: 'Cluster-Gamma', name: 'Cluster-Gamma: Industry Operators', focus: 'Clean Energy & Infrastructure' },
  { id: 'Cluster-Delta', name: 'Cluster-Delta: Fringe Skeptics & Amplifiers', focus: 'Conspiracy & Sensationalism' },
  { id: 'Cluster-Epsilon', name: 'Cluster-Epsilon: Academic & Legal Analysts', focus: 'Ethics & Governance' },
];

export const PLATFORMS: Platform[] = ['X/Twitter', 'Telegram', 'YouTube', 'Reddit', 'Bluesky'];

export const TOPICS = [
  'Deepfake Election Rumors',
  'Clean Energy Grid Transition',
  'Autonomous Vehicle Safety',
  'AI Copyright Regulation',
  'Semiconductor Supply Chain',
  'Urban Air Mobility',
];

const LANGUAGES = ['en', 'en', 'en', 'es', 'fr', 'de', 'hi'];

// Templates for generation
const TEMPLATES: Record<
  string,
  {
    positive: string[];
    negative: string[];
    neutral: string[];
  }
> = {
  'Deepfake Election Rumors': {
    positive: [
      'Independent digital forensics team just verified the audio is authentic and cleared all deepfake allegations.',
      'New cryptographic watermarking breakthrough proves resilient against AI voice cloning in campaign debates.',
      'Fact-checkers publish comprehensive verified analysis debunking the viral synthetic leak.',
    ],
    negative: [
      'URGENT: Synthetic audio leak circulating rapidly across regional chatrooms. Extreme deception and election tampering risk.',
      'Alarming deepfake video depicting fabricated vote manipulation scandal spreads with zero moderation.',
      'Crisis in digital election integrity: coordinated network pushing synthetic audio hoaxes right before polling day.',
      'Dangerous disinformation surge. Voters in key districts panic over unverified audio leak.',
      'Catastrophic failure of platform trust and safety systems as malicious deepfake clones mimic election officials.',
    ],
    neutral: [
      'Election commission issues formal advisory regarding synthetic media detection and provenance verification.',
      'Technical panel reviews timestamp metadata on contested speech recordings.',
      'Comparison report released on audio spectral signatures for algorithmic cloning detection.',
    ],
  },
  'Clean Energy Grid Transition': {
    positive: [
      'Renewable grid integration hits historic 68% milestone today with zero curtailment or frequency drops.',
      'Next-generation battery storage deployment marks brilliant progress for regional grid resilience.',
      'Clean energy tariffs show remarkable cost reductions across industrial distribution nodes.',
      'Transmission line modernization receives broad multi-jurisdictional approval and stakeholder support.',
    ],
    negative: [
      'Local grid operator warns of alarming peak-load vulnerability without firm fossil backup capacity.',
      'Transmission bottleneck causes catastrophic price spikes and industrial power rationing.',
      'Severe supply disruption in transformer hardware creates long-term electrification delays.',
    ],
    neutral: [
      'Energy regulatory committee convenes public hearing on inter-regional high-voltage direct current interconnects.',
      'Quarterly dispatch statistics show solar and offshore wind maintaining seasonal baseline levels.',
      'Grid reliability council updates five-year transmission expansion recommendations.',
    ],
  },
  'Autonomous Vehicle Safety': {
    positive: [
      'Commercial autonomous vehicle fleet completes 25 million consecutive autonomous miles with flawless safety record.',
      'Peer-reviewed municipal study proves autonomous delivery vehicles reduce urban collision frequency by 74%.',
      'Advanced LiDAR perception upgrade demonstrated exceptional performance in blinding rain and fog conditions.',
      'Safety inspectors praise redundant brake and steering architectures in new robotaxi deployment.',
    ],
    negative: [
      'FATAL ACCIDENT: Uncrewed autonomous vehicle involved in severe intersection crash after sensor blinded by construction glare.',
      'Whistleblower leak exposes recurring perception sensor malfunctions that were allegedly concealed from safety boards.',
      'Outrage in city council as autonomous vehicle fleet blocks emergency response vehicles during critical ambulance call.',
      'Reckless testing protocol blamed for devastating collision. Demands grow for immediate fleet suspension.',
      'Critical software defect in object trajectory prediction triggers emergency federal safety investigation.',
    ],
    neutral: [
      'Department of Transportation opens public docket for next-generation automated driving system standards.',
      'Vehicle telemetry logs submitted to national highway safety database for routine cross-audit.',
      'Comparative benchmark examines sensor fusion performance across camera-first vs radar-lidar fleets.',
    ],
  },
  'AI Copyright Regulation': {
    positive: [
      'Landmark fair remuneration agreement established between major creative guilds and generative AI consortium.',
      'Transparent attribution protocol offers artists verifiable cryptographic revenue shares for training data.',
      'New legal framework provides clear safe harbors for transformative research while protecting creator rights.',
    ],
    negative: [
      'High-profile copyright lawsuit alleges widespread unauthorized scraping of proprietary archives.',
      'Creative artists voice deep outrage over wholesale intellectual property theft and loss of livelihood.',
      'Severe legal uncertainty paralyzes independent developers as court issues conflicting jurisdictional rulings.',
    ],
    neutral: [
      'Copyright office publishes interim report on authorship standards in machine-assisted compositions.',
      'Judicial panel hears oral arguments concerning fair use defenses in large model pre-training corpora.',
      'WIPO technical working group convenes treaty negotiations on synthetic training data registries.',
    ],
  },
  'Semiconductor Supply Chain': {
    positive: [
      'Domestic 2nm fabrication plant achieves commercial yield milestones ahead of scheduled delivery.',
      'Supply chain resilience index shows packaging bottlenecks easing across automotive microcontrollers.',
      'Breakthrough in extreme ultraviolet lithography efficiency promises significant power and wafer yield gains.',
    ],
    negative: [
      'Geopolitical export restrictions disrupt critical rare-gas deliveries, threatening wafer fab shutdowns.',
      'Critical foundry equipment delay triggers multi-quarter production bottleneck for high-performance computing.',
      'Severe wafer yield defects force emergency product recalls across tier-one hardware suppliers.',
    ],
    neutral: [
      'Semiconductor trade association releases quarterly capacity expansion and capital expenditure projections.',
      'Automotive manufacturers adjust inventory buffers in response to revised substrate delivery schedules.',
      'Standards committee harmonizes chiplet interconnect specifications for modular heterogeneous packaging.',
    ],
  },
  'Urban Air Mobility': {
    positive: [
      'Electric vertical takeoff aircraft completes noise emission acoustic certification with stellar ratings.',
      'Metropolitan transit authority greenlights downtown vertiport corridor for scheduled airport shuttles.',
      'Promising trial flights demonstrate seamless integration with municipal airspace air traffic control.',
    ],
    negative: [
      'Battery thermal runaway during static vertiport test triggers neighborhood alarm and emergency response.',
      'Severe acoustic resonance complaints from residential corridor threaten planned commuter flight paths.',
      'Regulatory delay grounds prototype fleet following flight control sensor redundancy failure.',
    ],
    neutral: [
      'Aviation authority issues proposed draft rules for urban low-altitude airspace classification.',
      'Urban planners study vertiport accessibility and multimodal passenger transfer times.',
      'Aeronautical engineers publish battery degradation modeling under high-rate cyclic vertical climb loads.',
    ],
  },
};

/**
 * Generates 1,200 deterministic, fully linked social media events
 * strictly satisfying all SIH requirements:
 * 1. Deepfake Election Rumors: violent surge after hour 48.
 * 2. Clean Energy Grid: high initial volume slowing to a trickle.
 * 3. Autonomous Vehicle Safety: dramatic positive-to-negative sentiment collapse after hour 36.
 */
export function generateDeterministicDataset(seed = 428795, targetCount = 1200): SocialEvent[] {
  const prng = createMulberry32(seed);

  // Generate 120 pseudonymous author profiles
  const authors: AuthorProfile[] = [];
  for (let i = 0; i < 120; i++) {
    const community = COMMUNITIES[i % COMMUNITIES.length];
    const preferredPlatform = PLATFORMS[Math.floor(prng() * PLATFORMS.length)];
    const lang = LANGUAGES[Math.floor(prng() * LANGUAGES.length)];
    const idPrefix = community.id.replace('Cluster-', '').toLowerCase();
    authors.push({
      id: `@${idPrefix}_node_${(i + 1).toString().padStart(3, '0')}`,
      cluster: community.name,
      communityId: community.id,
      preferredPlatform,
      language: lang,
    });
  }

  // Time window: 72 hours spanning 3 days
  // Let T0 = 2026-09-27T08:00:00Z
  const startTimeMs = 1774771200000;
  const totalHours = 72;

  // We will distribute 1200 events across 72 hours with topic-specific density functions
  interface DraftEvent {
    hour: number;
    minute: number;
    second: number;
    topic: string;
    isSpike?: boolean;
    isInflection?: boolean;
  }

  const drafts: DraftEvent[] = [];

  // Generate distribution per topic
  for (let hour = 0; hour < totalHours; hour++) {
    // 1. Deepfake Election Rumors:
    // Hours 0-47: 1-2 per 4 hours (dormant)
    // Hours 48-71: 18-28 per hour (sudden explosive breakout!)
    const deepfakeCount = hour < 48 ? (hour % 4 === 0 ? 1 : 0) : Math.floor(16 + prng() * 14);
    for (let k = 0; k < deepfakeCount; k++) {
      drafts.push({
        hour,
        minute: Math.floor(prng() * 60),
        second: Math.floor(prng() * 60),
        topic: 'Deepfake Election Rumors',
        isSpike: hour >= 48,
      });
    }

    // 2. Clean Energy Grid Transition:
    // Hours 0-23: 12-16 per hour (high volume)
    // Hours 24-47: 5-8 per hour (slowing)
    // Hours 48-71: 1-2 per hour (saturated/plateaued)
    const cleanEnergyCount =
      hour < 24
        ? Math.floor(11 + prng() * 5)
        : hour < 48
        ? Math.floor(4 + prng() * 4)
        : Math.floor(1 + prng() * 2);
    for (let k = 0; k < cleanEnergyCount; k++) {
      drafts.push({
        hour,
        minute: Math.floor(prng() * 60),
        second: Math.floor(prng() * 60),
        topic: 'Clean Energy Grid Transition',
      });
    }

    // 3. Autonomous Vehicle Safety:
    // Steady 5-7 per hour, but Hour 36 has a breaking incident event!
    const avCount = hour === 36 ? 12 : Math.floor(4 + prng() * 4);
    for (let k = 0; k < avCount; k++) {
      drafts.push({
        hour,
        minute: Math.floor(prng() * 60),
        second: Math.floor(prng() * 60),
        topic: 'Autonomous Vehicle Safety',
        isInflection: hour >= 36,
      });
    }

    // 4. AI Copyright Regulation: Steady 4-6 per hour
    const copyrightCount = Math.floor(3 + prng() * 4);
    for (let k = 0; k < copyrightCount; k++) {
      drafts.push({
        hour,
        minute: Math.floor(prng() * 60),
        second: Math.floor(prng() * 60),
        topic: 'AI Copyright Regulation',
      });
    }

    // 5. Semiconductor Supply Chain: Steady 2-4 per hour
    const semiCount = Math.floor(2 + prng() * 3);
    for (let k = 0; k < semiCount; k++) {
      drafts.push({
        hour,
        minute: Math.floor(prng() * 60),
        second: Math.floor(prng() * 60),
        topic: 'Semiconductor Supply Chain',
      });
    }

    // 6. Urban Air Mobility: 1-3 per hour
    const uamCount = Math.floor(1 + prng() * 2);
    for (let k = 0; k < uamCount; k++) {
      drafts.push({
        hour,
        minute: Math.floor(prng() * 60),
        second: Math.floor(prng() * 60),
        topic: 'Urban Air Mobility',
      });
    }
  }

  // Adjust or trim to targetCount (ensuring at least 1,200)
  while (drafts.length < targetCount) {
    const hr = Math.floor(prng() * totalHours);
    const top = TOPICS[Math.floor(prng() * TOPICS.length)];
    drafts.push({
      hour: hr,
      minute: Math.floor(prng() * 60),
      second: Math.floor(prng() * 60),
      topic: top,
    });
  }

  // Sort drafts chronologically
  drafts.sort((a, b) => {
    if (a.hour !== b.hour) return a.hour - b.hour;
    if (a.minute !== b.minute) return a.minute - b.minute;
    return a.second - b.second;
  });

  const events: SocialEvent[] = [];
  const eventsByTopic = new Map<string, string[]>();
  TOPICS.forEach((t) => eventsByTopic.set(t, []));

  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000'; // Genesis Hash

  for (let idx = 0; idx < drafts.length; idx++) {
    const draft = drafts[idx];
    const eventId = `evt-${(idx + 1).toString().padStart(5, '0')}`;
    const timestampMs =
      startTimeMs +
      draft.hour * 3600000 +
      draft.minute * 60000 +
      draft.second * 1000;
    const timestampIso = new Date(timestampMs).toISOString();

    // Select author with affinity towards topics
    let author = authors[Math.floor(prng() * authors.length)];
    if (draft.topic === 'Deepfake Election Rumors' && draft.isSpike) {
      // Delta and Beta clusters amplify deepfakes
      const biased = authors.filter(
        (a) => a.communityId === 'Cluster-Delta' || a.communityId === 'Cluster-Beta'
      );
      if (biased.length > 0 && prng() < 0.7) {
        author = biased[Math.floor(prng() * biased.length)];
      }
    } else if (draft.topic === 'Clean Energy Grid Transition') {
      const biased = authors.filter((a) => a.communityId === 'Cluster-Gamma');
      if (biased.length > 0 && prng() < 0.5) {
        author = biased[Math.floor(prng() * biased.length)];
      }
    }

    // Determine platform (author preferred or random)
    const platform = prng() < 0.65 ? author.preferredPlatform : PLATFORMS[Math.floor(prng() * PLATFORMS.length)];
    const language = author.language;

    // Determine relationship & parent event
    let relationship: RelationshipType = 'original';
    let parentEventId: string | null = null;
    const existingTopicEvents = eventsByTopic.get(draft.topic) || [];

    if (existingTopicEvents.length > 0 && prng() < 0.38) {
      // 38% are replies or reposts
      relationship = prng() < 0.55 ? 'repost' : 'reply';
      // Pick a parent from recent 15 events
      const slice = existingTopicEvents.slice(-15);
      parentEventId = slice[Math.floor(prng() * slice.length)];
    }

    // Sentiment and Emotion logic fulfilling requirements
    let sentiment: SentimentLabel = 'neutral';
    let emotion: EmotionLabel = 'neutral';
    let sentimentScore = 0.0;
    let sentimentConfidence = Math.round((0.72 + prng() * 0.25) * 100) / 100;

    const templates = TEMPLATES[draft.topic] || TEMPLATES['Clean Energy Grid Transition'];
    let text = '';

    if (draft.topic === 'Deepfake Election Rumors') {
      if (draft.hour >= 48) {
        // Breakout surge is heavily negative (85% negative, fear/anger)
        const roll = prng();
        if (roll < 0.55) {
          sentiment = 'negative';
          emotion = 'fear';
          sentimentScore = -0.7 - prng() * 0.25;
          text = templates.negative[Math.floor(prng() * templates.negative.length)];
        } else if (roll < 0.85) {
          sentiment = 'negative';
          emotion = 'anger';
          sentimentScore = -0.6 - prng() * 0.3;
          text = templates.negative[Math.floor(prng() * templates.negative.length)];
        } else {
          sentiment = 'neutral';
          emotion = 'surprise';
          sentimentScore = 0.05;
          text = templates.neutral[Math.floor(prng() * templates.neutral.length)];
        }
      } else {
        // Dormant phase is mostly neutral
        sentiment = 'neutral';
        emotion = 'neutral';
        sentimentScore = 0.0;
        text = templates.neutral[Math.floor(prng() * templates.neutral.length)];
      }
    } else if (draft.topic === 'Autonomous Vehicle Safety') {
      if (draft.hour < 36) {
        // Before hour 36: 80% positive (breakthroughs, safety record, joy)
        const roll = prng();
        if (roll < 0.8) {
          sentiment = 'positive';
          emotion = 'joy';
          sentimentScore = 0.65 + prng() * 0.3;
          text = templates.positive[Math.floor(prng() * templates.positive.length)];
        } else {
          sentiment = 'neutral';
          emotion = 'neutral';
          sentimentScore = 0.05;
          text = templates.neutral[Math.floor(prng() * templates.neutral.length)];
        }
      } else {
        // After hour 36: Sentiment Shift to 82% negative (crash aftermath, anger, fear)
        const roll = prng();
        if (roll < 0.5) {
          sentiment = 'negative';
          emotion = 'anger';
          sentimentScore = -0.75 - prng() * 0.2;
          text = templates.negative[Math.floor(prng() * templates.negative.length)];
        } else if (roll < 0.82) {
          sentiment = 'negative';
          emotion = 'fear';
          sentimentScore = -0.65 - prng() * 0.25;
          text = templates.negative[Math.floor(prng() * templates.negative.length)];
        } else {
          sentiment = 'neutral';
          emotion = 'sadness';
          sentimentScore = -0.2;
          text = templates.neutral[Math.floor(prng() * templates.neutral.length)];
        }
      }
    } else if (draft.topic === 'Clean Energy Grid Transition') {
      // 65% positive, 25% neutral, 10% negative
      const roll = prng();
      if (roll < 0.65) {
        sentiment = 'positive';
        emotion = 'joy';
        sentimentScore = 0.55 + prng() * 0.35;
        text = templates.positive[Math.floor(prng() * templates.positive.length)];
      } else if (roll < 0.9) {
        sentiment = 'neutral';
        emotion = 'neutral';
        sentimentScore = 0.0;
        text = templates.neutral[Math.floor(prng() * templates.neutral.length)];
      } else {
        sentiment = 'negative';
        emotion = 'fear';
        sentimentScore = -0.45;
        text = templates.negative[Math.floor(prng() * templates.negative.length)];
      }
    } else {
      // Default balanced distribution
      const roll = prng();
      if (roll < 0.4) {
        sentiment = 'positive';
        emotion = 'joy';
        sentimentScore = 0.5 + prng() * 0.3;
        text = templates.positive[Math.floor(prng() * templates.positive.length)];
      } else if (roll < 0.75) {
        sentiment = 'neutral';
        emotion = 'neutral';
        sentimentScore = 0.0;
        text = templates.neutral[Math.floor(prng() * templates.neutral.length)];
      } else {
        sentiment = 'negative';
        emotion = prng() < 0.5 ? 'anger' : 'fear';
        sentimentScore = -0.5 - prng() * 0.3;
        text = templates.negative[Math.floor(prng() * templates.negative.length)];
      }
    }

    // Engagement calculation (higher during spikes)
    const baseMultiplier = draft.isSpike ? 6 : draft.hour === 36 ? 8 : 1;
    const likes = Math.floor(Math.pow(prng(), 2.2) * 450 * baseMultiplier) + 3;
    const reposts = Math.floor(Math.pow(prng(), 2.5) * 180 * baseMultiplier) + (relationship === 'repost' ? 5 : 0);
    const comments = Math.floor(Math.pow(prng(), 2.3) * 65 * baseMultiplier) + (relationship === 'reply' ? 4 : 0);
    const views = (likes + reposts * 4 + comments * 5) * Math.floor(12 + prng() * 18);

    // Compute Cryptographic SHA-256 Hash
    const evidenceHash = computeEventHash({
      id: eventId,
      previousHash: prevHash,
      timestamp: timestampIso,
      platform,
      authorId: author.id,
      text,
      topic: draft.topic,
      sentiment,
    });

    const event: SocialEvent = {
      id: eventId,
      timestamp: timestampIso,
      timestampMs,
      platform,
      authorId: author.id,
      authorCluster: author.cluster,
      text,
      language,
      topic: draft.topic,
      sentiment,
      sentimentScore: Math.round(sentimentScore * 100) / 100,
      sentimentConfidence,
      emotion,
      relationship,
      parentEventId,
      engagement: {
        likes,
        reposts,
        comments,
        views,
      },
      communityId: author.communityId,
      sourceType: 'DEMO',
      evidenceHash,
      previousHash: prevHash,
    };

    events.push(event);
    eventsByTopic.get(draft.topic)!.push(eventId);
    prevHash = evidenceHash;
  }

  return events;
}
