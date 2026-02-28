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

  groups: defineTable({
    name: v.string(),
    password: v.string(),
    createdBy: v.string(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.string(),
    joinedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_and_user", ["groupId", "userId"]),

  settings: defineTable({
    ballotsLocked: v.boolean(),
  }),
});
