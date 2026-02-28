import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getWinners = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db.query("winners").first();
    return doc?.picks ?? {};
  },
});

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? "").split(",").filter(Boolean);

export const setWinners = mutation({
  args: {
    picks: v.record(v.string(), v.string()),
  },
  handler: async (ctx, { picks }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !ADMIN_USER_IDS.includes(identity.subject)) {
      throw new Error("Unauthorized");
    }
    const existing = await ctx.db.query("winners").first();
    if (existing) {
      await ctx.db.patch(existing._id, { picks });
    } else {
      await ctx.db.insert("winners", { picks });
    }
  },
});

/** Sets a single category's winner. Merges into the existing picks record. */
export const setWinner = mutation({
  args: {
    category: v.string(),
    pickKey: v.string(),
  },
  handler: async (ctx, { category, pickKey }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !ADMIN_USER_IDS.includes(identity.subject)) {
      throw new Error("Unauthorized");
    }
    const existing = await ctx.db.query("winners").first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        picks: { ...existing.picks, [category]: pickKey },
      });
    } else {
      await ctx.db.insert("winners", { picks: { [category]: pickKey } });
    }
  },
});
