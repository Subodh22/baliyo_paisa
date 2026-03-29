import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
    category: v.optional(v.string()),
    yearMonth: v.optional(v.string()), // "YYYY-MM"
  },
  handler: async (ctx, args) => {
    let txns = await ctx.db.query("transactions").withIndex("by_date").order("desc").collect();

    if (args.type) txns = txns.filter((t) => t.type === args.type);
    if (args.category) txns = txns.filter((t) => t.category === args.category);
    if (args.yearMonth) txns = txns.filter((t) => t.date.startsWith(args.yearMonth!));

    return txns;
  },
});

export const monthlySummary = query({
  args: { yearMonth: v.string() },
  handler: async (ctx, { yearMonth }) => {
    const txns = await ctx.db
      .query("transactions")
      .withIndex("by_date")
      .collect();
    const filtered = txns.filter((t) => t.date.startsWith(yearMonth));

    const income = filtered
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expenses = filtered
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    return { income, expenses, net: income - expenses };
  },
});

export const last12MonthsSummary = query({
  args: {},
  handler: async (ctx) => {
    const txns = await ctx.db.query("transactions").withIndex("by_date").order("desc").collect();
    const months: Record<string, { income: number; expenses: number }> = {};

    for (const t of txns) {
      const ym = t.date.slice(0, 7);
      if (!months[ym]) months[ym] = { income: 0, expenses: 0 };
      if (t.type === "income") months[ym].income += t.amount;
      else months[ym].expenses += t.amount;
    }

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([yearMonth, data]) => ({ yearMonth, ...data }));
  },
});

export const categoryBreakdown = query({
  args: { yearMonth: v.string(), type: v.union(v.literal("income"), v.literal("expense")) },
  handler: async (ctx, { yearMonth, type }) => {
    const txns = await ctx.db.query("transactions").withIndex("by_date").collect();
    const filtered = txns.filter(
      (t) => t.date.startsWith(yearMonth) && t.type === type
    );
    const byCategory: Record<string, number> = {};
    for (const t of filtered) {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    }
    const total = Object.values(byCategory).reduce((s, v) => s + v, 0);
    return Object.entries(byCategory)
      .map(([category, amount]) => ({ category, amount, pct: total ? amount / total : 0 }))
      .sort((a, b) => b.amount - a.amount);
  },
});

export const recentTransactions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    return ctx.db
      .query("transactions")
      .withIndex("by_date")
      .order("desc")
      .take(limit);
  },
});

export const add = mutation({
  args: {
    type: v.union(v.literal("income"), v.literal("expense")),
    amount: v.number(),
    date: v.string(),
    description: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    accountId: v.optional(v.id("accounts")),
    isRecurring: v.optional(v.boolean()),
    recurringFrequency: v.optional(
      v.union(
        v.literal("weekly"),
        v.literal("fortnightly"),
        v.literal("monthly"),
        v.literal("quarterly"),
        v.literal("annually")
      )
    ),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("transactions", {
      ...args,
      currency: "AUD",
      isRecurring: args.isRecurring ?? false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("transactions"),
    amount: v.optional(v.number()),
    date: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    notes: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
    recurringFrequency: v.optional(
      v.union(
        v.literal("weekly"),
        v.literal("fortnightly"),
        v.literal("monthly"),
        v.literal("quarterly"),
        v.literal("annually")
      )
    ),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
