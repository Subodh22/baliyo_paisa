export interface Category {
  id: string;
  label: string;
  group: string;
  type: "expense" | "income" | "both";
  color: string;
}

export interface CategoryGroup {
  id: string;
  label: string;
  color: string;
}

// ─── Category Groups (matches your Budget Planner sections) ────────────────
export const CATEGORY_GROUPS: CategoryGroup[] = [
  { id: "home_utilities",       label: "Home & Utilities",          color: "#7C9EAD" },
  { id: "insurance_financial",  label: "Insurance & Financial",     color: "#9D7CAD" },
  { id: "groceries_household",  label: "Groceries & Household",     color: "#8FAD7C" },
  { id: "personal_medical",     label: "Personal & Medical",        color: "#7CADA9" },
  { id: "entertainment_dining", label: "Entertainment & Eating Out",color: "#AD7C8A" },
  { id: "transport_auto",       label: "Transport & Auto",          color: "#AD9A7C" },
  { id: "children",             label: "Children",                  color: "#7C8FAD" },
  { id: "other_expense",        label: "Other",                     color: "#6B6760" },
];

// ─── Expense Categories ────────────────────────────────────────────────────
export const EXPENSE_CATEGORIES: Category[] = [
  // Home & Utilities
  { id: "mortgage_rent",        label: "Mortgage / Rent",           group: "home_utilities",       type: "expense", color: "#7C9EAD" },
  { id: "home_insurance",       label: "Home & Contents Insurance", group: "home_utilities",       type: "expense", color: "#7C9EAD" },
  { id: "body_corporate",       label: "Body Corporate Fees",       group: "home_utilities",       type: "expense", color: "#7C9EAD" },
  { id: "council_rates",        label: "Council Rates",             group: "home_utilities",       type: "expense", color: "#7C9EAD" },
  { id: "water_rates",          label: "Water Rates",               group: "home_utilities",       type: "expense", color: "#7C9EAD" },
  { id: "electricity",          label: "Electricity",               group: "home_utilities",       type: "expense", color: "#7C9EAD" },
  { id: "gas",                  label: "Gas",                       group: "home_utilities",       type: "expense", color: "#7C9EAD" },
  { id: "internet",             label: "Internet",                  group: "home_utilities",       type: "expense", color: "#7C9EAD" },
  { id: "phone_mobile",         label: "Phone / Mobile",            group: "home_utilities",       type: "expense", color: "#7C9EAD" },
  { id: "pay_tv",               label: "Pay TV",                    group: "home_utilities",       type: "expense", color: "#7C9EAD" },
  { id: "home_maintenance",     label: "Maintenance & Repairs",     group: "home_utilities",       type: "expense", color: "#7C9EAD" },
  { id: "garden_lawn",          label: "Garden & Lawn",             group: "home_utilities",       type: "expense", color: "#7C9EAD" },
  { id: "cleaning_products",    label: "Cleaning Products",         group: "home_utilities",       type: "expense", color: "#7C9EAD" },
  { id: "home_other",           label: "Other (Home)",              group: "home_utilities",       type: "expense", color: "#7C9EAD" },

  // Insurance & Financial
  { id: "life_insurance",       label: "Life Insurance",            group: "insurance_financial",  type: "expense", color: "#9D7CAD" },
  { id: "health_insurance",     label: "Health Insurance",          group: "insurance_financial",  type: "expense", color: "#9D7CAD" },
  { id: "car_insurance",        label: "Car Insurance",             group: "insurance_financial",  type: "expense", color: "#9D7CAD" },
  { id: "income_protection",    label: "Income Protection",         group: "insurance_financial",  type: "expense", color: "#9D7CAD" },
  { id: "loan_repayment",       label: "Loan Repayments",           group: "insurance_financial",  type: "expense", color: "#9D7CAD" },
  { id: "credit_card_payment",  label: "Credit Card Payment",       group: "insurance_financial",  type: "expense", color: "#9D7CAD" },
  { id: "bank_fees",            label: "Bank Fees",                 group: "insurance_financial",  type: "expense", color: "#9D7CAD" },
  { id: "investment_fee",       label: "Investment Fees",           group: "insurance_financial",  type: "expense", color: "#9D7CAD" },
  { id: "tax",                  label: "Tax",                       group: "insurance_financial",  type: "expense", color: "#9D7CAD" },
  { id: "super_contribution",   label: "Super Contribution",        group: "insurance_financial",  type: "expense", color: "#9D7CAD" },
  { id: "financial_other",      label: "Other (Financial)",         group: "insurance_financial",  type: "expense", color: "#9D7CAD" },

  // Groceries & Household
  { id: "groceries",            label: "Groceries",                 group: "groceries_household",  type: "expense", color: "#8FAD7C" },
  { id: "alcohol_tobacco",      label: "Alcohol & Tobacco",         group: "groceries_household",  type: "expense", color: "#8FAD7C" },
  { id: "toiletries_cosmetics", label: "Toiletries & Cosmetics",    group: "groceries_household",  type: "expense", color: "#8FAD7C" },
  { id: "stationery",           label: "Stationery",                group: "groceries_household",  type: "expense", color: "#8FAD7C" },
  { id: "laundry",              label: "Laundry",                   group: "groceries_household",  type: "expense", color: "#8FAD7C" },
  { id: "groceries_other",      label: "Other (Groceries)",         group: "groceries_household",  type: "expense", color: "#8FAD7C" },

  // Personal & Medical
  { id: "chemist",              label: "Chemist / Pharmacy",        group: "personal_medical",     type: "expense", color: "#7CADA9" },
  { id: "doctor",               label: "Doctor",                    group: "personal_medical",     type: "expense", color: "#7CADA9" },
  { id: "dentist",              label: "Dentist",                   group: "personal_medical",     type: "expense", color: "#7CADA9" },
  { id: "optical",              label: "Optical",                   group: "personal_medical",     type: "expense", color: "#7CADA9" },
  { id: "specialist",           label: "Specialist",                group: "personal_medical",     type: "expense", color: "#7CADA9" },
  { id: "hospital",             label: "Hospital",                  group: "personal_medical",     type: "expense", color: "#7CADA9" },
  { id: "other_health",         label: "Other Health Care",         group: "personal_medical",     type: "expense", color: "#7CADA9" },
  { id: "hair_beauty",          label: "Hair & Beauty",             group: "personal_medical",     type: "expense", color: "#7CADA9" },
  { id: "clothing_shoes",       label: "Clothing & Shoes",          group: "personal_medical",     type: "expense", color: "#7CADA9" },
  { id: "jewellery_accessories",label: "Jewellery & Accessories",   group: "personal_medical",     type: "expense", color: "#7CADA9" },
  { id: "sporting_leisure",     label: "Sporting & Leisure",        group: "personal_medical",     type: "expense", color: "#7CADA9" },
  { id: "education",            label: "Education",                 group: "personal_medical",     type: "expense", color: "#7CADA9" },
  { id: "personal_other",       label: "Other (Personal)",          group: "personal_medical",     type: "expense", color: "#7CADA9" },

  // Entertainment & Eating Out
  { id: "coffee_tea",           label: "Coffee & Tea",              group: "entertainment_dining", type: "expense", color: "#AD7C8A" },
  { id: "restaurants",          label: "Restaurants",               group: "entertainment_dining", type: "expense", color: "#AD7C8A" },
  { id: "takeaway",             label: "Takeaway",                  group: "entertainment_dining", type: "expense", color: "#AD7C8A" },
  { id: "cinema",               label: "Cinema",                    group: "entertainment_dining", type: "expense", color: "#AD7C8A" },
  { id: "music_streaming",      label: "Music & Streaming",         group: "entertainment_dining", type: "expense", color: "#AD7C8A" },
  { id: "lottery_gambling",     label: "Lottery & Gambling",        group: "entertainment_dining", type: "expense", color: "#AD7C8A" },
  { id: "hobbies_interests",    label: "Hobbies & Interests",       group: "entertainment_dining", type: "expense", color: "#AD7C8A" },
  { id: "kids_activities",      label: "Kids Activities",           group: "entertainment_dining", type: "expense", color: "#AD7C8A" },
  { id: "books_magazines",      label: "Books & Magazines",         group: "entertainment_dining", type: "expense", color: "#AD7C8A" },
  { id: "alcohol_bar",          label: "Alcohol & Bar",             group: "entertainment_dining", type: "expense", color: "#AD7C8A" },
  { id: "travel_holidays",      label: "Travel & Holidays",         group: "entertainment_dining", type: "expense", color: "#AD7C8A" },
  { id: "gifts_donations",      label: "Gifts & Donations",         group: "entertainment_dining", type: "expense", color: "#AD7C8A" },
  { id: "entertainment_other",  label: "Other (Entertainment)",     group: "entertainment_dining", type: "expense", color: "#AD7C8A" },

  // Transport & Auto
  { id: "fuel",                 label: "Fuel",                      group: "transport_auto",       type: "expense", color: "#AD9A7C" },
  { id: "registration",         label: "Registration",              group: "transport_auto",       type: "expense", color: "#AD9A7C" },
  { id: "parking",              label: "Parking",                   group: "transport_auto",       type: "expense", color: "#AD9A7C" },
  { id: "car_maintenance",      label: "Car Maintenance",           group: "transport_auto",       type: "expense", color: "#AD9A7C" },
  { id: "public_transport",     label: "Public Transport",          group: "transport_auto",       type: "expense", color: "#AD9A7C" },
  { id: "rideshare",            label: "Rideshare (Uber etc.)",     group: "transport_auto",       type: "expense", color: "#AD9A7C" },
  { id: "transport_other",      label: "Other (Transport)",         group: "transport_auto",       type: "expense", color: "#AD9A7C" },

  // Children
  { id: "baby_products",        label: "Baby Products",             group: "children",             type: "expense", color: "#7C8FAD" },
  { id: "toys",                 label: "Toys",                      group: "children",             type: "expense", color: "#7C8FAD" },
  { id: "babysitting",          label: "Babysitting",               group: "children",             type: "expense", color: "#7C8FAD" },
  { id: "childcare",            label: "Childcare",                 group: "children",             type: "expense", color: "#7C8FAD" },
  { id: "sports_activities",    label: "Sports & Activities",       group: "children",             type: "expense", color: "#7C8FAD" },
  { id: "school_fees",          label: "School Fees",               group: "children",             type: "expense", color: "#7C8FAD" },
  { id: "excursions",           label: "Excursions",                group: "children",             type: "expense", color: "#7C8FAD" },
  { id: "school_uniforms",      label: "School Uniforms",           group: "children",             type: "expense", color: "#7C8FAD" },
  { id: "other_school_needs",   label: "Other School Needs",        group: "children",             type: "expense", color: "#7C8FAD" },
  { id: "child_support",        label: "Child Support Payment",     group: "children",             type: "expense", color: "#7C8FAD" },
  { id: "children_other",       label: "Other (Children)",          group: "children",             type: "expense", color: "#7C8FAD" },

  // Catch-all
  { id: "other_expense",        label: "Other",                     group: "other_expense",        type: "expense", color: "#6B6760" },
];

