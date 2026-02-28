"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type Mode = "join" | "create";

export function GroupPanel() {
  const [mode, setMode] = useState<Mode>("join");

  // ── Create state ──────────────────────────────────────────────────────────
  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createStatus, setCreateStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // ── Join state ────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<{ id: Id<"groups">; name: string } | null>(null);
  const [joinPassword, setJoinPassword] = useState("");
  const [joinStatus, setJoinStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);

  const searchResults = useQuery(
    api.groups.searchGroups,
    searchTerm.trim().length > 0 ? { term: searchTerm } : "skip"
  );

  const createGroup = useMutation(api.groups.createGroup);
  const joinGroup = useMutation(api.groups.joinGroup);

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateStatus(null);
    setCreateLoading(true);
    try {
      await createGroup({ name: createName.trim(), password: createPassword.trim() });
      setCreateName("");
      setCreatePassword("");
      setCreateStatus({ type: "success", msg: "Group created! It now appears in your tabs." });
    } catch (err) {
      setCreateStatus({ type: "error", msg: err instanceof Error ? err.message : "Failed to create group" });
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGroup) return;
    setJoinStatus(null);
    setJoinLoading(true);
    try {
      await joinGroup({ groupId: selectedGroup.id, password: joinPassword.trim() });
      setJoinStatus({ type: "success", msg: `Joined "${selectedGroup.name}"! It now appears in your tabs.` });
      setSearchTerm("");
      setSelectedGroup(null);
      setJoinPassword("");
    } catch (err) {
      setJoinStatus({ type: "error", msg: err instanceof Error ? err.message : "Failed to join group" });
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-oscar-surface p-6 mt-8">
      <h2
        className="text-lg font-bold text-zinc-100 mb-4"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        Groups
      </h2>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        {(["join", "create"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setCreateStatus(null); setJoinStatus(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
              ${mode === m
                ? "bg-oscar-gold text-oscar-black"
                : "border border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
          >
            {m === "join" ? "Join a Group" : "Create a Group"}
          </button>
        ))}
      </div>

      {/* Create */}
      {mode === "create" && (
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            className="input-field"
            placeholder="Group name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            maxLength={50}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password (share this with your friends)"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
            required
          />
          {createStatus && (
            <p className={`text-sm ${createStatus.type === "error" ? "text-red-400" : "text-green-400"}`}>
              {createStatus.msg}
            </p>
          )}
          <button type="submit" disabled={createLoading} className="btn-gold">
            {createLoading ? "Creating…" : "Create Group"}
          </button>
        </form>
      )}

      {/* Join */}
      {mode === "join" && (
        <div className="flex flex-col gap-3">
          <input
            className="input-field"
            placeholder="Search groups by name…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedGroup(null);
              setJoinPassword("");
              setJoinStatus(null);
            }}
          />

          {/* Search results */}
          {!selectedGroup && searchResults && searchResults.length > 0 && (
            <ul className="rounded-xl border border-zinc-800 overflow-hidden">
              {searchResults.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => { setSelectedGroup(g); setSearchTerm(g.name); }}
                    className="w-full text-left px-4 py-3 text-sm text-zinc-300
                               hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
                  >
                    {g.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!selectedGroup && searchResults && searchResults.length === 0 && searchTerm.trim() && (
            <p className="text-zinc-600 text-sm text-center py-2">No groups found</p>
          )}

          {/* Password entry after selecting a group */}
          {selectedGroup && (
            <form onSubmit={handleJoin} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Joining:</span>
                <span className="text-sm font-medium text-zinc-200">{selectedGroup.name}</span>
                <button
                  type="button"
                  onClick={() => { setSelectedGroup(null); setSearchTerm(""); setJoinStatus(null); }}
                  className="ml-auto text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  ✕ Change
                </button>
              </div>
              <input
                className="input-field"
                type="password"
                placeholder="Password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                required
                autoFocus
              />
              {joinStatus && (
                <p className={`text-sm ${joinStatus.type === "error" ? "text-red-400" : "text-green-400"}`}>
                  {joinStatus.msg}
                </p>
              )}
              <button type="submit" disabled={joinLoading} className="btn-gold">
                {joinLoading ? "Joining…" : `Join "${selectedGroup.name}"`}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
