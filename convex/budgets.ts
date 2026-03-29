import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const FREQ = v.union(
  v.literal("weekly"),
  v.literal("fortnightly"),
  v.literal("monthly"),
  v.literal("quarterly"),
  v.literal("annually")
);

export const listForMonth = query({
  args: { yearMonth: v.string() },
  handler: async (ctx, { yearMonth }) => {
    return ctx.db
      .query("budgets")
      .withIndex("by_yearMonth", (q) => q.eq("yearMonth", yearMonth))
      .collect();
  },
});

export const upsert = mutation({
  args: {
    category: v.string(),
    monthlyLimit: v.number(),       // already converted to monthly
    budgetAmount: v.number(),       // raw entered value
    budgetFrequency: FREQ,
    yearMonth: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_yearMonth", (q) => q.eq("yearMonth", args.yearMonth))
      .filter((q) => q.eq(q.field("category"), args.category))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        monthlyLimit: args.monthlyLimit,
        budgetAmount: args.budgetAmount,
        budgetFrequency: args.budgetFrequency,
      });
      return existing._id;
    }
    return ctx.db.insert("budgets", {
      category: args.category,
      monthlyLimit: args.monthlyLimit,
      budgetAmount: args.budgetAmount,
      budgetFrequency: args.budgetFrequency,
      yearMonth: args.yearMonth,
    });
  },
});

export const upsertActual = mutation({
  args: {
    category: v.string(),
    actualOverride: v.optional(v.number()),
    actualFrequency: v.optional(FREQ),
    yearMonth: v.string(),
  },
  handler: async (ctx, { category, actualOverride, actualFrequency, yearMonth }) => {
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_yearMonth", (q) => q.eq("yearMonth", yearMonth))
      .filter((q) => q.eq(q.field("category"), category))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { actualOverride, actualFrequency });
      return existing._id;
    }
    return ctx.db.insert("budgets", {
      category,
      monthlyLimit: 0,
      actualOverride,
      actualFrequency,
      yearMonth,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("budgets") },
  handler: async (ctx, { id }) => ctx.db.delete(id),
});
