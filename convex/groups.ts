import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Queries ───────────────────────────────────────────────────────────────────

/** Returns the groups the current user belongs to (for tab rendering). */
export const getMyGroups = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const groups = await Promise.all(memberships.map((m) => ctx.db.get(m.groupId)));

    return groups
      .filter((g): g is NonNullable<typeof g> => g !== null)
      .map((g) => ({ id: g._id, name: g.name }));
  },
});

/** Searches groups by name (case-insensitive substring). Never returns passwords. */
export const searchGroups = query({
  args: { term: v.string() },
  handler: async (ctx, { term }) => {
    const lower = term.trim().toLowerCase();
    if (!lower) return [];

    const all = await ctx.db.query("groups").collect();
    return all
      .filter((g) => g.name.toLowerCase().includes(lower))
      .slice(0, 20)
      .map((g) => ({ id: g._id, name: g.name }));
  },
});

/**
 * Returns submitted ballots for members of a group.
 * Returns null if the caller is not a member (access denied).
 */
export const getGroupBallots = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Verify caller is a member
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", groupId).eq("userId", identity.subject)
      )
      .unique();
    if (!membership) return null;

    // Get all member userIds
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();

    const memberUserIds = new Set(members.map((m) => m.userId));

    // Fetch each member's ballot via the by_user index (indexed point lookups)
    const ballots = await Promise.all(
      [...memberUserIds].map((userId) =>
        ctx.db
          .query("ballots")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .unique()
      )
    );

    return ballots.filter(
      (b): b is NonNullable<typeof b> => b !== null && b.submittedAt !== undefined
    );
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

/** Creates a new group with a unique name and auto-joins the creator. */
export const createGroup = mutation({
  args: {
    name: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { name, password }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const trimmed = name.trim();
    if (!trimmed) throw new Error("Group name cannot be empty");
    if (trimmed.length > 50) throw new Error("Group name is too long");
    if (!password.trim()) throw new Error("Password cannot be empty");

    // Uniqueness check via index
    const existing = await ctx.db
      .query("groups")
      .withIndex("by_name", (q) => q.eq("name", trimmed))
      .unique();
    if (existing) throw new Error("A group with that name already exists");

    const groupId = await ctx.db.insert("groups", {
      name: trimmed,
      password: password.trim(),
      createdBy: identity.subject,
      createdAt: Date.now(),
    });

    // Auto-join creator
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: identity.subject,
      joinedAt: Date.now(),
    });

    return groupId;
  },
});

/** Joins a group after verifying the password. No-op if already a member. */
export const joinGroup = mutation({
  args: {
    groupId: v.id("groups"),
    password: v.string(),
  },
  handler: async (ctx, { groupId, password }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const group = await ctx.db.get(groupId);
    if (!group) throw new Error("Group not found");
    if (group.password !== password.trim()) throw new Error("Incorrect password");

    // Idempotency: no-op if already a member
    const existing = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", groupId).eq("userId", identity.subject)
      )
      .unique();
    if (existing) return groupId;

    await ctx.db.insert("groupMembers", {
      groupId,
      userId: identity.subject,
      joinedAt: Date.now(),
    });

    return groupId;
  },
});
