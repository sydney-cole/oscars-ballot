"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { categories, formatNominee } from "@/lib/nominees";

type RowStatus = "saving" | "saved" | "error";

export function AdminWinnersForm() {
  const winners = useQuery(api.winners.getWinners);
  const settings = useQuery(api.settings.getSettings);
  const setWinner = useMutation(api.winners.setWinner);
  const setBallotsLocked = useMutation(api.settings.setBallotsLocked);

  const [rowStatus, setRowStatus] = useState<Record<string, RowStatus>>({});
  const [lockLoading, setLockLoading] = useState(false);

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

  async function handleLockToggle() {
    if (!settings) return;
    setLockLoading(true);
    try {
      await setBallotsLocked({ locked: !settings.ballotsLocked });
    } finally {
      setLockLoading(false);
    }
  }

  if (winners === undefined || settings === undefined) return null;

  const locked = settings.ballotsLocked;

  return (
    <div className="mt-10 rounded-2xl border border-red-900/30 bg-red-950/20 p-6">
      <h2 className="text-lg font-bold text-red-400 mb-1">Admin: Enter Winners</h2>
      <p className="text-zinc-500 text-sm mb-5">
        Select the winner for each category — scores update live the moment you pick.
      </p>

      {/* Ballot lock toggle */}
      <div className={`flex items-center justify-between rounded-xl px-4 py-3 mb-6 border
        ${locked ? "border-red-700/50 bg-red-900/20" : "border-zinc-700 bg-zinc-900/40"}`}>
        <div>
          <p className="text-sm font-medium text-zinc-200">
            {locked ? "🔒 Ballot submissions are closed" : "🔓 Ballot submissions are open"}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {locked ? "Users can no longer submit new ballots." : "Users can still submit their ballots."}
          </p>
        </div>
        <button
          onClick={handleLockToggle}
          disabled={lockLoading}
          className={`ml-4 shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            ${locked
              ? "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
              : "bg-red-700 text-white hover:bg-red-600"
            }`}
        >
          {lockLoading ? "…" : locked ? "Reopen" : "Lock Ballots"}
        </button>
      </div>

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
