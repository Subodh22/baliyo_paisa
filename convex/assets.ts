import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("assets").collect(),
});

export const totalByType = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("assets").collect();
    const byType: Record<string, number> = {};
    for (const a of all) {
      byType[a.type] = (byType[a.type] || 0) + a.value;
    }
    return byType;
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("cash"),
      v.literal("super"),
      v.literal("etf"),
      v.literal("shares"),
      v.literal("property"),
      v.literal("bonds"),
      v.literal("crypto"),
      v.literal("other")
    ),
    value: v.number(),
    costBasis: v.optional(v.number()),
    accountId: v.optional(v.id("accounts")),
    ticker: v.optional(v.string()),
    units: v.optional(v.number()),
    purchaseDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("assets", { ...args, lastUpdated: new Date().toISOString() });
  },
});

export const update = mutation({
  args: {
    id: v.id("assets"),
    name: v.optional(v.string()),
    value: v.optional(v.number()),
    costBasis: v.optional(v.number()),
    ticker: v.optional(v.string()),
    units: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, { ...fields, lastUpdated: new Date().toISOString() });
  },
});

export const remove = mutation({
  args: { id: v.id("assets") },
  handler: async (ctx, { id }) => ctx.db.delete(id),
});
