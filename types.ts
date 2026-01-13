export interface FinancialProfile {
  incomeBiWeeklyUser: number; // Wife
  incomeBiWeeklyPartner: number; // Husband
  savings: number;
  monthlyExpenses: {
    housing: number; // Rent or Mortgage (NJ high property tax implied)
    utilities: number;
    cars: number; // Payments + Gas + Insurance
    groceries: number;
    loans: number; // Student loans, etc.
    entertainment: number;
    other: number;
  };
  babySettings: {
    leaveWeeksUser: number; // Wife's leave
    leaveWeeksPartner: number; // Husband's leave
    childcareMonthly: number; // NJ Avg is high
    diapersFormulaMonthly: number;
    oneTimeCosts: number; // Stroller, Crib
  };
}

export interface SimulationResult {
  monthlyNetIncome: number;
  monthlyNetIncomeDuringLeave: number; // Worst case (both on leave)
  monthlyExpensesPreBaby: number;
  monthlyExpensesPostBaby: number;
  monthlyExpensesDuringLeave: number; // Expenses during leave
  monthlySurplusPreBaby: number;
  monthlySurplusPostBaby: number;
  monthlySurplusDuringLeave: number;
  totalLeaveLoss: number; // Total estimated income loss over the leave period
  savingsRunway: number; // Months until savings depletion during leave
}

export const INITIAL_PROFILE: FinancialProfile = {
  incomeBiWeeklyUser: 2900,
  incomeBiWeeklyPartner: 2900,
  savings: 20000,
  monthlyExpenses: {
    housing: 3500,
    utilities: 400,
    cars: 1000,
    groceries: 800,
    loans: 500,
    entertainment: 400,
    other: 300
  },
  babySettings: {
    leaveWeeksUser: 12,
    leaveWeeksPartner: 4,
    childcareMonthly: 2000,
    diapersFormulaMonthly: 300,
    oneTimeCosts: 2000
  }
};