import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sparkles, TrendingDown, Calendar, Wallet, ArrowRight } from 'lucide-react-native';
import { useFinancialAnalysis } from '../src/hooks/useFinancialAnalysis';
import { formatCurrency } from '../src/utils/format';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MotiView, AnimatePresence } from 'moti';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function SimulatorScreen() {
  const router = useRouter();
  const { analysis, loading } = useFinancialAnalysis();
  
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState('1');
  const [description, setDescription] = useState('');

  const simulationResult = useMemo(() => {
    if (!analysis || !amount || parseFloat(amount) <= 0) return null;
    const amountCents = Math.round(parseFloat(amount.replace(',', '.')) * 100);
    const numInstallments = parseInt(installments) || 1;
    return analysis.simulateDetailedImpact(amountCents, numInstallments);
  }, [analysis, amount, installments]);

  if (loading || !analysis) {
    return (
      <View className="flex-1 bg-[#050505] items-center justify-center">
        <ActivityIndicator color="#8b5cf6" size="large" />
      </View>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pb-6 flex-row items-center">
        <Pressable 
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl items-center justify-center mr-4"
        >
          <ChevronLeft color="#fff" size={20} />
        </Pressable>
        <View>
          <Text className="text-violet-500 text-[10px] font-black uppercase tracking-[3px] mb-1">Simulador de Impacto</Text>
          <Text className="text-white text-2xl font-black tracking-tighter">Time Machine</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Input Card */}
        <MotiView 
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 mb-10"
        >
          <View className="mb-8">
            <Text className="text-white/20 text-[9px] font-black uppercase tracking-[2px] mb-4 px-1">O que você pretende comprar?</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-base font-bold"
              placeholder="Ex: Novo MacBook, Viagem..."
              placeholderTextColor="rgba(255,255,255,0.1)"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View className="flex-row gap-4 mb-8">
            <View className="flex-[2]">
              <Text className="text-white/20 text-[9px] font-black uppercase tracking-[2px] mb-4 px-1">Valor Total</Text>
              <View className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 flex-row items-center">
                <Text className="text-white/20 font-bold mr-2">R$</Text>
                <TextInput
                  className="flex-1 text-white text-xl font-black tabular-nums"
                  placeholder="0,00"
                  placeholderTextColor="rgba(255,255,255,0.1)"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-white/20 text-[9px] font-black uppercase tracking-[2px] mb-4 px-1">Parcelas</Text>
              <TextInput
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-xl font-black text-center tabular-nums"
                placeholder="1"
                placeholderTextColor="rgba(255,255,255,0.1)"
                keyboardType="numeric"
                value={installments}
                onChangeText={setInstallments}
              />
            </View>
          </View>
        </MotiView>

        {/* Results Section */}
        <AnimatePresence>
          {simulationResult ? (
            <MotiView
              key="results"
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 mb-12"
            >
              {/* Impact Overview */}
              <View className="bg-violet-600/10 border border-violet-600/20 rounded-[40px] p-8 overflow-hidden">
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.1)', 'transparent']}
                  className="absolute inset-0"
                />
                <View className="flex-row items-center gap-4 mb-8">
                  <View className="w-12 h-12 bg-violet-600 rounded-2xl items-center justify-center shadow-xl shadow-violet-600/30">
                    <Sparkles size={24} color="#fff" />
                  </View>
                  <View>
                    <Text className="text-white font-black text-lg">Análise de Impacto</Text>
                    <Text className="text-violet-400/60 text-[9px] font-black uppercase tracking-[2px]">Vesper Strategy Engine</Text>
                  </View>
                </View>

                <View className="space-y-6">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white/40 text-xs font-bold">Custo Mensal</Text>
                    <Text className="text-white font-black text-xl">{formatCurrency(simulationResult.monthlyCostCents)}</Text>
                  </View>
                  <View className="h-px bg-white/5" />
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white/40 text-xs font-bold">Novo Saldo Livre</Text>
                    <Text className={`font-black text-xl ${simulationResult.newMonthlySurplus > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(simulationResult.newMonthlySurplus)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Specific Impacts */}
              <View className="flex-row gap-4">
                <View className="flex-1 bg-white/[0.03] border border-white/10 rounded-[32px] p-6">
                  <TrendingDown size={18} color="#f87171" className="mb-4" />
                  <Text className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1">Atraso na Saída</Text>
                  <Text className="text-white font-black text-lg">+{simulationResult.debt_exit_delay_months} meses</Text>
                </View>
                <View className="flex-1 bg-white/[0.03] border border-white/10 rounded-[32px] p-6">
                  <Calendar size={18} color="#8b5cf6" className="mb-4" />
                  <Text className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1">Nova Saída</Text>
                  <Text className="text-white font-black text-lg">
                    {simulationResult.newExitDate ? format(new Date(simulationResult.newExitDate), "MMM'/'yy", { locale: ptBR }) : 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Recommendation Card */}
              <View className={`p-8 rounded-[40px] border ${simulationResult.status === 'SAFE' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                <Text className={`text-[10px] font-black uppercase tracking-[3px] mb-4 ${simulationResult.status === 'SAFE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simulationResult.status === 'SAFE' ? '✅ Recomendação: Viável' : '⚠️ Recomendação: Risco'}
                </Text>
                <Text className="text-white/60 text-xs font-bold leading-relaxed">
                  {simulationResult.status === 'SAFE' 
                    ? `Esta compra cabe no seu teto de sobrevivência. O impacto na sua saída de dívidas é de apenas ${simulationResult.debt_exit_delay_months} meses.`
                    : `CUIDADO: Esta compra deixará seu saldo mensal negativo em ${formatCurrency(Math.abs(simulationResult.newMonthlySurplus))}. Recomendamos aguardar ou parcelar em mais vezes.`
                  }
                </Text>
              </View>
            </MotiView>
          ) : (
            <MotiView
              key="placeholder"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 items-center justify-center"
            >
              <View className="w-20 h-20 bg-white/5 rounded-[32px] items-center justify-center mb-6">
                <TrendingDown size={32} color="rgba(255,255,255,0.1)" />
              </View>
              <Text className="text-white/20 font-black uppercase tracking-[3px] text-center px-10 leading-relaxed">
                Insira os dados acima para ver a projeção do futuro do seu dinheiro
              </Text>
            </MotiView>
          )}
        </AnimatePresence>

        <View className="h-20" />
      </ScrollView>
    </ScreenContainer>
  );
}
