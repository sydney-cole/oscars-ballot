type Entry = {
  id: string;
  name: string;
  submittedAt: string;
  score: number | null;
  totalPicked: number;
};

type Props = {
  ranked: Entry[];
  total: number;
  winnersKnown: boolean;
  totalCategories: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LeaderboardTable({ ranked, total, winnersKnown, totalCategories }: Props) {
  if (total === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-4">🏆</p>
        <p className="text-zinc-300 text-lg font-medium">No ballots submitted yet.</p>
        <p className="text-zinc-500 text-sm mt-1">Be the first to make your picks!</p>
      </div>
    );
  }

  return (
    <div>
      {!winnersKnown && (
        <div className="rounded-xl border border-oscar-gold/20 bg-oscar-gold/5 px-5 py-3.5 mb-6 text-sm text-oscar-gold">
          Winners will be revealed on <strong>March 15, 2026</strong>. Scores will update automatically.
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[40px_1fr_120px_120px] gap-4 px-5 py-3 bg-oscar-charcoal border-b border-zinc-800">
          <span className="text-xs uppercase tracking-wide text-zinc-500">#</span>
          <span className="text-xs uppercase tracking-wide text-zinc-500">Name</span>
          <span className="text-xs uppercase tracking-wide text-zinc-500 text-right">Score</span>
          <span className="text-xs uppercase tracking-wide text-zinc-500 text-right">Submitted</span>
        </div>

        {/* Rows */}
        {ranked.map((entry, i) => {
          const rank = i + 1;
          const isTop3 = rank <= 3;
          const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

          return (
            <div
              key={entry.id}
              className={`grid grid-cols-[40px_1fr_120px_120px] gap-4 px-5 py-4 border-b border-zinc-800/50 last:border-0
                ${isTop3 ? "bg-oscar-gold/5" : "bg-oscar-surface"}`}
            >
              <span className="text-sm font-bold text-zinc-400 flex items-center">
                {medal ?? <span className="text-zinc-600">{rank}</span>}
              </span>

              <div className="flex flex-col justify-center">
                <span className={`font-semibold text-sm ${isTop3 ? "text-oscar-gold" : "text-zinc-200"}`}>
                  {entry.name}
                </span>
                <span className="text-xs text-zinc-600">
                  {entry.totalPicked}/{totalCategories} categories filled
                </span>
              </div>

              <div className="flex items-center justify-end">
                {winnersKnown ? (
                  <span className={`text-sm font-bold ${isTop3 ? "text-oscar-gold" : "text-zinc-300"}`}>
                    {entry.score}/{totalCategories}
                  </span>
                ) : (
                  <span className="text-sm text-zinc-600">?/{totalCategories}</span>
                )}
              </div>

              <div className="flex items-center justify-end">
                <span className="text-xs text-zinc-600">{formatDate(entry.submittedAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-zinc-600 text-xs mt-4">
        {total} {total === 1 ? "ballot" : "ballots"} submitted
      </p>
    </div>
  );
}
