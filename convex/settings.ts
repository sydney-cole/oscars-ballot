import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? "").split(",").filter(Boolean);

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db.query("settings").first();
    return { ballotsLocked: doc?.ballotsLocked ?? false };
  },
});

export const setBallotsLocked = mutation({
  args: { locked: v.boolean() },
  handler: async (ctx, { locked }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !ADMIN_USER_IDS.includes(identity.subject)) {
      throw new Error("Unauthorized");
    }
    const existing = await ctx.db.query("settings").first();
    if (existing) {
      await ctx.db.patch(existing._id, { ballotsLocked: locked });
    } else {
      await ctx.db.insert("settings", { ballotsLocked: locked });
    }
  },
});
