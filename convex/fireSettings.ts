import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("fireSettings").first();
    return settings;
  },
});

export const upsert = mutation({
  args: {
    currentAge: v.number(),
    targetRetirementAge: v.number(),
    currentAnnualExpenses: v.number(),
    targetAnnualExpenses: v.number(),
    leanFireAnnualExpenses: v.number(),
    expectedReturnRate: v.number(),
    inflationRate: v.number(),
    withdrawalRate: v.number(),
    currentPortfolioValue: v.number(),
    annualSavingsContribution: v.number(),
    superBalance: v.number(),
    superContributionRate: v.number(),
    preservationAge: v.number(),
    includeSuper: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("fireSettings").first();
    const data = { ...args, updatedAt: new Date().toISOString() };
    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }
    return ctx.db.insert("fireSettings", data);
  },
});

// Seed default settings if none exist
export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("fireSettings").first();
    if (existing) return existing._id;
    return ctx.db.insert("fireSettings", {
      currentAge: 30,
      targetRetirementAge: 45,
      currentAnnualExpenses: 6000000, // $60,000 AUD cents
      targetAnnualExpenses: 6000000,
      leanFireAnnualExpenses: 4000000, // $40,000
      expectedReturnRate: 7.0,
      inflationRate: 3.0,
      withdrawalRate: 4.0,
      currentPortfolioValue: 10000000, // $100,000
      annualSavingsContribution: 3000000, // $30,000
      superBalance: 5000000, // $50,000
      superContributionRate: 11.0,
      preservationAge: 60,
      includeSuper: false,
      updatedAt: new Date().toISOString(),
    });
  },
});
