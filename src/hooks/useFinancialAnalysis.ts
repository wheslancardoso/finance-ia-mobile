import { useMemo, useCallback } from "react";
import { useFinancialData } from "../context/FinancialDataContext";
import { 
  calculateNetLiquidity, 
  calculateMonthlyOutlook, 
  calculateTotalConsolidatedDebt,
  calculateAccumulatedBalance,
  calculateRealCycleLiquidity,
  type MonthlyOutlook,
  calculateDebtExitProjection,
  type DebtExitProjection,
  calculateWeeklySurvival,
  type WeeklySurvival,
  calculateGoalProjections,
  type GoalProjection,
  simulateDetailedImpact,
  type SimulationDetailedResult,
  calculateAdvancedProjection,
  type Simulation
} from "../domain/financial/financial-logic";

export type { SimulationDetailedResult, MonthlyOutlook, DebtExitProjection, GoalProjection };

export interface FinancialAnalysis {
  netLiquidityCents: number;
  totalConsolidatedDebtCents: number;
  accumulatedBalanceCents: number;
  monthlyOutlook: MonthlyOutlook;
  healthScore: number;
  isSurvivalMode: boolean;
  isCrisisMode: boolean;
  debtExit: DebtExitProjection;
  weeklySurvival: WeeklySurvival;
  goalProjections: GoalProjection[];
  simulateDetailedImpact: (amountCents: number, installments: number) => SimulationDetailedResult;
  refresh: () => void;
  loading: boolean;
  analysis: any; // Keep compatibility with existing dashboard usage if needed
}

export function useFinancialAnalysis(monthOffset: number = 0, activeSimulations: Simulation[] = []): any {
  const { 
    accounts, 
    scheduledIncomeCents, 
    scheduledExpensesCents, 
    budgets,
    goals,
    recurringIncomeCents,
    recurringExpensesCents,
    healthScore,
    monthTransactions,
    futureTransactions,
    recurringTransactions,
    loading,
    refresh
  } = useFinancialData();

  const netLiquidity = useMemo(() => calculateNetLiquidity(accounts), [accounts]);
  const consolidatedDebt = useMemo(() => calculateTotalConsolidatedDebt(accounts), [accounts]);
  const currentAssets = useMemo(() => calculateAccumulatedBalance(accounts), [accounts]);

  const realCycleLiquidity = useMemo(() => 
    calculateRealCycleLiquidity({
      accounts,
      currentMonthTransactions: monthTransactions
    }), [accounts, monthTransactions]);

  const monthlyOutlook = useMemo(() => {
    const confirmedIncomeThisMonth = (monthTransactions || [])
      .filter(t => t.transaction_type === "INCOME" && t.is_paid === true)
      .reduce((sum, t) => sum + (Number(t.amount_cents) || 0), 0);

    const effectiveScheduledIncome = scheduledIncomeCents || recurringIncomeCents;
    const effectiveScheduledExpenses = scheduledExpensesCents || recurringExpensesCents;
    const incomeForOutlook = confirmedIncomeThisMonth > 0 ? 0 : effectiveScheduledIncome;

    const baseOutlook = calculateMonthlyOutlook({
      accounts,
      scheduledIncomeCents: incomeForOutlook,
      scheduledExpensesCents: effectiveScheduledExpenses,
      recurringIncomeCents,
      recurringExpensesCents,
      budgets,
      netLiquidityCents: netLiquidity,
      monthOffset,
      activeSimulations,
      futureTransactions,
      allTransactions: monthTransactions,
      recurringTransactions,
      goals
    });

    const projectedNetLiquidity = monthOffset === 0
      ? realCycleLiquidity
      : calculateAdvancedProjection({
          currentNetLiquidity: netLiquidity,
          recurringTransactions,
          futureTransactions,
          goals,
          budgets,
          monthOffset,
          activeSimulations,
          scheduledIncomeCents: incomeForOutlook,
          scheduledExpensesCents: effectiveScheduledExpenses,
          allTransactions: monthTransactions
        });

    return {
      ...baseOutlook,
      balanceAtMonthEnd: monthOffset === 0 ? baseOutlook.balanceAtMonthEnd : projectedNetLiquidity,
      projectedNetLiquidity
    };
  }, [accounts, scheduledIncomeCents, scheduledExpensesCents, recurringIncomeCents, recurringExpensesCents, budgets, netLiquidity, monthOffset, futureTransactions, goals, activeSimulations, monthTransactions, recurringTransactions, realCycleLiquidity]);

  const activeNetLiquidity = monthOffset === 0 ? realCycleLiquidity : (monthlyOutlook.projectedNetLiquidity ?? netLiquidity);

  const debtExit = useMemo(() => {
    return calculateDebtExitProjection({
      netLiquidityCents: netLiquidity,
      recurringIncomeCents,
      recurringExpensesCents,
      budgets
    });
  }, [netLiquidity, recurringIncomeCents, recurringExpensesCents, budgets]);

  const goalProjections = useMemo(() => {
    return calculateGoalProjections({
      debtExit,
      goals
    });
  }, [debtExit, goals]);
  
  const weeklySurvival = useMemo(() => {
    return calculateWeeklySurvival({
      monthlySurplusCents: Math.max(0, monthlyOutlook.balanceAtMonthEnd),
      currentMonthTransactions: monthTransactions
    });
  }, [monthlyOutlook.balanceAtMonthEnd, monthTransactions]);

  const simulateDetailedImpactFn = useCallback((amountCents: number, installments: number) => 
    simulateDetailedImpact({
      amountCents,
      installments,
      netLiquidityCents: netLiquidity,
      monthlySurplus: debtExit.monthlySurplus,
      currentExitDate: debtExit.exitDate,
      currentBalanceCents: currentAssets
    }), [netLiquidity, debtExit.monthlySurplus, debtExit.exitDate, currentAssets]);

  const analysis = useMemo(() => ({
    netLiquidityCents: activeNetLiquidity,
    totalConsolidatedDebtCents: monthOffset === 0 ? consolidatedDebt : monthlyOutlook.totalDebt,
    accumulatedBalanceCents: monthOffset === 0 ? currentAssets : monthlyOutlook.totalAssets,
    monthlyOutlook,
    healthScore,
    isSurvivalMode: monthlyOutlook.balanceAtMonthEnd < 0 || activeNetLiquidity < 0,
    isCrisisMode: activeNetLiquidity < 0 && monthlyOutlook.balanceAtMonthEnd < 0,
    debtExit,
    weeklySurvival,
    goalProjections,
    simulateDetailedImpact: simulateDetailedImpactFn
  }), [activeNetLiquidity, consolidatedDebt, currentAssets, monthlyOutlook, healthScore, debtExit, weeklySurvival, goalProjections, simulateDetailedImpactFn, monthOffset]);

  return {
    analysis,
    loading,
    refresh
  };
}
