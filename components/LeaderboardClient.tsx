"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { AdminWinnersForm } from "@/components/AdminWinnersForm";
import { GroupPanel } from "@/components/GroupPanel";

const TOTAL_CATEGORIES = 24;

type Ballot = {
  _id: string;
  userName: string;
  submittedAt?: number;
  picks: Record<string, string>;
};

type Props = {
  isAdmin: boolean;
};

function rankBallots(ballots: Ballot[], winners: Record<string, string>) {
  const winnersKnown = Object.keys(winners).length > 0;
  return ballots
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
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    });
}

// Isolated component so useQuery is always called unconditionally within it
function GroupLeaderboard({
  groupId,
  winners,
}: {
  groupId: Id<"groups">;
  winners: Record<string, string>;
}) {
  const ballots = useQuery(api.groups.getGroupBallots, { groupId });

  if (ballots === undefined) {
    return (
      <div className="text-center py-16">
        <div className="text-oscar-gold text-lg animate-pulse">Loading…</div>
      </div>
    );
  }
  if (ballots === null) {
    return <p className="text-zinc-500 text-sm text-center py-8">Access denied.</p>;
  }

  const winnersKnown = Object.keys(winners).length > 0;
  const ranked = rankBallots(ballots, winners);

  return (
    <LeaderboardTable
      ranked={ranked}
      total={ballots.length}
      winnersKnown={winnersKnown}
      totalCategories={TOTAL_CATEGORIES}
    />
  );
}

export function LeaderboardClient({ isAdmin }: Props) {
  const [activeTab, setActiveTab] = useState<"global" | Id<"groups">>("global");
  const [showGroupPanel, setShowGroupPanel] = useState(false);

  const allBallots = useQuery(api.ballots.getAllSubmitted);
  const winners = useQuery(api.winners.getWinners);
  const myGroups = useQuery(api.groups.getMyGroups);

  if (allBallots === undefined || winners === undefined || myGroups === undefined) {
    return (
      <div className="text-center py-16">
        <div className="text-oscar-gold text-lg animate-pulse">Loading…</div>
      </div>
    );
  }

  const winnersKnown = Object.keys(winners).length > 0;

  const tabs = [
    { id: "global" as const, label: "Global" },
    ...myGroups.map((g) => ({ id: g.id as Id<"groups">, label: g.name })),
  ];

  return (
    <>
      {/* Tab bar + manage button */}
      <div className="flex items-start gap-2 mb-6 flex-wrap">
        <div className="flex gap-2 flex-wrap flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? "bg-oscar-gold text-oscar-black"
                  : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowGroupPanel((v) => !v)}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs border border-zinc-700 text-zinc-400
                     hover:border-zinc-500 hover:text-zinc-200 transition-colors whitespace-nowrap"
        >
          {showGroupPanel ? "✕ Close" : "+ Groups"}
        </button>
      </div>

      {/* Sub-header text */}
      <p className="text-zinc-400 text-sm mb-6">
        {winnersKnown
          ? "Ranked by correct picks"
          : "Winners revealed March 15, 2026 · Scores pending"}
      </p>

      {/* Leaderboard content */}
      {activeTab === "global" ? (
        <LeaderboardTable
          ranked={rankBallots(allBallots, winners)}
          total={allBallots.length}
          winnersKnown={winnersKnown}
          totalCategories={TOTAL_CATEGORIES}
        />
      ) : (
        <GroupLeaderboard groupId={activeTab} winners={winners} />
      )}

      {/* Group management panel */}
      {showGroupPanel && <GroupPanel />}

      {isAdmin && <AdminWinnersForm />}
    </>
  );
}
