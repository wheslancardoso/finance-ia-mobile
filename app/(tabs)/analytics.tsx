import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import { TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react-native';
import { useFinancialData } from '../../src/context/FinancialDataContext';

// Components
import NetWorthChart from '../../src/components/analytics/NetWorthChart';
import IncomeMixChart from '../../src/components/analytics/IncomeMixChart';
import SpendingChart from '../../src/components/analytics/SpendingChart';

export default function AnalyticsScreen() {
  const { loading, refresh } = useFinancialData();

  // Mock data matching Web references (Replace with real data from hooks when available)
  const netWorthData = [
    { month: 'JAN', amount: 5000 },
    { month: 'FEV', amount: 8000 },
    { month: 'MAR', amount: 7500 },
    { month: 'ABR', amount: 12000 },
    { month: 'MAI', amount: 15400 },
  ];

  const incomeMixData = [
    { name: 'Salário', value: 8500 },
    { name: 'Freelance', value: 2400 },
    { name: 'Investimentos', value: 1200 },
    { name: 'Outros', value: 800 },
  ];

  const spendingData = [
    { day: 'Seg', value: 400 },
    { day: 'Ter', value: 300 },
    { day: 'Qua', value: 600 },
    { day: 'Qui', value: 800 },
    { day: 'Sex', value: 500 },
    { day: 'Sáb', value: 900 },
    { day: 'Dom', value: 700 },
  ];

  return (
    <ScreenContainer>
      <ScrollView 
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#fff" />}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-10">
          <Text className="text-violet-500 text-[10px] font-black uppercase tracking-[3px] mb-1">Inteligência</Text>
          <Text className="text-white text-3xl font-black tracking-tighter">Análise & Insights</Text>
        </View>

        {/* Patrimônio Evolution */}
        <NetWorthChart data={netWorthData} />

        {/* Income Mix */}
        <IncomeMixChart data={incomeMixData} />

        {/* Weekly Spending */}
        <SpendingChart data={spendingData} />

        {/* Placeholder for more insights */}
        <View className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 mb-20">
          <View className="flex-row items-center gap-3 mb-4">
            <Activity size={20} color="#a78bfa" />
            <Text className="text-white font-black text-lg">Sugestão Vesper</Text>
          </View>
          <Text className="text-white/40 font-bold leading-relaxed">
            Seu patrimônio cresceu 12% este mês. Baseado no seu mix de receitas, você poderia aumentar o aporte na meta "Reserva de Emergência" em R$ 450,00 sem comprometer sua liquidez.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
