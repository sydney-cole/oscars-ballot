import Link from "next/link";
import { LeaderboardClient } from "@/components/LeaderboardClient";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ admin?: string }>;
}) {
  const params = await searchParams;
  const isAdmin = params.admin === "1";

  return (
    <div className="min-h-screen bg-oscar-black">
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-16">
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
        <div className="gold-divider mt-4 mb-8" />

        <LeaderboardClient isAdmin={isAdmin} />
      </div>
    </div>
  );
}
