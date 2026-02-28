import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getMyBallot = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("ballots")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();
  },
});

export const savePick = mutation({
  args: {
    category: v.string(),
    pickKey: v.string(),
  },
  handler: async (ctx, { category, pickKey }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const existing = await ctx.db
      .query("ballots")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existing) {
      if (existing.submittedAt) return; // ballot is locked
      await ctx.db.patch(existing._id, {
        picks: { ...existing.picks, [category]: pickKey },
      });
    } else {
      await ctx.db.insert("ballots", {
        userId: identity.subject,
        userName: identity.name ?? identity.email ?? "Anonymous",
        picks: { [category]: pickKey },
      });
    }
  },
});

export const submitBallot = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const existing = await ctx.db
      .query("ballots")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!existing) throw new Error("No ballot found");
    if (existing.submittedAt) return; // already submitted

    await ctx.db.patch(existing._id, { submittedAt: Date.now() });
  },
});

export const getAllSubmitted = query({
  args: {},
  handler: async (ctx) => {
    const ballots = await ctx.db.query("ballots").collect();
    return ballots.filter((b) => b.submittedAt !== undefined);
  },
});
