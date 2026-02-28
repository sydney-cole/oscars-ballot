import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ballots: defineTable({
    userId: v.string(),
    userName: v.string(),
    picks: v.record(v.string(), v.string()),
    submittedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  winners: defineTable({
    picks: v.record(v.string(), v.string()),
  }),
});
