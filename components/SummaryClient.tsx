"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { categories, formatNominee } from "@/lib/nominees";

export function SummaryClient() {
  const router = useRouter();
  const { user } = useUser();
  const ballot = useQuery(api.ballots.getMyBallot);
  const submitBallotMutation = useMutation(api.ballots.submitBallot);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const picks = ballot?.picks ?? {};
  const isSubmitted = !!ballot?.submittedAt;
  const totalPicked = categories.filter((c) => picks[c.category]).length;
  const totalCategories = categories.length;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await submitBallotMutation({});
      router.push("/leaderboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (ballot === undefined) {
    return (
      <div className="min-h-screen bg-oscar-black flex items-center justify-center">
        <div className="text-oscar-gold text-lg animate-pulse">Loading your picks…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-oscar-black">
      {/* Header */}
      <header className="px-6 pt-8 pb-6 max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="text-zinc-500 hover:text-oscar-gold transition-colors text-sm mb-6 block"
        >
          ← Home
        </button>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Your Ballot</p>
        <h1
          className="text-3xl sm:text-4xl font-bold text-zinc-100"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Review Your Picks
        </h1>
        <p className="mt-2 text-zinc-400 text-sm">
          {isSubmitted
            ? "Your ballot has been submitted."
            : `${totalPicked} of ${totalCategories} categories filled`}
        </p>
        <div className="gold-divider mt-4" />
      </header>

      {/* Summary list */}
      <main className="px-6 pb-8 max-w-2xl mx-auto">
        <div className="space-y-3">
          {categories.map((cat, index) => {
            const pick = picks[cat.category];
            const nominee = pick
              ? cat.nominees
                  .map((n) => formatNominee(n))
                  .find((n) => n.pickKey === pick)
              : null;

            return (
              <div
                key={cat.category}
                className="flex items-center gap-4 rounded-xl bg-oscar-surface border border-zinc-800 px-5 py-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wide text-zinc-500 mb-0.5">
                    {cat.category}
                  </p>
                  {nominee ? (
                    <p className="text-zinc-100 font-medium text-sm leading-snug truncate">
                      {nominee.primaryLine}
                      {nominee.secondaryLine && (
                        <span className="text-zinc-400 font-normal"> — {nominee.secondaryLine}</span>
                      )}
                    </p>
                  ) : (
                    <p className="text-zinc-600 text-sm italic">No pick selected</p>
                  )}
                </div>

                {!isSubmitted && (
                  <button
                    onClick={() =>
                      router.push(`/ballot?index=${index}&returnTo=summary`)
                    }
                    className="shrink-0 text-xs text-oscar-gold border border-oscar-gold/40 rounded-full px-3 py-1
                               hover:bg-oscar-gold hover:text-oscar-black transition-all"
                  >
                    Edit
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {isSubmitted ? (
          <div className="mt-10 rounded-2xl border border-green-900/30 bg-green-950/20 p-6 text-center">
            <p className="text-green-400 font-semibold text-lg mb-1">Ballot Submitted!</p>
            <p className="text-zinc-400 text-sm mb-4">
              Submitted as <span className="text-zinc-200">{ballot.userName}</span>
            </p>
            <button
              onClick={() => router.push("/leaderboard")}
              className="rounded-full bg-oscar-gold text-oscar-black font-semibold py-3 px-8 text-sm
                         hover:bg-oscar-gold-light transition-colors"
            >
              View Leaderboard
            </button>
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-zinc-800 bg-oscar-surface p-6">
            <h2
              className="text-xl font-bold text-zinc-100 mb-1"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Submit Your Ballot
            </h2>
            <p className="text-zinc-400 text-sm mb-5">
              Submitting as{" "}
              <span className="text-zinc-200">
                {user?.fullName ?? user?.username ?? "you"}
              </span>
              . Once submitted, you cannot edit your picks.
            </p>

            {error && <p className="mb-3 text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting || totalPicked === 0}
              className="w-full rounded-full bg-oscar-gold text-oscar-black font-semibold py-3.5 text-sm
                         hover:bg-oscar-gold-light transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit Ballot"}
            </button>

            {totalPicked < totalCategories && (
              <p className="mt-3 text-zinc-500 text-xs text-center">
                You have {totalCategories - totalPicked} unanswered{" "}
                {totalCategories - totalPicked === 1 ? "category" : "categories"}.
                You can still submit.
              </p>
            )}
          </div>
        )}

        {!isSubmitted && totalPicked < totalCategories && (
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/ballot")}
              className="text-sm text-zinc-500 hover:text-oscar-gold transition-colors underline underline-offset-4"
            >
              Continue filling out ballot →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
