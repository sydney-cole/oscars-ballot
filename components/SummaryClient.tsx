"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { categories, formatNominee } from "@/lib/nominees";
import { loadPicks, loadName, saveName, clearBallot, type Picks } from "@/lib/picks";

export function SummaryClient() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [picks, setPicks] = useState<Picks>({});
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPicks(loadPicks());
    setName(loadName());
    setHydrated(true);
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    saveName(val);
  };

  const totalPicked = categories.filter((c) => picks[c.category]).length;
  const totalCategories = categories.length;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter your name to submit.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), picks }),
      });
      if (!res.ok) throw new Error("Submission failed");
      clearBallot();
      router.push("/leaderboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (!hydrated) {
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
          {totalPicked} of {totalCategories} categories filled
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
                {/* Category + pick */}
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

                {/* Edit button */}
                <button
                  onClick={() =>
                    router.push(`/ballot?index=${index}&returnTo=summary`)
                  }
                  className="shrink-0 text-xs text-oscar-gold border border-oscar-gold/40 rounded-full px-3 py-1
                             hover:bg-oscar-gold hover:text-oscar-black transition-all"
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>

        {/* Submission form */}
        <div className="mt-10 rounded-2xl border border-zinc-800 bg-oscar-surface p-6">
          <h2
            className="text-xl font-bold text-zinc-100 mb-1"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Submit Your Ballot
          </h2>
          <p className="text-zinc-400 text-sm mb-5">
            Your picks will appear on the leaderboard. Once submitted, you cannot edit them.
          </p>

          <label className="block text-xs uppercase tracking-wide text-zinc-400 mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter your name…"
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 text-zinc-100
                       placeholder-zinc-600 focus:outline-none focus:border-oscar-gold transition-colors text-sm"
          />

          {error && (
            <p className="mt-3 text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || totalPicked === 0}
            className="mt-4 w-full rounded-full bg-oscar-gold text-oscar-black font-semibold py-3.5 text-sm
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

        {/* Continue ballot link */}
        {totalPicked < totalCategories && (
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
