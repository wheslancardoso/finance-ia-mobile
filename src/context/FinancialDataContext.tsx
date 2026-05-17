import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  calculateTotalConsolidatedDebt, 
  calculateNetLiquidity,
  calculateScheduledIncome,
  calculateScheduledExpenses,
  calculateRecurringIncome,
  calculateRecurringExpenses,
  calculatePrimaryIncome,
  calculateAccumulatedBalance,
  calculateDebtExitProjection,
  calculateGoalProjections
} from '../domain/financial/financial-logic';
import { Category, Account, Goal, RecurringTransaction, Budget, Transaction } from '../domain/types';

interface SimulationResult {
  current_surplus_cents: number;
  simulated_surplus_cents: number;
  status: "SAFE" | "WARNING" | "DANGER";
  message: string;
  impact_percentage: number;
}

interface GoalRecommendation {
  goal_id: string;
  goal_name: string;
  recommended_amount_cents: number;
  is_full_target: boolean;
  advice: string;
}

interface GoalRecommendationsResponse {
  surplus_cents: number;
  real_surplus_cents: number;
  recommendations: GoalRecommendation[];
}

interface IncomeMixItem {
  name: string;
  value: number;
}

interface NetWorthHistoryItem {
  month: string;
  amount: number;
}

interface FinancialDataContextType {
  categories: Category[];
  accounts: Account[];
  loading: boolean;
  refreshData: () => Promise<void>;
  refresh: () => Promise<void>;
  lastFetched: number | null;
  monthlyIncomeCents: number;
  setMonthlyIncomeCents: (val: number) => void;
  fixedExpensesCents: number;
  setFixedExpensesCents: (val: number) => void;
  
  extraIncomeCents: number;
  currentMonthExpensesCents: number;
  accumulatedBalanceCents: number;
  recurringIncomeCents: number;
  recurringExpensesCents: number;
  goals: Goal[];
  recurringTransactions: RecurringTransaction[];
  budgets: Budget[];
  recentTransactions: Transaction[];
  monthTransactions: Transaction[];
  futureTransactions: Transaction[];
  transactions: Transaction[];
  healthScore: number;
  scheduledIncomeCents: number;
  scheduledExpensesCents: number;
  cardDebtImpactCents: number;
  totalConsolidatedDebtCents: number;
  netLiquidityCents: number;
  toggleTransactionPaid: (id: string, status: boolean) => Promise<void>;
  upsertTransaction: (data: Partial<Transaction>) => Promise<any>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteTransactionSeries: (description: string, total: number, accId: string) => Promise<void>;
  updateTransactionSeries: (description: string, total: number, accId: string, updates: Partial<Transaction>) => Promise<void>;
  createInstallmentSeries: (data: {
    description: string;
    amount_total_cents: number;
    installments: number;
    account_id: string;
    category_id?: string | null;
    start_date: string;
    starting_installment?: number;
  }) => Promise<void>;
  upsertAccount: (data: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  upsertGoal: (data: Partial<Goal> & { status?: string }) => Promise<any>;
  updateGoalBalance: (id: string, amount: number) => Promise<void>;
  simulatePurchaseImpact: (amount: number) => Promise<SimulationResult>;
  getGoalRecommendations: () => Promise<GoalRecommendationsResponse>;
  getIncomeMix: () => IncomeMixItem[];
  getNetWorthHistory: () => NetWorthHistoryItem[];
  createTransfer: (fromId: string, toId: string, amountCents: number) => Promise<void>;
  skipRecurringOccurrence: (recurringId: string, monthKey: string) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  primaryIncomeCents: number;
  userId: string | null;
  isGamificationEnabled: boolean;
  setGamificationEnabled: (val: boolean) => void;
}

const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialDataProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [monthlyIncomeCents, setMonthlyIncomeCentsState] = useState(0);
  const [fixedExpensesCents, setFixedExpensesCentsState] = useState(0);
  const [isGamificationEnabled, setIsGamificationEnabledState] = useState(true);

