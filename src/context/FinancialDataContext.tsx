import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  calculateTotalConsolidatedDebt, 
  calculateNetLiquidity,
  calculateScheduledIncome,
  calculateScheduledExpenses,
  calculateRecurringIncome,
  calculateRecurringExpenses,
  calculatePrimaryIncome
} from '../domain/financial/financial-logic';
import { startOfMonth, endOfMonth } from 'date-fns';

interface FinancialDataContextType {
  accounts: any[];
  categories: any[];
  goals: any[];
  transactions: any[];
  recentTransactions: any[];
  monthTransactions: any[];
  futureTransactions: any[];
  recurringTransactions: any[];
  budgets: any[];
  loading: boolean;
  refresh: () => Promise<void>;
  totalConsolidatedDebtCents: number;
  netLiquidityCents: number;
  scheduledIncomeCents: number;
  scheduledExpensesCents: number;
  primaryIncomeCents: number;
  recurringIncomeCents: number;
  recurringExpensesCents: number;
  healthScore: number;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialDataProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      
      const [
        { data: accs },
        { data: cats },
        { data: gs },
        { data: txs },
        { data: recs },
        { data: bdgs }
      ] = await Promise.all([
        supabase.from('accounts').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('goals').select('*').order('deadline'),
        supabase.from('transactions').select('*, categories(name), accounts(name)').order('date', { ascending: false }),
        supabase.from('recurring_transactions').select('*'),
        supabase.from('budgets').select('*')
      ]);

      setAccounts(accs || []);
      setCategories(cats || []);
      setGoals(gs || []);
      setTransactions(txs || []);
      setRecentTransactions((txs || []).slice(0, 10));
      setRecurringTransactions(recs || []);
      setBudgets(bdgs || []);
    } catch (error) {
      console.error('Error refreshing financial data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') refresh();
    });
    
    refresh();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [refresh]);

  const monthTransactions = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
  }, [transactions]);

  const futureTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => new Date(t.date) > now);
  }, [transactions]);

  const totalConsolidatedDebtCents = useMemo(() => calculateTotalConsolidatedDebt(accounts), [accounts]);
  const netLiquidityCents = useMemo(() => calculateNetLiquidity(accounts), [accounts]);
  const scheduledIncomeCents = useMemo(() => calculateScheduledIncome(recurringTransactions), [recurringTransactions]);
  const scheduledExpensesCents = useMemo(() => calculateScheduledExpenses(recurringTransactions), [recurringTransactions]);
  const primaryIncomeCents = useMemo(() => calculatePrimaryIncome(recurringTransactions), [recurringTransactions]);
  const recurringIncomeCents = useMemo(() => calculateRecurringIncome(recurringTransactions), [recurringTransactions]);
  const recurringExpensesCents = useMemo(() => calculateRecurringExpenses(recurringTransactions), [recurringTransactions]);

  const healthScore = useMemo(() => {
    // Basic health score logic for mobile parity
    if (netLiquidityCents < 0) return 35;
    if (netLiquidityCents < 100000) return 65;
    return 85;
  }, [netLiquidityCents]);

  const value = useMemo(() => ({
    accounts,
    categories,
    goals,
    transactions,
    monthTransactions,
    recentTransactions,
    futureTransactions,
    recurringTransactions,
    budgets,
    loading,
    refresh,
    totalConsolidatedDebtCents,
    netLiquidityCents,
    scheduledIncomeCents,
    scheduledExpensesCents,
    primaryIncomeCents,
    recurringIncomeCents,
    recurringExpensesCents,
    healthScore
  }), [
    accounts, categories, goals, transactions, recentTransactions, monthTransactions, futureTransactions, 
    recurringTransactions, budgets, loading, refresh,
    totalConsolidatedDebtCents, netLiquidityCents, scheduledIncomeCents, scheduledExpensesCents,
    primaryIncomeCents, recurringIncomeCents, recurringExpensesCents, healthScore
  ]);

  return (
    <FinancialDataContext.Provider value={value}>
      {children}
    </FinancialDataContext.Provider>
  );
}

export function useFinancialData() {
  const context = useContext(FinancialDataContext);
  if (context === undefined) {
    throw new Error('useFinancialData must be used within a FinancialDataProvider');
  }
  return context;
}
