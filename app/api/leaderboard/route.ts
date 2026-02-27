import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const BALLOTS_FILE = path.join(process.cwd(), "data", "ballots.json");
const WINNERS_FILE = path.join(process.cwd(), "data", "winners.json");

type BallotEntry = {
  id: string;
  name: string;
  picks: Record<string, string>;
  submittedAt: string;
  score: number | null;
};

export async function GET() {
  try {
    let ballots: BallotEntry[] = [];
    let winners: Record<string, string> = {};

    try {
      const raw = await fs.readFile(BALLOTS_FILE, "utf-8");
      ballots = JSON.parse(raw);
    } catch {
      // no entries yet
    }

    try {
      const raw = await fs.readFile(WINNERS_FILE, "utf-8");
      winners = JSON.parse(raw);
    } catch {
      // no winners yet
    }

    const winnersKnown = Object.keys(winners).length > 0;
    const totalCategories = 24;

    const ranked = ballots
      .map((b) => ({
        id: b.id,
        name: b.name,
        submittedAt: b.submittedAt,
        score: winnersKnown
          ? Object.entries(winners).filter(([cat, win]) => b.picks[cat] === win).length
          : null,
        totalPicked: Object.keys(b.picks).length,
      }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    return NextResponse.json({
      ranked,
      total: ballots.length,
      winnersKnown,
      totalCategories,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