  // Carregar preferências do AsyncStorage no início
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedIncome = await AsyncStorage.getItem("vesper_monthly_income");
        if (storedIncome) setMonthlyIncomeCentsState(parseInt(storedIncome, 10));
        
        const storedExpenses = await AsyncStorage.getItem("vesper_fixed_expenses");
        if (storedExpenses) setFixedExpensesCentsState(parseInt(storedExpenses, 10));
        
        const storedGamification = await AsyncStorage.getItem("vesper_gamification_enabled");
        if (storedGamification) setIsGamificationEnabledState(storedGamification === "true");
      } catch (err) {
        console.error("Error loading preferences from AsyncStorage:", err);
      }
    };
    loadPreferences();
  }, []);

  const setMonthlyIncomeCents = useCallback(async (val: number) => {
    setMonthlyIncomeCentsState(val);
    try {
      await AsyncStorage.setItem("vesper_monthly_income", val.toString());
    } catch (err) {
      console.error("Error saving monthly income:", err);
    }
  }, []);

  const setFixedExpensesCents = useCallback(async (val: number) => {
    setFixedExpensesCentsState(val);
    try {
      await AsyncStorage.setItem("vesper_fixed_expenses", val.toString());
    } catch (err) {
      console.error("Error saving fixed expenses:", err);
    }
  }, []);

  const setGamificationEnabled = useCallback(async (val: boolean) => {
    setIsGamificationEnabledState(val);
    try {
      await AsyncStorage.setItem("vesper_gamification_enabled", val ? "true" : "false");
    } catch (err) {
      console.error("Error saving gamification preference:", err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: accs },
        { data: cats },
        { data: gs },
        { data: txs },
        { data: recs },
        { data: bdgs },
        { data: invs }
      ] = await Promise.all([
        supabase.from('accounts').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('goals').select('*').order('deadline'),
        supabase.from('transactions').select('*, categories(name), accounts(name)').order('date', { ascending: false }),
        supabase.from('recurring_transactions').select('*'),
        supabase.from('budgets').select('*'),
        supabase.from('credit_card_invoices').select('*')
      ]);

      const allTransactions = txs || [];
      const allInvoices = invs || [];
      const accountsList = accs || [];

      const now = new Date();
      const currentMonthRef = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const nextMonthDate = addMonths(now, 1);
      const nextMonthRef = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;

      // Enriquecer contas com dados de fatura exatamente igual ao Next.js da Web
      const enrichedAccounts = accountsList.map((acc: any) => {
        if (acc.type !== "CREDIT_CARD") return acc;

        const accountInvoices = allInvoices.filter((i: any) => i.account_id === acc.id);
        
        // 1. Processar faturas virtuais para o passado
        const processedInvoices = accountInvoices.map(inv => {
          if (inv.reference_month < currentMonthRef && inv.status !== 'PAID') {
            return { ...inv, status: 'PAID' };
          }
          return inv;
        });

        // 2. Determinar qual mês deve estar aberto baseado no dia de fechamento
        const today = now.getDate();
        const isCurrentMonthClosed = acc.closing_day && today >= acc.closing_day;
        const targetOpenMonth = isCurrentMonthClosed ? nextMonthRef : currentMonthRef;

        // 3. Filtrar e ordenar faturas ativas (não pagas)
        const activeInvoices = processedInvoices
          .filter(i => i.status !== 'PAID')
          .sort((a, b) => (a.reference_month || "").localeCompare(b.reference_month || ""));

        // Tentar encontrar a fatura aberta do mês alvo ou a mais próxima futura
        let openInvoice = activeInvoices.find(i => i.status === 'OPEN' && i.reference_month >= targetOpenMonth);
        if (!openInvoice) {
          openInvoice = activeInvoices.find(i => i.status === 'OPEN');
        }

        const closedInvoices = activeInvoices.filter(i => i.status === 'CLOSED' && i.id !== openInvoice?.id);

        const openCents = openInvoice ? (Number(openInvoice.amount_cents) || 0) : 0;
        const closedCents = closedInvoices.reduce((sum, i) => sum + (Number(i.amount_cents) || 0), 0);
        
        // Dívida total deve ser a soma de todas as transações não pagas do cartão
        const accountTransactions = allTransactions.filter(t => t.account_id === acc.id && !t.is_paid);
        const totalDebt = accountTransactions.reduce((sum, t) => sum + (Number(t.amount_cents) || 0), 0);

        // Próximo mês de alívio
        const nextMonthTransactions = allTransactions.filter(t => {
          if (t.account_id !== acc.id || t.is_paid) return false;
          const d = new Date(t.date);
          const mRef = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          return mRef === targetOpenMonth;
        });
        const nextMonthReleaseCandidate = nextMonthTransactions.reduce((sum, t) => sum + (Number(t.amount_cents) || 0), 0);

        return {
          ...acc,
          open_invoice_cents: openCents,
          closed_invoice_cents: closedCents,
          balance_cents: -totalDebt,
          total_debt_cents: totalDebt,
          next_month_impact_cents: nextMonthReleaseCandidate,
          open_invoice_month: openInvoice ? openInvoice.reference_month : targetOpenMonth,
          closed_invoice_month: closedInvoices.length > 0 ? closedInvoices[0].reference_month : null
        };
      });

      setAccounts(enrichedAccounts);
      setCategories(cats || []);
      setGoals(gs || []);
      setTransactions(allTransactions);
      setRecentTransactions(allTransactions.slice(0, 10));
      setRecurringTransactions(recs || []);
      setBudgets(bdgs || []);
      setLastFetched(Date.now());
    } catch (error) {
      console.error('Error refreshing financial data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Monitorar estado de autenticação
  useEffect(() => {
    const getInitialUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getInitialUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      setUserId(session?.user?.id || null);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        refreshData();
      }
    });
    
    refreshData();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [refreshData]);

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
  const cardDebtImpactCents = useMemo(() => calculateTotalConsolidatedDebt(accounts), [accounts]);
  const accumulatedBalanceCents = useMemo(() => calculateAccumulatedBalance(accounts), [accounts]);

  const extraIncomeCents = useMemo(() => {
    return monthTransactions
      .filter(t => t.transaction_type === 'INCOME')
      .reduce((sum, t) => sum + (Number(t.amount_cents) || 0), 0);
  }, [monthTransactions]);

  const currentMonthExpensesCents = useMemo(() => {
    return monthTransactions
      .filter(t => {
        if (t.transaction_type !== 'EXPENSE') return false;
        const acc = accounts.find(a => a.id === t.account_id);
        return acc && acc.type !== 'CREDIT_CARD';
      })
      .reduce((sum, t) => sum + (Number(t.amount_cents) || 0), 0);
  }, [monthTransactions, accounts]);

  const healthScore = useMemo(() => {
    if (netLiquidityCents < 0) return 35;
    if (netLiquidityCents < 150000) return 68;
    return 88;
  }, [netLiquidityCents]);

  const upsertTransaction = useCallback(async (data: Partial<Transaction>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        id: data.id || generateId(),
        is_paid: data.is_paid ?? false,
        source: data.source ?? "MANUAL",
      };
      
      const { data: saved, error } = await supabase
        .from('transactions')
        .upsert(payload)
        .select()
        .single();
        
      if (error) throw error;
      await refreshData();
      return saved;
    } catch (err) {
      console.error("Error upserting transaction:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const deleteTransaction = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      await refreshData();
    } catch (err) {
      console.error("Error deleting transaction:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const deleteTransactionSeries = useCallback(async (description: string, installmentTotal: number, accountId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('description', description)
        .eq('installment_total', installmentTotal)
        .eq('account_id', accountId);
      if (error) throw error;
      await refreshData();
    } catch (err) {
      console.error("Error deleting transaction series:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const updateTransactionSeries = useCallback(async (description: string, installmentTotal: number, accountId: string, updates: Partial<Transaction>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('description', description)
        .eq('installment_total', installmentTotal)
        .eq('account_id', accountId);
      if (error) throw error;
      await refreshData();
    } catch (err) {
      console.error("Error updating transaction series:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const createInstallmentSeries = useCallback(async (data: {
    description: string;
    amount_total_cents: number;
    installments: number;
    account_id: string;
    category_id?: string | null;
    start_date: string;
    starting_installment?: number;
  }) => {
    setLoading(true);
    try {
      const startingInstallment = data.starting_installment || 1;
      const amountPerInstallment = Math.round(data.amount_total_cents / data.installments);
      const groupId = generateId();
      const txs: any[] = [];
      
      const now = new Date();
      for (let i = startingInstallment - 1; i < data.installments; i++) {
        const date = new Date(data.start_date);
        date.setMonth(date.getMonth() + (i - (startingInstallment - 1)));
        
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const isPastMonth = date < currentMonthStart;
        
        const tx = {
          id: generateId(),
          description: data.description,
          amount_cents: amountPerInstallment,
          transaction_type: "EXPENSE",
          date: date.toISOString(),
          account_id: data.account_id,
          category_id: data.category_id,
          is_paid: isPastMonth,
          installment_current: i + 1,
          installment_total: data.installments,
          source: "MANUAL",
          installment_group_id: groupId
        };

        txs.push(tx);
      }
      
      const { error } = await supabase.from('transactions').insert(txs);
      if (error) throw error;
      await refreshData();
    } catch (err) {
      console.error("Error creating installment series:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const upsertAccount = useCallback(async (data: Partial<Account>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        id: data.id || generateId()
      };
      const { error } = await supabase.from('accounts').upsert(payload);
      if (error) throw error;
      await refreshData();
    } catch (err) {
      console.error("Error upserting account:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const deleteAccount = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('accounts').delete().eq('id', id);
      if (error) throw error;
      await refreshData();
    } catch (err) {
      console.error("Error deleting account:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const upsertGoal = useCallback(async (data: Partial<Goal> & { status?: string }) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        id: data.id || generateId()
      };
      const { data: saved, error } = await supabase.from('goals').upsert(payload).select().single();
      if (error) throw error;
      await refreshData();
      return saved;
    } catch (err) {
      console.error("Error upserting goal:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const updateGoalBalance = useCallback(async (id: string, amount: number) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('goals').update({ current_amount_cents: amount }).eq('id', id);
      if (error) throw error;
      await refreshData();
    } catch (err) {
      console.error("Error updating goal balance:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const simulatePurchaseImpact = useCallback(async (amountCents: number): Promise<SimulationResult> => {
    const balance = accumulatedBalanceCents;
    const realSurplus = netLiquidityCents;
    const newBalance = balance - amountCents;
    const newRealSurplus = realSurplus - amountCents;
    
    let status: "SAFE" | "WARNING" | "DANGER" = "SAFE";
    let message = "Você possui saldo suficiente.";

    if (newRealSurplus < 0) {
      status = "DANGER";
      message = "⚠️ Perigo: Esta compra aumentará sua dívida líquida. Você estará pagando crédito com crédito.";
    } else if (newBalance < (balance * 0.3)) {
      status = "WARNING";
      message = "Atenção: Esta compra consome grande parte da sua liquidez atual.";
    }
    
    return {
      current_surplus_cents: balance,
      simulated_surplus_cents: newBalance,
      status,
      message,
      impact_percentage: balance > 0 ? Math.round((amountCents / balance) * 100) : 100
    };
  }, [accumulatedBalanceCents, netLiquidityCents]);

  const getGoalRecommendations = useCallback(async (): Promise<GoalRecommendationsResponse> => {
    const balance = accumulatedBalanceCents;
    const realSurplus = netLiquidityCents;
    
    const sortedGoals = [...goals].sort((a: any, b: any) => {
      if (a.priority !== b.priority) return (b.priority || 0) - (a.priority || 0);
      return new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime();
    });

    let remainingToAllocate = realSurplus > 0 ? Math.round(realSurplus * 0.2) : 0;
    
    const recommendations = sortedGoals.map((g: any, index: number) => {
      const target_amount_cents = g.target_amount_cents || 0;
      const current_amount_cents = g.current_amount_cents || 0;
      const remainingGoal = target_amount_cents - current_amount_cents;
      const amount = Math.min(remainingToAllocate, remainingGoal);
      remainingToAllocate -= amount;
      
      const isNextPriority = index === 0;

      let advice = "";
      if (realSurplus < 0) {
        const debtToClear = Math.abs(realSurplus);
        advice = `⚠️ Alerta: Sua liquidez está negativa. Você precisa de R$ ${(debtToClear / 100).toFixed(2)} adicionais para cobrir suas faturas atuais antes de focar nesta meta.`;
      } else if (isNextPriority && amount > 0) {
        advice = `🎯 Estratégia: Recomendamos aportar R$ ${(amount / 100).toFixed(2)} aqui hoje para manter sua saúde financeira.`;
      } else if (realSurplus > 0) {
        advice = "⏳ Prioridade: Esta meta está na fila. Continue mantendo sua reserva antes de avançar para o próximo objetivo.";
      } else {
        advice = "🛑 Estabilize sua liquidez e pague suas faturas fechadas primeiro.";
      }

      return {
        goal_id: g.id,
        goal_name: g.name,
        recommended_amount_cents: amount,
        is_full_target: amount >= remainingGoal && remainingGoal > 0,
        advice
      };
    });
    
    return {
      surplus_cents: balance,
      real_surplus_cents: realSurplus,
      recommendations
    };
  }, [accumulatedBalanceCents, netLiquidityCents, goals]);

  const getIncomeMix = useCallback((): IncomeMixItem[] => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const incomeTransactions = monthTransactions.filter(tx => 
      tx.transaction_type === "INCOME" && 
      new Date(tx.date) >= thirtyDaysAgo
    );

    const mixMap: Record<string, number> = {};
    
    incomeTransactions.forEach((tx: Transaction) => {
      const catName = tx.category?.name || "Outros";
      mixMap[catName] = (mixMap[catName] || 0) + (tx.amount_cents / 100);
    });

    return Object.entries(mixMap).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100
    }));
  }, [monthTransactions]);

  const getNetWorthHistory = useCallback((): NetWorthHistoryItem[] => {
    const history: NetWorthHistoryItem[] = [];
    const now = new Date();
    
    let currentTotalCents = accounts.reduce((sum: number, acc: Account) => sum + (acc.balance_cents || 0), 0);
    
    for (let i = 0; i < 6; i++) {
      const targetMonth = addMonths(now, -i);
      const monthStr = format(targetMonth, "MMM", { locale: ptBR });
      
      history.unshift({
        month: monthStr,
        amount: Math.round(currentTotalCents / 100)
      });

      const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

      const mTransactions = monthTransactions.filter((tx: any) => {
        const d = new Date(tx.date);
        return d >= monthStart && d <= monthEnd;
      });

      const netChangeCents = mTransactions.reduce((net: number, tx: any) => {
        if (tx.transaction_type === "INCOME") return net + tx.amount_cents;
        if (tx.transaction_type === "EXPENSE") return net - tx.amount_cents;
        return net;
      }, 0);

      currentTotalCents -= netChangeCents;
    }

    return history;
  }, [accounts, monthTransactions]);

  const createTransfer = useCallback(async (fromId: string, toId: string, amountCents: number) => {
    setLoading(true);
    try {
      const fromAccount = accounts.find(a => a.id === fromId);
      const toAccount = accounts.find(a => a.id === toId);
      
      if (fromAccount && toAccount) {
        const { error: fromErr } = await supabase
          .from('accounts')
          .update({ balance_cents: fromAccount.balance_cents - amountCents })
          .eq('id', fromId);
          
        const { error: toErr } = await supabase
          .from('accounts')
          .update({ balance_cents: (toAccount.balance_cents || 0) + amountCents })
          .eq('id', toId);

        if (fromErr || toErr) throw fromErr || toErr;
        
        const txPayload = {
          id: generateId(),
          description: `Transferência para ${toAccount.name}`,
          amount_cents: amountCents,
          transaction_type: "TRANSFER",
          date: new Date().toISOString(),
          account_id: fromId,
          is_paid: true,
          source: "MANUAL"
        };

        const { error: txErr } = await supabase.from('transactions').insert(txPayload);
        if (txErr) throw txErr;
        
        await refreshData();
      }
    } catch (err) {
      console.error("Error creating transfer:", err);
    } finally {
      setLoading(false);
    }
  }, [accounts, refreshData]);

  const skipRecurringOccurrence = useCallback(async (recurringId: string, monthKey: string) => {
    setLoading(true);
    try {
      const recurring = recurringTransactions.find(r => r.id === recurringId);
      if (recurring) {
        const excluded = recurring.excluded_months || [];
        if (!excluded.includes(monthKey)) {
          const { error } = await supabase
            .from('recurring_transactions')
            .update({ excluded_months: [...excluded, monthKey] })
            .eq('id', recurringId);
          if (error) throw error;
          await refreshData();
        }
      }
    } catch (err) {
      console.error("Error skipping recurring occurrence:", err);
    } finally {
      setLoading(false);
    }
  }, [recurringTransactions, refreshData]);

  const deleteRecurringTransaction = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
      if (error) throw error;
      await refreshData();
    } catch (err) {
      console.error("Error deleting recurring transaction:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const toggleTransactionPaid = useCallback(async (transactionId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ is_paid: !currentStatus })
        .eq('id', transactionId);
      if (error) throw error;
      await refreshData();
    } catch (err) {
      console.error("Error toggling transaction status:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const value = useMemo(() => ({
    categories,
    accounts,
    loading,
    refreshData,
    refresh: refreshData,
    lastFetched,
    monthlyIncomeCents,
    setMonthlyIncomeCents,
    fixedExpensesCents,
    setFixedExpensesCents,
    extraIncomeCents,
    currentMonthExpensesCents,
    accumulatedBalanceCents,
    recurringIncomeCents,
    recurringExpensesCents,
    goals,
    recurringTransactions,
    budgets,
    recentTransactions,
    monthTransactions,
    futureTransactions,
    transactions,
    healthScore,
    scheduledIncomeCents,
    scheduledExpensesCents,
    cardDebtImpactCents,
    totalConsolidatedDebtCents,
    netLiquidityCents,
    toggleTransactionPaid,
    upsertTransaction,
    deleteTransaction,
    deleteTransactionSeries,
    updateTransactionSeries,
    createInstallmentSeries,
    upsertAccount,
    deleteAccount,
    upsertGoal,
    updateGoalBalance,
    simulatePurchaseImpact,
    getGoalRecommendations,
    getIncomeMix,
    getNetWorthHistory,
    createTransfer,
    skipRecurringOccurrence,
    deleteRecurringTransaction,
    primaryIncomeCents,
    userId,
    isGamificationEnabled,
    setGamificationEnabled
  }), [
    categories, accounts, loading, refreshData, lastFetched,
    monthlyIncomeCents, setMonthlyIncomeCents,
    fixedExpensesCents, setFixedExpensesCents,
    extraIncomeCents, currentMonthExpensesCents, accumulatedBalanceCents,
    recurringIncomeCents, recurringExpensesCents,
    goals, recurringTransactions, budgets, recentTransactions,
    monthTransactions, futureTransactions, transactions,
    healthScore, scheduledIncomeCents, scheduledExpensesCents,
    cardDebtImpactCents, totalConsolidatedDebtCents, netLiquidityCents,
    toggleTransactionPaid, upsertTransaction, deleteTransaction,
    deleteTransactionSeries, updateTransactionSeries, createInstallmentSeries,
    upsertAccount, deleteAccount, upsertGoal, updateGoalBalance,
    simulatePurchaseImpact, getGoalRecommendations, getIncomeMix,
    getNetWorthHistory, createTransfer, skipRecurringOccurrence,
    deleteRecurringTransaction, primaryIncomeCents, userId,
    isGamificationEnabled, setGamificationEnabled
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
