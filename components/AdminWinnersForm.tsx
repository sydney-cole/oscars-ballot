"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { categories, formatNominee } from "@/lib/nominees";

export function AdminWinnersForm() {
  const existingWinners = useQuery(api.winners.getWinners);
  const setWinnersMutation = useMutation(api.winners.setWinners);

  const [winners, setWinners] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (existingWinners !== undefined && !initialized) {
      setWinners(existingWinners);
      setInitialized(true);
    }
  }, [existingWinners, initialized]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await setWinnersMutation({ picks: winners });
      setMessage("Winners saved successfully!");
    } catch {
      setMessage("Error saving winners.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-10 rounded-2xl border border-red-900/30 bg-red-950/20 p-6">
      <h2 className="text-lg font-bold text-red-400 mb-1">Admin: Enter Winners</h2>
      <p className="text-zinc-500 text-sm mb-5">
        Select the actual winner for each category. Scores update immediately once saved.
      </p>

      <div className="space-y-4">
        {categories.map((cat) => {
          const nominees = cat.nominees.map((n) => formatNominee(n));
          return (
            <div key={cat.category}>
              <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-1.5">
                {cat.category}
              </label>
              <select
                value={winners[cat.category] ?? ""}
                onChange={(e) =>
                  setWinners((prev) => ({
                    ...prev,
                    [cat.category]: e.target.value,
                  }))
                }
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-zinc-100
                           focus:outline-none focus:border-red-500 transition-colors text-sm"
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

      {message && (
        <p className={`mt-4 text-sm ${message.includes("success") ? "text-green-400" : "text-red-400"}`}>
          {message}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-5 w-full rounded-full bg-red-700 text-white font-semibold py-3 text-sm
                   hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving…" : "Save Winners"}
      </button>
    </div>
  );
}
