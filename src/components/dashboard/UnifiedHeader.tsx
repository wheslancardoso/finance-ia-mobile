import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Wallet, Plus, ShieldCheck } from 'lucide-react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../../utils/format';

interface UnifiedHeaderProps {
  monthOffset: number;
  targetDate: Date;
  netLiquidityCents: number;
  accumulatedBalanceCents: number;
  totalConsolidatedDebtCents: number;
  monthlyOutlook: any;
  isCrisisMode: boolean;
  debtExit: any;
  weeklySurvival: any;
  onAddTransaction: () => void;
  onJumpToDebtExit?: () => void;
}

export default function UnifiedHeader({
  monthOffset,
  targetDate,
  netLiquidityCents,
  accumulatedBalanceCents,
  totalConsolidatedDebtCents,
  monthlyOutlook,
  isCrisisMode,
  debtExit,
  weeklySurvival,
  onAddTransaction,
  onJumpToDebtExit
}: UnifiedHeaderProps) {
  const isFuture = monthOffset > 0;
  const isRecoveryMode = netLiquidityCents < -100;
  
  // Lógica do Teto de Sobrevivência (Unificada do HUD da Web)
  const survivalCeilingCents = Math.max(0, monthlyOutlook.balanceAtMonthEnd);
  const weeklyLimit = survivalCeilingCents / 4;

  return (
    <View className="mb-8">
      <View className="relative bg-[#0d0d0d] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
        {/* Premium Background Effects */}
        <LinearGradient
          colors={[
            isCrisisMode ? 'rgba(220, 38, 38, 0.4)' : isRecoveryMode ? 'rgba(217, 119, 6, 0.4)' : 'rgba(139, 92, 246, 0.4)',
            'transparent'
          ]}
          style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150 }}
        />
        
        <View className="p-8">
          {/* Top Row: Visão Consolidada + Botão Nova */}
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center gap-4">
              <View className={`w-12 h-12 rounded-2xl items-center justify-center border ${
                isCrisisMode ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10'
              }`}>
                <Wallet size={24} color={isCrisisMode ? '#f87171' : 'rgba(255,255,255,0.6)'} />
              </View>
              <View>
                <View className="flex-row items-center gap-2">
                  <MotiView
                    from={{ opacity: 0.4 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'timing', duration: 1000, loop: true, repeatReverse: true }}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                  />
                  <Text className="text-[10px] font-black text-white/30 uppercase tracking-[3px]">
                    {isFuture ? `Time Machine: ${format(targetDate, "MMMM", { locale: ptBR })}` : "Tempo Real"}
                  </Text>
                </View>
                <Text className="text-[10px] font-bold text-white/20 mt-1">
                  {isFuture ? "Projeção acumulada de liquidez" : "Saldo disponível para o ciclo"}
                </Text>
              </View>
            </View>

            {!isFuture ? (
              <Pressable 
                onPress={onAddTransaction}
                className="bg-white px-5 py-3 rounded-2xl flex-row items-center gap-2 shadow-xl"
              >
                <Plus size={16} color="#000" />
                <Text className="text-black font-black text-[10px] uppercase tracking-widest">Nova</Text>
              </Pressable>
            ) : (
              isRecoveryMode && onJumpToDebtExit && (
                <Pressable 
                  onPress={onJumpToDebtExit}
                  className="bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-2xl flex-row items-center gap-2"
                >
                  <Text className="text-amber-500 font-black text-[9px] uppercase tracking-widest">Ver Saída</Text>
                </Pressable>
              )
            )}
          </View>

          {/* Main Value: Liquidez ao Fim do Mês */}
          <View className="mb-10">
            <Text className={`text-[10px] font-black uppercase tracking-[4px] mb-2 ${
              isCrisisMode ? 'text-red-400/60' : isRecoveryMode ? 'text-amber-400/60' : 'text-white/30'
            }`}>
              {isCrisisMode ? "Alerta de Crise" : isRecoveryMode ? "Liquidez Zero em" : "Liquidez ao Fim do Mês"}
            </Text>
            
            <Text 
              className={`text-6xl font-black tracking-tighter tabular-nums ${
                isCrisisMode ? 'text-red-400' : 'text-white'
              }`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {isCrisisMode 
                ? "Ajuste Necessário" 
                : isRecoveryMode 
                  ? (debtExit.exitDate ? format(new Date(debtExit.exitDate), "MMM'/'yy", { locale: ptBR }) : "---")
                  : formatCurrency(netLiquidityCents)
              }
            </Text>

            {/* Sub-stats Row */}
            <View className="flex-row items-center gap-6 mt-8">
              <View>
                <Text className="text-[8px] font-black text-white/20 uppercase tracking-[2px] mb-1">Saldo Real</Text>
                <Text className="text-emerald-400 font-black text-sm">{formatCurrency(accumulatedBalanceCents)}</Text>
              </View>
              <View className="w-px h-8 bg-white/5" />
              <View>
                <Text className="text-[8px] font-black text-white/20 uppercase tracking-[2px] mb-1">Dívida Total</Text>
                <Text className="text-red-400/80 font-black text-sm">{formatCurrency(totalConsolidatedDebtCents)}</Text>
              </View>
              <View className="w-px h-8 bg-white/5" />
              <View className={`px-3 py-1.5 rounded-full border ${
                isCrisisMode ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
              }`}>
                <Text className={`text-[8px] font-black uppercase tracking-widest ${
                  isCrisisMode ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {isCrisisMode ? "Crítico" : "Saudável"}
                </Text>
              </View>
            </View>
          </View>

          {/* Weekly Survival Card (Embedded) */}
          <View className="bg-white/[0.03] border border-white/5 rounded-[32px] p-6 relative overflow-hidden">
            <View className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full" style={{ opacity: 0.1 }} />
            
            <View className="flex-row items-center gap-4 mb-4">
              <View className={`w-10 h-10 rounded-xl items-center justify-center border ${
                isCrisisMode ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
              }`}>
                <ShieldCheck size={20} color={isCrisisMode ? '#f87171' : '#34d399'} />
              </View>
              <View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                  {isCrisisMode ? "Alerta: Ciclo de Dívida" : "Oxigênio Semanal"}
                </Text>
                <Text className={`text-2xl font-black tabular-nums tracking-tight ${
                  isCrisisMode ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {isCrisisMode 
                    ? formatCurrency(Math.abs(monthlyOutlook.balanceAtMonthEnd)) 
                    : formatCurrency(weeklyLimit)
                  }
                </Text>
              </View>
            </View>

            <View className="space-y-3">
              <View className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
                <MotiView 
                  from={{ width: '0%' }}
                  animate={{ width: `${Math.min(100, Math.max(5, (weeklySurvival.weeklySpentCents / (weeklyLimit || 1)) * 100))}%` }}
                  transition={{ type: 'timing', duration: 1000 }}
                  style={{ backgroundColor: isCrisisMode ? '#f43f5e' : '#10b981' }}
                  className="h-full rounded-full"
                />
              </View>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-[10px] font-black text-white/20 uppercase tracking-widest">Uso da Semana</Text>
                <Text className={`text-[10px] font-black ${isCrisisMode ? 'text-red-400' : 'text-white/60'}`}>
                  {Math.round((weeklySurvival.weeklySpentCents / (weeklyLimit || 1)) * 100)}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
