import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { prisma, testDatabaseConnection, ensureTablesExist } from './src/lib/prisma.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Attempt automatic schema migration on startup if DATABASE_URL is configured
if (process.env.DATABASE_URL) {
  ensureTablesExist().catch((e) => console.warn('Database schema startup notice:', e?.message || e));
}

let activeSupabaseClient: SupabaseClient | null = null;

function getActiveSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!activeSupabaseClient) {
    try {
      activeSupabaseClient = createClient(url, key);
    } catch {
      return null;
    }
  }
  return activeSupabaseClient;
}

// 1. Database Health & Diagnostic Status Endpoint
app.get('/api/database/status', async (_req: Request, res: Response) => {
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const hasSupabaseUrl = Boolean(process.env.SUPABASE_URL);
  const hasSupabaseAnonKey = Boolean(process.env.SUPABASE_ANON_KEY);

  let connectionStatus: 'connected' | 'unconfigured' | 'error' = 'unconfigured';
  let errorMessage: string | null = null;
  let recordCount = 0;
  let investigationCount = 0;

  if (hasDbUrl) {
    try {
      const conn = await testDatabaseConnection();
      if (conn.connected) {
        connectionStatus = 'connected';
        recordCount = await prisma.socialEvent.count().catch(() => 0);
        investigationCount = await prisma.investigation.count().catch(() => 0);
      } else {
        connectionStatus = 'error';
        errorMessage = conn.error || 'Connection failed';
      }
    } catch (e: any) {
      connectionStatus = 'error';
      errorMessage = e?.message || 'Database query error';
    }
  } else if (hasSupabaseUrl && hasSupabaseAnonKey) {
    try {
      const sb = getActiveSupabaseClient();
      if (sb) {
        const { count, error } = await sb.from('SocialEvent').select('*', { count: 'exact', head: true });
        if (!error) {
          connectionStatus = 'connected';
          recordCount = count || 0;
        } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
          // Connected to Supabase, but schema not yet migrated
          connectionStatus = 'connected';
          errorMessage = 'Connected to Supabase! Tables need to be initialized via SQL DDL.';
        } else {
          connectionStatus = 'error';
          errorMessage = error.message;
        }
      }
    } catch (e: any) {
      connectionStatus = 'error';
      errorMessage = e?.message || 'Supabase API connection error';
    }
  }

  res.json({
    status: connectionStatus,
    orm: hasDbUrl ? 'Prisma ORM (v6.4.1)' : 'Supabase Client SDK',
    provider: 'Supabase PostgreSQL',
    configured: {
      hasDatabaseUrl: hasDbUrl,
      hasDirectUrl: Boolean(process.env.DIRECT_URL),
      hasSupabaseUrl,
      hasSupabaseAnonKey,
    },
    counts: {
      events: recordCount,
      investigations: investigationCount,
    },
    error: errorMessage,
    schemaFile: 'prisma/schema.prisma',
  });
});

