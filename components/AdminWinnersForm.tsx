"use client";

import { useState, useEffect } from "react";
import { categories } from "@/lib/nominees";
import { formatNominee } from "@/lib/nominees";

export function AdminWinnersForm() {
  const [secret, setSecret] = useState("");
  const [winners, setWinners] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Load existing winners
    fetch("/api/winners")
      .then((r) => r.json())
      .then((data) => setWinners(data ?? {}))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!secret.trim()) {
      setMessage("Enter the admin secret.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/winners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify(winners),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "Error saving.");
      } else {
        setMessage("Winners saved successfully!");
      }
    } catch {
      setMessage("Network error.");
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

      <label className="block text-xs uppercase tracking-wide text-zinc-400 mb-1.5">
        Admin Secret
      </label>
      <input
        type="password"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        placeholder="Enter admin secret…"
        className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-zinc-100
                   placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors text-sm mb-5"
      />

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