// ─── Income Categories ─────────────────────────────────────────────────────
export const INCOME_CATEGORIES: Category[] = [
  { id: "salary",          label: "Salary / Wages",       group: "income", type: "income", color: "#C9A84C" },
  { id: "rental",          label: "Rental Income",        group: "income", type: "income", color: "#8FAD7C" },
  { id: "dividends",       label: "Dividends",            group: "income", type: "income", color: "#7C9EAD" },
  { id: "interest",        label: "Interest",             group: "income", type: "income", color: "#7CADA9" },
  { id: "side_income",     label: "Side Income",          group: "income", type: "income", color: "#AD9A7C" },
  { id: "capital_gains",   label: "Capital Gains",        group: "income", type: "income", color: "#AD8E7C" },
  { id: "government",      label: "Government / Centrelink", group: "income", type: "income", color: "#8AAD7C" },
  { id: "super_income",    label: "Super / Pension",      group: "income", type: "income", color: "#9D7CAD" },
  { id: "other_income",    label: "Other Income",         group: "income", type: "income", color: "#6B6760" },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryById(id: string): Category | undefined {
  return ALL_CATEGORIES.find((c) => c.id === id);
}

export function getCategoryColor(categoryId: string): string {
  return getCategoryById(categoryId)?.color ?? "#6B6760";
}

export function getCategoryLabel(categoryId: string): string {
  return getCategoryById(categoryId)?.label ?? categoryId;
}

export function getCategoryGroup(categoryId: string): string {
  return getCategoryById(categoryId)?.group ?? "";
}

/** Returns expense categories grouped by their group ID */
export function getExpenseCategoriesByGroup(): Record<string, Category[]> {
  const result: Record<string, Category[]> = {};
  for (const cat of EXPENSE_CATEGORIES) {
    if (!result[cat.group]) result[cat.group] = [];
    result[cat.group].push(cat);
  }
  return result;
}

export function getGroupLabel(groupId: string): string {
  return CATEGORY_GROUPS.find((g) => g.id === groupId)?.label ?? groupId;
}

export function getGroupColor(groupId: string): string {
  return CATEGORY_GROUPS.find((g) => g.id === groupId)?.color ?? "#6B6760";
}