// Dynamic Supabase Connection Configuration Endpoint
app.post('/api/database/config', async (req: Request, res: Response) => {
  const { databaseUrl, directUrl, supabaseUrl, supabaseAnonKey } = req.body;

  if (databaseUrl) {
    process.env.DATABASE_URL = databaseUrl;
  }
  if (directUrl) {
    process.env.DIRECT_URL = directUrl;
  }
  if (supabaseUrl) {
    process.env.SUPABASE_URL = supabaseUrl;
    activeSupabaseClient = null; // reset client
  }
  if (supabaseAnonKey) {
    process.env.SUPABASE_ANON_KEY = supabaseAnonKey;
    activeSupabaseClient = null; // reset client
  }

  try {
    if (process.env.DATABASE_URL) {
      const conn = await testDatabaseConnection();
      if (conn.connected) {
        const recordCount = await prisma.socialEvent.count().catch(() => 0);
        const invCount = await prisma.investigation.count().catch(() => 0);
        return res.json({
          success: true,
          status: 'connected',
          mode: 'prisma',
          counts: { events: recordCount, investigations: invCount },
        });
      } else {
        return res.json({
          success: false,
          status: 'error',
          error: conn.error || 'Failed to connect to Supabase PostgreSQL with provided credentials',
        });
      }
    } else if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      const sb = getActiveSupabaseClient();
      if (!sb) {
        return res.json({ success: false, status: 'error', error: 'Invalid Supabase URL or Anon Key' });
      }
      const { count, error } = await sb.from('SocialEvent').select('*', { count: 'exact', head: true });
      if (!error || error.code === '42P01' || error.message?.includes('does not exist')) {
        return res.json({
          success: true,
          status: 'connected',
          mode: 'supabase-sdk',
          counts: { events: count || 0, investigations: 0 },
          notice: error ? 'Connected to Supabase! Run the SQL DDL in Supabase SQL editor to create tables.' : undefined,
        });
      } else {
        return res.json({
          success: false,
          status: 'error',
          error: error.message || 'Failed to authenticate with Supabase',
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        status: 'error',
        error: 'Please provide either DATABASE_URL or SUPABASE_URL + SUPABASE_ANON_KEY',
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      status: 'error',
      error: err?.message || 'Internal connection error',
    });
  }
});

// 2. Fetch Events from Supabase via Prisma ORM or Supabase Client
app.get('/api/events', async (req: Request, res: Response) => {
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const sb = getActiveSupabaseClient();

  if (!hasDbUrl && !sb) {
    return res.status(503).json({
      error: 'DATABASE_URL or Supabase credentials are not set. Operating in deterministic demo mode.',
      fallback: true,
    });
  }

  try {
    const topic = req.query.topic as string | undefined;
    const platform = req.query.platform as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 2000;

    if (hasDbUrl) {
      const where: any = {};
      if (topic) where.topic = topic;
      if (platform) where.platform = platform;

      const events = await prisma.socialEvent.findMany({
        where,
        orderBy: { timestampMs: 'asc' },
        take: limit,
      });

      // Format events for client schema
      const formatted = events.map((e) => ({
        id: e.id,
        timestamp: e.timestamp.toISOString(),
        timestampMs: e.timestampMs,
        platform: e.platform,
        authorId: e.authorId,
        authorCluster: e.authorCluster,
        text: e.text,
        language: e.language,
        topic: e.topic,
        sentiment: e.sentiment,
        sentimentScore: e.sentimentScore,
        sentimentConfidence: e.sentimentConfidence,
        emotion: e.emotion,
        relationship: e.relationship,
        parentEventId: e.parentEventId,
        engagement: {
          likes: e.likes,
          reposts: e.reposts,
          comments: e.comments,
          views: e.views,
        },
        communityId: e.communityId,
        sourceType: e.sourceType,
        evidenceHash: e.evidenceHash,
        previousHash: e.previousHash,
        tampered: e.tampered,
      }));

      return res.json({ events: formatted, total: formatted.length });
    } else if (sb) {
      let query = sb.from('SocialEvent').select('*').limit(limit).order('timestampMs', { ascending: true });
      if (topic) query = query.eq('topic', topic);
      if (platform) query = query.eq('platform', platform);
      const { data, error } = await query;
      if (error) throw error;
      return res.json({ events: data || [], total: data?.length || 0 });
    }
  } catch (error: any) {
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      ensureTablesExist().catch(() => {});
    }
    // Return empty events with fallback flag so frontend continues smoothly
    return res.json({ events: [], total: 0, fallback: true });
  }
});

// 3. Batch Ingest Events to Supabase via Prisma or Supabase Client
app.post('/api/events/batch', async (req: Request, res: Response) => {
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const sb = getActiveSupabaseClient();

  if (!hasDbUrl && !sb) {
    return res.status(503).json({ error: 'Database is not configured. Provide DATABASE_URL or SUPABASE_URL + ANON_KEY.' });
  }

  const { events } = req.body;
  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: 'No events provided in body' });
  }

  try {
    const formatted = events.map((e: any) => ({
      id: e.id,
      timestamp: new Date(e.timestamp || e.timestampMs),
      timestampMs: e.timestampMs,
      platform: e.platform,
      authorId: e.authorId,
      authorCluster: e.authorCluster || 'General',
      text: e.text,
      language: e.language || 'en',
      topic: e.topic,
      sentiment: e.sentiment,
      sentimentScore: e.sentimentScore || 0,
      sentimentConfidence: e.sentimentConfidence || 0.8,
      emotion: e.emotion || 'neutral',
      relationship: e.relationship || 'original',
      parentEventId: e.parentEventId || null,
      likes: e.engagement?.likes || 0,
      reposts: e.engagement?.reposts || 0,
      comments: e.engagement?.comments || 0,
      views: e.engagement?.views || 0,
      communityId: e.communityId || 'Cluster-Alpha',
      sourceType: e.sourceType || 'IMPORTED',
      evidenceHash: e.evidenceHash || '',
      previousHash: e.previousHash || '',
      tampered: Boolean(e.tampered),
    }));

    if (hasDbUrl) {
      // Perform batch create / skip duplicates
      const result = await prisma.socialEvent.createMany({
        data: formatted,
        skipDuplicates: true,
      });
      return res.json({ success: true, count: result.count });
    } else if (sb) {
      const { data, error } = await sb.from('SocialEvent').upsert(formatted, { onConflict: 'id' }).select('id');
      if (error) throw error;
      return res.json({ success: true, count: data?.length || formatted.length });
    }
  } catch (error: any) {
    console.error('Batch insert error:', error);
    res.status(500).json({ error: error?.message || 'Failed to batch ingest events' });
  }
});

