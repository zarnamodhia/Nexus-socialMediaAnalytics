import { EmotionLabel, SentimentLabel, SocialEvent, TopicTrendMetric } from '../types';

// Transparent Lexicons with documented valence weights (-3 to +3)
const POSITIVE_LEXICON: Record<string, number> = {
  breakthrough: 2.8,
  milestone: 2.2,
  reliable: 2.0,
  safe: 2.1,
  safety: 1.8,
  clean: 1.9,
  progress: 2.3,
  efficient: 2.0,
  verified: 2.4,
  solution: 2.2,
  promising: 2.0,
  triumph: 2.6,
  celebrate: 2.5,
  brilliant: 2.7,
  victory: 2.5,
  support: 1.7,
  innovative: 2.4,
  stellar: 2.8,
  growth: 1.8,
  success: 2.6,
  upgrade: 1.9,
  secure: 2.2,
  transparent: 2.1,
  optimistic: 2.2,
  resilient: 2.3,
  excellence: 2.7,
  flawless: 2.9,
};

const NEGATIVE_LEXICON: Record<string, number> = {
  fatal: -3.0,
  crash: -2.8,
  accident: -2.5,
  deepfake: -2.6,
  hoax: -2.7,
  deception: -2.8,
  disinformation: -2.9,
  scandal: -2.8,
  danger: -2.6,
  dangerous: -2.6,
  catastrophic: -3.0,
  corrupt: -2.7,
  malfunction: -2.5,
  failure: -2.6,
  defect: -2.4,
  alarming: -2.5,
  panic: -2.7,
  boycott: -2.2,
  unacceptable: -2.5,
  lawsuit: -2.1,
  threat: -2.6,
  vulnerability: -2.4,
  breach: -2.5,
  crisis: -2.8,
  collapse: -2.9,
  investigation: -1.5,
  manipulation: -2.7,
  unreliable: -2.4,
  reckless: -2.8,
};

const EMOTION_LEXICON: Record<string, EmotionLabel> = {
  // Joy
  breakthrough: 'joy',
  milestone: 'joy',
  celebrate: 'joy',
  victory: 'joy',
  triumph: 'joy',
  stellar: 'joy',
  success: 'joy',
  excited: 'joy',
  thrilled: 'joy',
  // Anger
  outrage: 'anger',
  unacceptable: 'anger',
  boycott: 'anger',
  corrupt: 'anger',
  liar: 'anger',
  furious: 'anger',
  scandal: 'anger',
  reckless: 'anger',
  // Fear
  panic: 'fear',
  fatal: 'fear',
  crash: 'fear',
  danger: 'fear',
  dangerous: 'fear',
  threat: 'fear',
  deepfake: 'fear',
  vulnerability: 'fear',
  collapse: 'fear',
  alarming: 'fear',
  crisis: 'fear',
  // Sadness
  tragic: 'sadness',
  heartbreaking: 'sadness',
  casualty: 'sadness',
  mourn: 'sadness',
  loss: 'sadness',
  devastated: 'sadness',
  regret: 'sadness',
  // Surprise
  shock: 'surprise',
  unbelievable: 'surprise',
  sudden: 'surprise',
  unprecedented: 'surprise',
  astonishing: 'surprise',
  unexpected: 'surprise',
};

const NEGATIONS = new Set(['not', "don't", 'never', 'hardly', 'barely', 'scarcely', 'no', 'without']);
const INTENSIFIERS: Record<string, number> = {
  very: 1.4,
  extremely: 1.8,
  massively: 1.6,
  highly: 1.5,
  critical: 1.4,
  hugely: 1.5,
  totally: 1.6,
};

const STOP_WORDS = new Set([
  'the', 'and', 'to', 'of', 'a', 'in', 'is', 'that', 'for', 'it', 'as', 'was', 'with', 'on', 'at', 'by',
  'this', 'from', 'be', 'are', 'an', 'have', 'has', 'we', 'will', 'our', 'all', 'more', 'about', 'they',
  'can', 'their', 'which', 'or', 'new', 'who', 'so', 'what', 'if', 'its', 'just', 'been', 'there',
]);

export interface ClassifierExplanation {
  detectedPositiveTerms: Array<{ word: string; weight: number }>;
  detectedNegativeTerms: Array<{ word: string; weight: number }>;
  rawValenceScore: number;
  normalizedScore: number;
  confidence: number;
  dominantEmotion: EmotionLabel;
  sentiment: SentimentLabel;
  methodology: string;
}

/**
 * Transparent rule-based local sentiment and emotion classifier.
 * Fully explainable, verifiable, and free of hidden black-box logic.
 */
