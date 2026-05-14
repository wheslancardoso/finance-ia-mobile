import React from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, TrendingUp, Activity, PieChart, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { useFinancialAnalysis } from '../../src/hooks/useFinancialAnalysis';
import { formatCurrency } from '../../src/utils/format';
import { MotiView } from 'moti';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function ReportsScreen() {
  const router = useRouter();
  const { analysis, loading } = useFinancialAnalysis();

  if (loading || !analysis) {
    return (
      <SafeAreaView className="flex-1 bg-[#050505] items-center justify-center">
        <ActivityIndicator color="#8b5cf6" size="large" />
      </SafeAreaView>
    );
  }

  const { healthScore, netWorthHistory, incomeMix } = analysis;

  return (
    <SafeAreaView className="flex-1 bg-[#050505]">
      {/* Premium Header */}
      <View className="px-6 py-8 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl items-center justify-center mr-4"
          >
            <ChevronLeft color="#fff" size={20} />
          </Pressable>
          <View>
            <Text className="text-violet-500 text-[10px] font-black uppercase tracking-[3px] mb-1">Inteligência</Text>
            <Text className="text-white text-2xl font-black tracking-tighter">Insights Vesper</Text>
          </View>
        </View>
        <View className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl items-center justify-center">
          <Activity color="rgba(255,255,255,0.6)" size={20} />
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Health Score Gauge - Glassy */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 mb-8 items-center overflow-hidden"
        >
          <View className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full" />
          
          <View className="flex-row items-center self-start mb-10">
            <View className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 items-center justify-center mr-3">
              <Activity color="#60a5fa" size={20} />
            </View>
            <Text className="text-white/40 text-[10px] font-black uppercase tracking-[2px]">Saúde Financeira</Text>
          </View>

          <View className="relative items-center justify-center py-4">
            <HealthGauge score={healthScore} />
            <View className="absolute items-center top-12">
              <Text className="text-6xl font-black text-white tracking-tighter">{healthScore}</Text>
              <Text className="text-white/20 text-[8px] font-black uppercase tracking-[3px] mt-1">Score Vesper</Text>
            </View>
          </View>

          <View className="w-full mt-10 p-5 rounded-[24px] bg-white/5 border border-white/10 flex-row items-center">
            {healthScore >= 70 ? (
              <ShieldCheck color="#34d399" size={20} className="mr-4" />
            ) : (
              <AlertCircle color="#fbbf24" size={20} className="mr-4" />
            )}
            <Text className="flex-1 text-white/60 text-[11px] font-bold leading-relaxed">
              {healthScore >= 70 
                ? "Sua estrutura está resiliente. Ótimo momento para novos aportes."
                : "Atenção ao fluxo de caixa. Considere reduzir gastos variáveis."}
            </Text>
          </View>
        </MotiView>

        {/* Net Worth History - Animated Bars */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
          className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 mb-8 overflow-hidden"
        >
          <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-600/10 blur-[60px] rounded-full" />
          
          <View className="flex-row items-center mb-10">
            <View className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 items-center justify-center mr-3">
              <TrendingUp color="#a78bfa" size={20} />
            </View>
            <Text className="text-white/40 text-[10px] font-black uppercase tracking-[2px]">Evolução Patrimonial</Text>
          </View>

          <View className="flex-row items-end justify-between h-40 px-2">
            {netWorthHistory.map((item: any, i: number) => {
              const max = Math.max(...netWorthHistory.map((h: any) => h.amount));
              const height = (item.amount / (max || 1)) * 100;
              return (
                <View key={i} className="items-center">
                  <MotiView 
                    from={{ height: '0%' }}
                    animate={{ height: `${height}%` }}
                    transition={{ type: 'timing', duration: 1000, delay: 400 + (i * 100) }}
                    className="w-10 bg-violet-600 rounded-2xl opacity-80 shadow-lg shadow-violet-600/30" 
                  />
                  <Text className="text-white/20 text-[8px] font-black uppercase mt-4 tracking-widest">{item.month}</Text>
                </View>
              );
            })}
          </View>
        </MotiView>

        {/* Income Mix */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
          className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 mb-12 overflow-hidden"
        >
          <View className="flex-row items-center mb-10">
            <View className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 items-center justify-center mr-3">
              <PieChart color="#f472b6" size={20} />
            </View>
            <Text className="text-white/40 text-[10px] font-black uppercase tracking-[2px]">Mix de Receitas</Text>
          </View>

          {incomeMix.length === 0 ? (
            <View className="py-6 items-center">
              <Text className="text-white/20 text-[10px] font-black uppercase tracking-widest italic">Sem dados detectados</Text>
            </View>
          ) : (
            incomeMix.map((item: any, i: number) => (
              <View key={i} className="flex-row items-center justify-between mb-5 px-1">
                <View className="flex-row items-center">
                   <View className="w-2 h-2 rounded-full bg-pink-500 mr-3" />
                   <Text className="text-white font-bold text-sm">{item.name}</Text>
                </View>
                <Text className="text-white/60 font-black tracking-tight text-sm tabular-nums">{formatCurrency(item.value * 100)}</Text>
              </View>
            ))
          )}
        </MotiView>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}

function HealthGauge({ score }: { score: number }) {
  const radius = 40;
  const strokeWidth = 8;
  const circumference = Math.PI * radius; // Meio círculo
  const offset = circumference - (score / 100) * circumference;

  return (
    <Svg viewBox="0 0 100 50" width={200} height={100}>
      <Defs>
        <LinearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#ef4444" />
          <Stop offset="50%" stopColor="#f59e0b" />
          <Stop offset="100%" stopColor="#10b981" />
        </LinearGradient>
      </Defs>
      <Path
        d="M 10,45 A 40,40 0 0 1 90,45"
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M 10,45 A 40,40 0 0 1 90,45"
        fill="none"
        stroke="url(#healthGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </Svg>
  );
}
