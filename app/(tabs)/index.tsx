import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import { useRouter } from 'expo-router';
import { 
  Calculator, 
  History, 
  Plus, 
  Target
} from 'lucide-react-native';
import { format, startOfMonth, isSameMonth, addMonths, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { useFinancialAnalysis } from '@/hooks/useFinancialAnalysis';
import { useFinancialData } from '@/context/FinancialDataContext';

// Components
import UnifiedHeader from '@/components/dashboard/UnifiedHeader';
import BillCommitmentCard from '@/components/dashboard/BillCommitmentCard';
import MonthNavigator from '@/components/MonthNavigator';
import SpendingSimulatorCard from '@/components/dashboard/SpendingSimulatorCard';
import GoalCard from '@/components/GoalCard';
import MonthlyConsolidatedExcel from '@/components/dashboard/MonthlyConsolidatedExcel';
import ProjectedTimeline from '@/components/dashboard/ProjectedTimeline';
import { TransactionTimeline } from '@/components/TransactionTimeline';
import SpendingCapacity from '@/components/SpendingCapacity';
import AddTransactionModal from '@/components/AddTransactionModal';

export default function Dashboard() {
  const router = useRouter();
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'summary' | 'timeline'>('summary');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [activeSimulations, setActiveSimulations] = useState<any[]>([]);

  const { 
    accounts, 
    loading, 
    refresh,
    monthTransactions,
    recentTransactions,
    budgets,
    goals,
    futureTransactions,
    recurringTransactions
  } = useFinancialData();

  const monthOffset = useMemo(() => {
    const today = startOfMonth(new Date());
    const target = startOfMonth(targetDate);
    return Math.max(0, (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()));
  }, [targetDate]);

  const { analysis } = useFinancialAnalysis(monthOffset, activeSimulations);
  const isCurrentMonth = isSameMonth(targetDate, new Date());
  const isFuture = monthOffset > 0;

  // Transações para exibição
  const displayTransactions = isCurrentMonth 
    ? (monthTransactions.length > 0 ? monthTransactions : recentTransactions)
    : [];

  // Transações projetadas para a Timeline (Lógica igual à Web)
  const projectionTransactions = useMemo(() => {
    if (!isFuture) return [];
    const targetMonth = startOfMonth(targetDate);
    
    const filteredFuture = futureTransactions.filter(t => isSameMonth(new Date(t.date), targetMonth));
    
    const virtualRecurring = recurringTransactions
      .filter(r => r.status === 'active')
      .map(r => ({
        id: `virtual-${r.id}`,
        description: r.description,
        amount_cents: r.amount_cents,
        transaction_type: r.transaction_type,
        date: targetMonth.toISOString(),
        category: r.category_id,
        isRecurring: true
      }));

    const simulations = activeSimulations.flatMap((sim, simIdx) => {
      const installments = sim.installments || 1;
      const monthlyAmount = Math.round(sim.amount_cents / installments);
      const results: any[] = [];
      for (let i = 0; i < installments; i++) {
        const simDate = addMonths(new Date(), i);
        if (isSameMonth(simDate, targetDate)) {
          results.push({
            id: `sim-tx-${simIdx}-${i}`,
            description: `Simulado: ${sim.description || 'Compra'} (${i + 1}/${installments})`,
            amount_cents: monthlyAmount,
            transaction_type: "EXPENSE",
            date: simDate.toISOString(),
            category: "Simulação"
          });
        }
      }
      return results;
    });

    return [...filteredFuture, ...virtualRecurring, ...simulations];
  }, [isFuture, targetDate, futureTransactions, recurringTransactions, activeSimulations]);

  // Itens para o resumo consolidado
  const consolidatedItems = useMemo(() => {
    const transactionsToUse = isFuture ? projectionTransactions : displayTransactions;
    return transactionsToUse.map((t: any) => ({
      name: t.description,
      value: t.amount_cents,
      type: t.transaction_type,
      category: t.category?.name || t.category || "Geral",
      isInstallment: t.installment_total > 1,
      isRecurring: t.isRecurring
    }));
  }, [isFuture, projectionTransactions, displayTransactions]);

  const totalIncome = useMemo(() => 
    consolidatedItems.filter((i: any) => i.type === "INCOME").reduce((sum: number, i: any) => sum + i.value, 0)
  , [consolidatedItems]);

  const totalExpenses = useMemo(() => 
    consolidatedItems.filter((i: any) => i.type === "EXPENSE").reduce((sum: number, i: any) => sum + i.value, 0)
  , [consolidatedItems]);

  const handleJumpToDebtExit = useCallback(() => {
    const target = analysis?.debtExit?.exitDate;
    if (target) {
      setTargetDate(new Date(target));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [analysis?.debtExit?.exitDate]);

  const handleSimulate = useCallback((sim: any) => {
    setActiveSimulations(sim ? [sim] : []);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <ScreenContainer>
      <ScrollView 
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#fff" />}
        showsVerticalScrollIndicator={false}
      >
        {/* ROW 1: HUD Principal */}
        {analysis ? (
          <UnifiedHeader 
            monthOffset={monthOffset}
            targetDate={targetDate}
            netLiquidityCents={analysis.netLiquidityCents}
            accumulatedBalanceCents={analysis.accumulatedBalanceCents}
            totalConsolidatedDebtCents={analysis.totalConsolidatedDebtCents}
            monthlyOutlook={analysis.monthlyOutlook}
            isCrisisMode={analysis.isCrisisMode}
            debtExit={analysis.debtExit}
            weeklySurvival={analysis.weeklySurvival}
            onAddTransaction={() => setShowAddTransaction(true)}
            onJumpToDebtExit={handleJumpToDebtExit}
          />
        ) : (
          <View className="h-64 bg-white/5 rounded-[40px] animate-pulse mb-8" />
        )}

        {/* ROW 2: Ações Rápidas (Sync with Web Grid) */}
        <View className="gap-4 mb-8">
          <BillCommitmentCard 
            immediateCardDebt={analysis?.monthlyOutlook?.immediateCardDebt || 0}
            upcomingCardDebt={analysis?.monthlyOutlook?.upcomingCardDebt || 0}
            scheduledExpenses={analysis?.monthlyOutlook?.scheduledOnly || 0}
            budgetReserves={analysis?.monthlyOutlook?.budgetReserves || 0}
            totalPlanned={analysis?.monthlyOutlook?.plannedExpenses || 0}
            isCrisis={analysis?.isCrisisMode}
          />
          
          <MonthNavigator 
            selectedDate={targetDate} 
            onDateChange={setTargetDate} 
          />

          <SpendingSimulatorCard onPress={() => router.push('/simulator' as any)} />
        </View>

        {/* ROW 3: Tab Selector (Resumo / Timeline) */}
        <View className="bg-white/[0.03] border border-white/10 rounded-[40px] overflow-hidden mb-8 shadow-2xl">
          <View className="flex-row items-center justify-between p-5 border-b border-white/5">
            <View className="flex-row bg-white/5 p-1 rounded-2xl border border-white/5">
              <Pressable 
                onPress={() => {
                  setActiveTab('summary');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className={`flex-row items-center gap-2 px-6 py-2.5 rounded-xl ${activeTab === 'summary' ? 'bg-violet-600 shadow-lg shadow-violet-600/20' : ''}`}
              >
                <Calculator size={14} color={activeTab === 'summary' ? '#fff' : 'rgba(255,255,255,0.4)'} />
                <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'summary' ? 'text-white' : 'text-white/40'}`}>Fluxo Mensal</Text>
              </Pressable>
              <Pressable 
                onPress={() => {
                  setActiveTab('timeline');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className={`flex-row items-center gap-2 px-6 py-2.5 rounded-xl ${activeTab === 'timeline' ? 'bg-violet-600 shadow-lg shadow-violet-600/20' : ''}`}
              >
                <History size={14} color={activeTab === 'timeline' ? '#fff' : 'rgba(255,255,255,0.4)'} />
                <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'timeline' ? 'text-white' : 'text-white/40'}`}>Timeline</Text>
              </Pressable>
            </View>
          </View>

          <View className="p-2">
            {activeTab === 'summary' ? (
              <MonthlyConsolidatedExcel 
                income={totalIncome}
                expenses={totalExpenses}
                balance={totalIncome - totalExpenses}
                items={consolidatedItems}
                monthName={format(targetDate, "MMMM 'de' yyyy", { locale: ptBR })}
              />
            ) : (
              isFuture ? (
                <ProjectedTimeline transactions={projectionTransactions} />
              ) : (
                <TransactionTimeline transactions={displayTransactions} />
              )
            )}
          </View>
        </View>

        {/* ROW 4: Orçamentos (Spending Capacity) */}
        <View className="mb-20">
          <View className="flex-row items-center justify-between mb-4 px-1">
            <Text className="text-white/60 text-[10px] font-black uppercase tracking-[3px]">Capacidade de Gasto</Text>
          </View>
          <View className="space-y-4">
            {budgets.map((budget) => (
              <SpendingCapacity 
                key={budget.id}
                category={budget.category_id || 'Geral'}
                spent={budget.spent_cents || 0}
                limit={budget.amount_cents}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {showAddTransaction && (
        <AddTransactionModal 
          onClose={() => setShowAddTransaction(false)}
          onSave={() => {
            setShowAddTransaction(false);
            refresh();
          }}
        />
      )}
    </ScreenContainer>
  );
}
