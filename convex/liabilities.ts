import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("liabilities").collect(),
});

export const add = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("mortgage"),
      v.literal("personal_loan"),
      v.literal("car_loan"),
      v.literal("credit_card"),
      v.literal("hecs"),
      v.literal("other")
    ),
    balance: v.number(),
    originalBalance: v.number(),
    interestRate: v.number(),
    minimumPayment: v.optional(v.number()),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    lender: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("liabilities", { ...args, lastUpdated: new Date().toISOString() });
  },
});

export const update = mutation({
  args: {
    id: v.id("liabilities"),
    name: v.optional(v.string()),
    balance: v.optional(v.number()),
    interestRate: v.optional(v.number()),
    minimumPayment: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, { ...fields, lastUpdated: new Date().toISOString() });
  },
});

export const remove = mutation({
  args: { id: v.id("liabilities") },
  handler: async (ctx, { id }) => ctx.db.delete(id),
});
