import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const WINNERS_FILE = path.join(process.cwd(), "data", "winners.json");

export async function GET() {
  try {
    const raw = await fs.readFile(WINNERS_FILE, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(req: Request) {
  const adminSecret = process.env.ADMIN_SECRET;
  const authHeader = req.headers.get("x-admin-secret");

  if (!adminSecret || authHeader !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const winners = await req.json();
    if (typeof winners !== "object" || winners === null) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await fs.writeFile(WINNERS_FILE, JSON.stringify(winners, null, 2));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