export function classifyText(text: string): ClassifierExplanation {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  let rawScore = 0;
  let matches = 0;
  const detectedPositive: Array<{ word: string; weight: number }> = [];
  const detectedNegative: Array<{ word: string; weight: number }> = [];
  const emotionCounts: Record<EmotionLabel, number> = {
    joy: 0,
    anger: 0,
    fear: 0,
    sadness: 0,
    surprise: 0,
    neutral: 1, // baseline
  };

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : '';
    const isNegated = NEGATIONS.has(prevWord);
    const intensifierMultiplier = INTENSIFIERS[prevWord] || 1.0;

    if (POSITIVE_LEXICON[word]) {
      let weight = POSITIVE_LEXICON[word] * intensifierMultiplier;
      if (isNegated) weight = -weight * 0.75;
      rawScore += weight;
      matches++;
      detectedPositive.push({ word, weight });
    } else if (NEGATIVE_LEXICON[word]) {
      let weight = NEGATIVE_LEXICON[word] * intensifierMultiplier;
      if (isNegated) weight = -weight * 0.5;
      rawScore += weight;
      matches++;
      detectedNegative.push({ word, weight });
    }

    if (EMOTION_LEXICON[word]) {
      const em = EMOTION_LEXICON[word];
      emotionCounts[em] = (emotionCounts[em] || 0) + 1;
    }
  }

  // Normalize score between -1.0 and +1.0
  const normalizedScore = Math.max(-1.0, Math.min(1.0, rawScore / (matches > 0 ? matches * 2 : 1)));

  let sentiment: SentimentLabel = 'neutral';
  if (normalizedScore > 0.15) sentiment = 'positive';
  else if (normalizedScore < -0.15) sentiment = 'negative';

  // Compute confidence based on signal density
  const confidence = Math.min(0.98, Math.max(0.62, 0.55 + matches * 0.08 + Math.abs(normalizedScore) * 0.25));

  // Determine top emotion
  let dominantEmotion: EmotionLabel = 'neutral';
  let maxCount = 0;
  (Object.keys(emotionCounts) as EmotionLabel[]).forEach((em) => {
    if (em !== 'neutral' && emotionCounts[em] > maxCount) {
      maxCount = emotionCounts[em];
      dominantEmotion = em;
    }
  });

  if (maxCount === 0) {
    dominantEmotion = sentiment === 'positive' ? 'joy' : sentiment === 'negative' ? 'fear' : 'neutral';
  }

  return {
    detectedPositiveTerms: detectedPositive,
    detectedNegativeTerms: detectedNegative,
    rawValenceScore: Math.round(rawScore * 100) / 100,
    normalizedScore: Math.round(normalizedScore * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    dominantEmotion,
    sentiment,
    methodology: 'Deterministic Lexical Valence Scoring (AFINN/VADER derivative with Negation & Modifier rules)',
  };
}

/**
 * Calculates transparent trend scores across topics based on documented factors:
 * - Volume Growth Rate (40%)
 * - Acceleration Factor (30%)
 * - Engagement Velocity (20%)
 * - Sentiment Volatility (10%)
 */
