"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { AdminWinnersForm } from "@/components/AdminWinnersForm";

const TOTAL_CATEGORIES = 24;

type Props = {
  isAdmin: boolean;
};

export function LeaderboardClient({ isAdmin }: Props) {
  const ballots = useQuery(api.ballots.getAllSubmitted);
  const winners = useQuery(api.winners.getWinners);

  if (ballots === undefined || winners === undefined) {
    return (
      <div className="text-center py-16">
        <div className="text-oscar-gold text-lg animate-pulse">Loading…</div>
      </div>
    );
  }

  const winnersKnown = Object.keys(winners).length > 0;

  const ranked = ballots
    .map((b) => ({
      id: b._id,
      name: b.userName,
      submittedAt: new Date(b.submittedAt!).toISOString(),
      score: winnersKnown
        ? Object.entries(winners).filter(([cat, win]) => b.picks[cat] === win).length
        : null,
      totalPicked: Object.keys(b.picks).length,
    }))
    .sort((a, b) => {
      const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      // Tiebreak: earlier submission wins
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    });

  return (
    <>
      <LeaderboardTable
        ranked={ranked}
        total={ballots.length}
        winnersKnown={winnersKnown}
        totalCategories={TOTAL_CATEGORIES}
      />
      {isAdmin && <AdminWinnersForm />}
    </>
  );
}
