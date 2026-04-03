import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// Max entries kept in the leaderboard
const MAX_ENTRIES = 100;

interface Entry {
  name: string;
  score: number;
  level: number;
  employeeId: string;
  date: string;
}

// ── KV helpers (Vercel KV) ──────────────────────────────────────────────────
async function kvGet(): Promise<Entry[]> {
  try {
    const { kv } = await import('@vercel/kv');
    const data = await kv.get<Entry[]>('leaderboard');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function kvSet(entries: Entry[]): Promise<void> {
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set('leaderboard', entries);
  } catch {
    // Ignore — fallback below handles persistence
  }
}

// ── File-based fallback (dev / no KV) ──────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), 'data');
const LB_FILE = path.join(DATA_DIR, 'leaderboard.json');

function fileGet(): Entry[] {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(LB_FILE)) return [];
    return JSON.parse(fs.readFileSync(LB_FILE, 'utf-8')) as Entry[];
  } catch {
    return [];
  }
}

function fileSet(entries: Entry[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(LB_FILE, JSON.stringify(entries, null, 2));
  } catch {
    // Ignore
  }
}

const hasKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

async function getEntries(): Promise<Entry[]> {
  return hasKV ? await kvGet() : fileGet();
}

async function saveEntries(entries: Entry[]): Promise<void> {
  if (hasKV) await kvSet(entries);
  else fileSet(entries);
}

// ── GET /api/leaderboard ────────────────────────────────────────────────────
export async function GET() {
  const entries = await getEntries();
  const sorted = [...entries].sort((a, b) => b.score - a.score).slice(0, 50);
  return NextResponse.json({ entries: sorted, total: entries.length }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

// ── POST /api/leaderboard ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { name, score, level, employeeId } = await req.json();

    if (!name || typeof score !== 'number' || typeof level !== 'number') {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const entries = await getEntries();

    // Remove previous entry from same employeeId (keep best score)
    const existingIdx = entries.findIndex(e => e.employeeId === employeeId);
    if (existingIdx !== -1) {
      // Only replace if new score is better
      if (score <= entries[existingIdx].score) {
        const rank = [...entries].sort((a, b) => b.score - a.score).findIndex(e => e.employeeId === employeeId) + 1;
        return NextResponse.json({ success: true, rank });
      }
      entries.splice(existingIdx, 1);
    }

    const newEntry: Entry = {
      name: String(name).slice(0, 20),
      score: Math.floor(score),
      level: Math.min(Math.floor(level), 25),
      employeeId: String(employeeId || 'GS-000000').slice(0, 12),
      date: new Date().toISOString(),
    };

    entries.push(newEntry);
    const sorted = entries.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
    await saveEntries(sorted);

    const rank = sorted.findIndex(e => e.employeeId === newEntry.employeeId) + 1;
    return NextResponse.json({ success: true, rank });
  } catch (err) {
    console.error('[leaderboard POST]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