// 4. Fetch Investigations from Supabase via Prisma
app.get('/api/investigations', async (_req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'DATABASE_URL is not set.' });
  }

  try {
    const investigations = await prisma.investigation.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formatted = investigations.map((inv) => ({
      id: inv.id,
      title: inv.title,
      topic: inv.topic,
      createdAt: inv.createdAt.toISOString(),
      keywords: inv.keywords,
      timeWindow: {
        startMs: inv.startMs,
        endMs: inv.endMs,
      },
      splitTimestampMs: inv.splitTimestampMs,
      findings: {
        observedFacts: inv.observedFacts,
        modelInterpretations: inv.modelInterpretations,
        hypotheses: inv.hypotheses,
      },
      evidenceIds: inv.evidenceIds,
      summaryMetrics: {
        totalEvents: inv.totalEvents,
        dominantSentiment: inv.dominantSentiment,
        peakEmotion: inv.peakEmotion,
        topPlatform: inv.topPlatform,
        primaryCommunity: inv.primaryCommunity,
        viralityRatio: inv.viralityRatio,
      },
      analystNotes: inv.analystNotes,
      status: inv.status,
    }));

    res.json({ investigations: formatted });
  } catch (error: any) {
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      ensureTablesExist().catch(() => {});
    }
    return res.json({ investigations: [], fallback: true });
  }
});

// 5. Save/Update Investigation to Supabase via Prisma
app.post('/api/investigations', async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'DATABASE_URL is not set.' });
  }

  const inv = req.body;
  if (!inv || !inv.id) {
    return res.status(400).json({ error: 'Invalid investigation payload' });
  }

  try {
    const upserted = await prisma.investigation.upsert({
      where: { id: inv.id },
      create: {
        id: inv.id,
        title: inv.title,
        topic: inv.topic,
        keywords: inv.keywords || [],
        startMs: inv.timeWindow?.startMs || 0,
        endMs: inv.timeWindow?.endMs || Date.now(),
        splitTimestampMs: inv.splitTimestampMs || 0,
        observedFacts: inv.findings?.observedFacts || [],
        modelInterpretations: inv.findings?.modelInterpretations || [],
        hypotheses: inv.findings?.hypotheses || [],
        evidenceIds: inv.evidenceIds || [],
        dominantSentiment: inv.summaryMetrics?.dominantSentiment || 'neutral',
        peakEmotion: inv.summaryMetrics?.peakEmotion || 'neutral',
        topPlatform: inv.summaryMetrics?.topPlatform || 'X/Twitter',
        primaryCommunity: inv.summaryMetrics?.primaryCommunity || 'Cluster-Alpha',
        viralityRatio: inv.summaryMetrics?.viralityRatio || 1.0,
        totalEvents: inv.summaryMetrics?.totalEvents || 0,
        analystNotes: inv.analystNotes || '',
        status: inv.status || 'active',
      },
      update: {
        title: inv.title,
        topic: inv.topic,
        keywords: inv.keywords || [],
        startMs: inv.timeWindow?.startMs || 0,
        endMs: inv.timeWindow?.endMs || Date.now(),
        splitTimestampMs: inv.splitTimestampMs || 0,
        observedFacts: inv.findings?.observedFacts || [],
        modelInterpretations: inv.findings?.modelInterpretations || [],
        hypotheses: inv.findings?.hypotheses || [],
        evidenceIds: inv.evidenceIds || [],
        dominantSentiment: inv.summaryMetrics?.dominantSentiment || 'neutral',
        peakEmotion: inv.summaryMetrics?.peakEmotion || 'neutral',
        topPlatform: inv.summaryMetrics?.topPlatform || 'X/Twitter',
        primaryCommunity: inv.summaryMetrics?.primaryCommunity || 'Cluster-Alpha',
        viralityRatio: inv.summaryMetrics?.viralityRatio || 1.0,
        totalEvents: inv.summaryMetrics?.totalEvents || 0,
        analystNotes: inv.analystNotes || '',
        status: inv.status || 'active',
      },
    });

    res.json({ success: true, investigation: upserted });
  } catch (error: any) {
    console.error('Prisma upsert investigation error:', error);
    res.status(500).json({ error: error?.message || 'Failed to save investigation' });
  }
});

// 6. Delete Investigation from Supabase via Prisma
app.delete('/api/investigations/:id', async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'DATABASE_URL is not set.' });
  }

  const { id } = req.params;
  try {
    await prisma.investigation.delete({ where: { id } });
    res.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Prisma delete investigation error:', error);
    res.status(500).json({ error: error?.message || 'Failed to delete investigation' });
  }
});

// 7. Initialize Vite Dev Server Middleware or Production Static Handler
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`NEXUS server running on http://localhost:${PORT}`);
    console.log(`Prisma ORM & Supabase integration initialized.`);
  });
}

startServer();
