import { PrismaClient } from '@prisma/client';

declare global {
  // Prevent multiple instances of Prisma Client in development
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Automatically creates required tables in PostgreSQL if they do not exist yet.
 */
export async function ensureTablesExist(): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SocialEvent" (
        "id" TEXT PRIMARY KEY,
        "timestamp" TIMESTAMPTZ NOT NULL,
        "timestampMs" DOUBLE PRECISION NOT NULL,
        "platform" TEXT NOT NULL,
        "authorId" TEXT NOT NULL,
        "authorCluster" TEXT NOT NULL,
        "text" TEXT NOT NULL,
        "language" TEXT NOT NULL,
        "topic" TEXT NOT NULL,
        "sentiment" TEXT NOT NULL,
        "sentimentScore" DOUBLE PRECISION NOT NULL,
        "sentimentConfidence" DOUBLE PRECISION NOT NULL,
        "emotion" TEXT NOT NULL,
        "relationship" TEXT NOT NULL,
        "parentEventId" TEXT,
        "likes" INTEGER NOT NULL DEFAULT 0,
        "reposts" INTEGER NOT NULL DEFAULT 0,
        "comments" INTEGER NOT NULL DEFAULT 0,
        "views" INTEGER NOT NULL DEFAULT 0,
        "communityId" TEXT NOT NULL,
        "sourceType" TEXT NOT NULL DEFAULT 'DEMO',
        "evidenceHash" TEXT NOT NULL,
        "previousHash" TEXT NOT NULL,
        "tampered" BOOLEAN NOT NULL DEFAULT FALSE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS "idx_social_event_topic" ON "SocialEvent"("topic");
      CREATE INDEX IF NOT EXISTS "idx_social_event_platform" ON "SocialEvent"("platform");
      CREATE INDEX IF NOT EXISTS "idx_social_event_sentiment" ON "SocialEvent"("sentiment");
      CREATE INDEX IF NOT EXISTS "idx_social_event_timestamp_ms" ON "SocialEvent"("timestampMs");

      CREATE TABLE IF NOT EXISTS "Investigation" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "topic" TEXT NOT NULL,
        "keywords" TEXT[] NOT NULL DEFAULT '{}',
        "startMs" DOUBLE PRECISION NOT NULL,
        "endMs" DOUBLE PRECISION NOT NULL,
        "splitTimestampMs" DOUBLE PRECISION NOT NULL,
        "observedFacts" TEXT[] NOT NULL DEFAULT '{}',
        "modelInterpretations" TEXT[] NOT NULL DEFAULT '{}',
        "hypotheses" TEXT[] NOT NULL DEFAULT '{}',
        "evidenceIds" TEXT[] NOT NULL DEFAULT '{}',
        "dominantSentiment" TEXT NOT NULL,
        "peakEmotion" TEXT NOT NULL,
        "topPlatform" TEXT NOT NULL,
        "primaryCommunity" TEXT NOT NULL,
        "viralityRatio" DOUBLE PRECISION NOT NULL,
        "totalEvents" INTEGER NOT NULL,
        "analystNotes" TEXT NOT NULL DEFAULT '',
        "status" TEXT NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "LedgerAudit" (
        "id" TEXT PRIMARY KEY,
        "verifiedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "chainValid" BOOLEAN NOT NULL,
        "recordsScanned" INTEGER NOT NULL,
        "tamperedCount" INTEGER NOT NULL,
        "firstBrokenHash" TEXT,
        "auditLog" JSONB NOT NULL
      );
    `);
  } catch (err: any) {
    console.warn('Auto table creation notice:', err?.message || err);
  }
}

/**
 * Validates connection to the database.
 * Returns { connected: boolean, error?: string }
 */
export async function testDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  if (!process.env.DATABASE_URL) {
    return {
      connected: false,
      error: 'DATABASE_URL environment variable is not defined',
    };
  }

  try {
    // Quick test query
    await prisma.$queryRaw`SELECT 1 as result`;
    // Ensure tables exist
    await ensureTablesExist();
    return { connected: true };
  } catch (err: any) {
    return {
      connected: false,
      error: err?.message || 'Failed to query database',
    };
  }
}
