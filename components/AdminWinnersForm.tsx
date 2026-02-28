"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { categories, formatNominee } from "@/lib/nominees";

type RowStatus = "saving" | "saved" | "error";

export function AdminWinnersForm() {
  const winners = useQuery(api.winners.getWinners);
  const setWinner = useMutation(api.winners.setWinner);

  const [rowStatus, setRowStatus] = useState<Record<string, RowStatus>>({});

  async function handleChange(category: string, pickKey: string) {
    setRowStatus((s) => ({ ...s, [category]: "saving" }));
    try {
      await setWinner({ category, pickKey });
      setRowStatus((s) => ({ ...s, [category]: "saved" }));
      // Clear the "saved" indicator after 2s
      setTimeout(() => {
        setRowStatus((s) => {
          const next = { ...s };
          if (next[category] === "saved") delete next[category];
          return next;
        });
      }, 2000);
    } catch {
      setRowStatus((s) => ({ ...s, [category]: "error" }));
    }
  }

  if (winners === undefined) return null;

  return (
    <div className="mt-10 rounded-2xl border border-red-900/30 bg-red-950/20 p-6">
      <h2 className="text-lg font-bold text-red-400 mb-1">Admin: Enter Winners</h2>
      <p className="text-zinc-500 text-sm mb-5">
        Select the winner for each category — scores update live the moment you pick.
      </p>

      <div className="space-y-4">
        {categories.map((cat) => {
          const nominees = cat.nominees.map((n) => formatNominee(n));
          const status = rowStatus[cat.category];

          return (
            <div key={cat.category}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs uppercase tracking-wide text-zinc-500">
                  {cat.category}
                </label>
                {status === "saving" && (
                  <span className="text-xs text-zinc-500 animate-pulse">Saving…</span>
                )}
                {status === "saved" && (
                  <span className="text-xs text-green-500">✓ Saved</span>
                )}
                {status === "error" && (
                  <span className="text-xs text-red-400">Error — try again</span>
                )}
              </div>
              <select
                value={winners[cat.category] ?? ""}
                onChange={(e) => handleChange(cat.category, e.target.value)}
                disabled={status === "saving"}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-zinc-100
                           focus:outline-none focus:border-red-500 transition-colors text-sm
                           disabled:opacity-50"
              >
                <option value="">— Not yet announced —</option>
                {nominees.map((n) => (
                  <option key={n.pickKey} value={n.pickKey}>
                    {n.primaryLine}{n.secondaryLine ? ` (${n.secondaryLine})` : ""}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
