import Link from "next/link";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { AdminWinnersForm } from "@/components/AdminWinnersForm";

export const dynamic = "force-dynamic";

type LeaderboardData = {
  ranked: Array<{
    id: string;
    name: string;
    submittedAt: string;
    score: number | null;
    totalPicked: number;
  }>;
  total: number;
  winnersKnown: boolean;
  totalCategories: number;
};

async function getLeaderboard(): Promise<LeaderboardData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/leaderboard`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  } catch {
    return { ranked: [], total: 0, winnersKnown: false, totalCategories: 24 };
  }
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ admin?: string }>;
}) {
  const data = await getLeaderboard();
  const params = await searchParams;
  const isAdmin = params.admin === "1";

  return (
    <div className="min-h-screen bg-oscar-black">
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-16">
        {/* Header */}
        <Link
          href="/"
          className="text-zinc-500 hover:text-oscar-gold transition-colors text-sm mb-6 block"
        >
          ← Home
        </Link>

        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">98th Academy Awards</p>
        <h1
          className="text-3xl sm:text-4xl font-bold text-zinc-100"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Leaderboard
        </h1>
        <p className="mt-2 text-zinc-400 text-sm">
          {data.winnersKnown
            ? "Ranked by correct picks"
            : "Winners revealed March 15, 2026 · Scores pending"}
        </p>
        <div className="gold-divider mt-4 mb-8" />

        <LeaderboardTable
          ranked={data.ranked}
          total={data.total}
          winnersKnown={data.winnersKnown}
          totalCategories={data.totalCategories}
        />

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/ballot"
            className="inline-block rounded-full border border-oscar-gold text-oscar-gold px-8 py-3 text-sm font-medium
                       hover:bg-oscar-gold hover:text-oscar-black transition-all"
          >
            Fill Out Your Ballot
          </Link>
        </div>

        {/* Admin section */}
        {isAdmin && <AdminWinnersForm />}
      </div>
    </div>
  );
}
