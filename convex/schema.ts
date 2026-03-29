import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  transactions: defineTable({
    type: v.union(v.literal("income"), v.literal("expense")),
    amount: v.number(), // AUD cents (integer)
    currency: v.string(), // "AUD"
    date: v.string(), // ISO "YYYY-MM-DD"
    description: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    accountId: v.optional(v.id("accounts")),
    isRecurring: v.boolean(),
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
  })
    .index("by_date", ["date"])
    .index("by_type", ["type"])
    .index("by_category", ["category"])
    .index("by_account", ["accountId"]),

  accounts: defineTable({
    name: v.string(),
    institution: v.string(),
    type: v.union(
      v.literal("checking"),
      v.literal("savings"),
      v.literal("offset"),
      v.literal("super"),
      v.literal("brokerage"),
      v.literal("crypto"),
      v.literal("other")
    ),
    balance: v.number(), // AUD cents
    currency: v.string(),
    isActive: v.boolean(),
    lastUpdated: v.string(),
    notes: v.optional(v.string()),
  }).index("by_type", ["type"]),

  assets: defineTable({
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
    value: v.number(), // AUD cents
    costBasis: v.optional(v.number()),
    accountId: v.optional(v.id("accounts")),
    ticker: v.optional(v.string()),
    units: v.optional(v.number()),
    purchaseDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    lastUpdated: v.string(),
  }).index("by_type", ["type"]),

  liabilities: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("mortgage"),
      v.literal("personal_loan"),
      v.literal("car_loan"),
      v.literal("credit_card"),
      v.literal("hecs"),
      v.literal("other")
    ),
    balance: v.number(), // AUD cents outstanding
    originalBalance: v.number(),
    interestRate: v.number(), // % per annum
    minimumPayment: v.optional(v.number()),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    lender: v.optional(v.string()),
    notes: v.optional(v.string()),
    lastUpdated: v.string(),
  }).index("by_type", ["type"]),

  fireSettings: defineTable({
    currentAge: v.number(),
    targetRetirementAge: v.number(),
    currentAnnualExpenses: v.number(), // AUD cents
    targetAnnualExpenses: v.number(),
    leanFireAnnualExpenses: v.number(),
    expectedReturnRate: v.number(), // % e.g. 7.0
    inflationRate: v.number(), // % e.g. 3.0
    withdrawalRate: v.number(), // % e.g. 4.0
    currentPortfolioValue: v.number(), // AUD cents (investable only)
    annualSavingsContribution: v.number(), // AUD cents
    superBalance: v.number(), // AUD cents
    superContributionRate: v.number(), // %
    preservationAge: v.number(), // default 60
    includeSuper: v.boolean(),
    updatedAt: v.string(),
  }),

  budgets: defineTable({
    category: v.string(),
    monthlyLimit: v.number(), // AUD cents — always stored as monthly equivalent
    budgetAmount: v.optional(v.number()), // AUD cents — raw entered amount (before frequency conversion)
    budgetFrequency: v.optional(v.union(
      v.literal("weekly"),
      v.literal("fortnightly"),
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("annually")
    )),
    actualOverride: v.optional(v.number()), // AUD cents — manual actual (overrides transaction total)
    actualFrequency: v.optional(v.union(
      v.literal("weekly"),
      v.literal("fortnightly"),
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("annually")
    )),
    yearMonth: v.string(), // "YYYY-MM"
    notes: v.optional(v.string()),
  })
    .index("by_yearMonth", ["yearMonth"])
    .index("by_category", ["category"]),

  netWorthSnapshots: defineTable({
    yearMonth: v.string(), // "YYYY-MM"
    date: v.string(),
    totalAssets: v.number(),
    totalLiabilities: v.number(),
    netWorth: v.number(),
    investableAssets: v.number(),
    superBalance: v.number(),
    cashBalance: v.number(),
    propertyValue: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_yearMonth", ["yearMonth"])
    .index("by_date", ["date"]),
});
