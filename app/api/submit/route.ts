import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const BALLOTS_FILE = path.join(process.cwd(), "data", "ballots.json");

type BallotEntry = {
  id: string;
  name: string;
  picks: Record<string, string>;
  submittedAt: string;
};

async function readBallots(): Promise<BallotEntry[]> {
  try {
    const raw = await fs.readFile(BALLOTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, picks } = body;

    if (!name?.trim() || typeof picks !== "object" || picks === null) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const ballots = await readBallots();

    const entry: BallotEntry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      picks,
      submittedAt: new Date().toISOString(),
    };

    ballots.push(entry);
    await fs.writeFile(BALLOTS_FILE, JSON.stringify(ballots, null, 2));

    return NextResponse.json({ ok: true, id: entry.id });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