export function computeTopicTrendMetrics(
  events: SocialEvent[],
  activeTopics?: string[]
): TopicTrendMetric[] {
  if (events.length === 0) return [];

  // Group events by topic
  const topicMap = new Map<string, SocialEvent[]>();
  events.forEach((ev) => {
    if (activeTopics && !activeTopics.includes(ev.topic)) return;
    if (!topicMap.has(ev.topic)) topicMap.set(ev.topic, []);
    topicMap.get(ev.topic)!.push(ev);
  });

  // Find min and max timestamp to establish temporal windows
  const timestamps = events.map((e) => e.timestampMs);
  const minTs = Math.min(...timestamps);
  const maxTs = Math.max(...timestamps);
  const span = Math.max(1, maxTs - minTs);
  const midpoint = minTs + span * 0.5;
  const recentQuarter = minTs + span * 0.75;

  const results: TopicTrendMetric[] = [];

  topicMap.forEach((topicEvents, topic) => {
    const totalVolume = topicEvents.length;
    
    // Temporal slicing
    const baselineEvents = topicEvents.filter((e) => e.timestampMs < midpoint);
    const recentEvents = topicEvents.filter((e) => e.timestampMs >= midpoint);
    const latestEvents = topicEvents.filter((e) => e.timestampMs >= recentQuarter);

    const baselineVolume = baselineEvents.length;
    const recentVolume = recentEvents.length;
    const latestVolume = latestEvents.length;

    // 1. Growth Rate %
    const growthRatePct =
      baselineVolume > 0
        ? Math.round(((recentVolume - baselineVolume) / baselineVolume) * 100)
        : recentVolume * 100;

    // 2. Acceleration Factor: comparing rate of growth in the latest quarter vs earlier
    const baselineRate = baselineVolume / Math.max(1, span * 0.5);
    const recentRate = latestVolume / Math.max(1, span * 0.25);
    const acceleration = Math.round((recentRate / Math.max(0.001, baselineRate) - 1.0) * 100) / 100;

    // 3. Engagement Velocity: average engagement per event
    const totalEng = topicEvents.reduce(
      (sum, e) => sum + e.engagement.likes + e.engagement.reposts * 2 + e.engagement.comments * 3,
      0
    );
    const engagementVelocity = Math.round(totalEng / Math.max(1, totalVolume));

    // 4. Sentiment Shift: difference between recent average sentiment vs baseline
    const avgRecentSentiment =
      recentEvents.length > 0
        ? recentEvents.reduce((acc, e) => acc + e.sentimentScore, 0) / recentEvents.length
        : 0;
    const avgBaselineSentiment =
      baselineEvents.length > 0
        ? baselineEvents.reduce((acc, e) => acc + e.sentimentScore, 0) / baselineEvents.length
        : 0;
    const sentimentShift = Math.round((avgRecentSentiment - avgBaselineSentiment) * 100) / 100;

    // 5. Net Trend Score (0 to 100 scale)
    // Formula: (Normalized Growth * 0.40) + (Normalized Acceleration * 0.30) + (Normalized Engagement * 0.20) + (Sentiment Shift * 0.10)
    const normGrowth = Math.max(0, Math.min(100, 50 + growthRatePct * 0.35));
    const normAccel = Math.max(0, Math.min(100, 50 + acceleration * 25));
    const normEng = Math.max(0, Math.min(100, (engagementVelocity / 150) * 100));
    const normSentShift = Math.max(0, Math.min(100, 50 + Math.abs(sentimentShift) * 40));

    const rawScore =
      normGrowth * 0.40 +
      normAccel * 0.30 +
      normEng * 0.20 +
      normSentShift * 0.10;

    const trendScore = Math.round(Math.max(1, Math.min(99, rawScore)));

    // Categorization
    let classification: 'emerging' | 'growing' | 'saturating' | 'stable' = 'stable';
    if (growthRatePct > 70 && acceleration > 0.8) {
      classification = 'emerging';
    } else if (growthRatePct > 15) {
      classification = 'growing';
    } else if (growthRatePct < -15 || (totalVolume > 200 && growthRatePct < 5 && acceleration < 0)) {
      classification = 'saturating';
    }

    // Sentiment breakdown
    let positive = 0, neutral = 0, negative = 0;
    const emotionCounts: Record<EmotionLabel, number> = {
      joy: 0, anger: 0, fear: 0, sadness: 0, surprise: 0, neutral: 0,
    };

    topicEvents.forEach((e) => {
      if (e.sentiment === 'positive') positive++;
      else if (e.sentiment === 'negative') negative++;
      else neutral++;
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });

    let dominantEmotion: EmotionLabel = 'neutral';
    let maxEmCount = 0;
    (Object.keys(emotionCounts) as EmotionLabel[]).forEach((em) => {
      if (emotionCounts[em] > maxEmCount) {
        maxEmCount = emotionCounts[em];
        dominantEmotion = em;
      }
    });

    results.push({
      topic,
      totalVolume,
      baselineVolume,
      recentVolume,
      growthRatePct,
      acceleration,
      engagementVelocity,
      sentimentShift,
      trendScore,
      classification,
      dominantEmotion,
      sentimentBreakdown: { positive, neutral, negative },
    });
  });

  return results.sort((a, b) => b.trendScore - a.trendScore);
}

/**
 * Keyword & N-Gram extractor for topic discovery and word frequency clouds.
 */
export function extractTopKeywords(
  events: SocialEvent[],
  topN = 25
): Array<{ word: string; count: number; sentimentWeight: number }> {
  const counts = new Map<string, { count: number; totalScore: number }>();

  events.forEach((ev) => {
    const tokens = ev.text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

    tokens.forEach((token) => {
      if (!counts.has(token)) {
        counts.set(token, { count: 0, totalScore: 0 });
      }
      const entry = counts.get(token)!;
      entry.count += 1;
      entry.totalScore += ev.sentimentScore;
    });
  });

  const sorted = Array.from(counts.entries())
    .map(([word, data]) => ({
      word,
      count: data.count,
      sentimentWeight: Math.round((data.totalScore / data.count) * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count);

  return sorted.slice(0, topN);
}
