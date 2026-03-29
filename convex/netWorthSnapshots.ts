import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const history = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 24 }) => {
    const all = await ctx.db
      .query("netWorthSnapshots")
      .withIndex("by_date")
      .order("asc")
      .collect();
    return all.slice(-limit);
  },
});

export const latest = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("netWorthSnapshots")
      .withIndex("by_date")
      .order("desc")
      .first();
  },
});

export const takeSnapshot = mutation({
  args: {
    totalAssets: v.number(),
    totalLiabilities: v.number(),
    investableAssets: v.number(),
    superBalance: v.number(),
    cashBalance: v.number(),
    propertyValue: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const yearMonth = date.slice(0, 7);

    // Overwrite if same month already exists
    const existing = await ctx.db
      .query("netWorthSnapshots")
      .withIndex("by_yearMonth", (q) => q.eq("yearMonth", yearMonth))
      .first();

    const data = {
      ...args,
      netWorth: args.totalAssets - args.totalLiabilities,
      date,
      yearMonth,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }
    return ctx.db.insert("netWorthSnapshots", data);
  },
});
