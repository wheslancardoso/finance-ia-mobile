import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Shield, Zap, Info } from 'lucide-react-native';
import { useSurvivalCeiling } from '../hooks/useSurvivalCeiling';
import { formatCurrency } from '../utils/format';
import { MotiView } from 'moti';

export default function SurvivalCeiling() {
  const { ceiling, loading } = useSurvivalCeiling();

  if (loading && ceiling === 0) return null;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 mb-6 shadow-2xl"
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-600/20 items-center justify-center mr-3">
            <Shield color="#8b5cf6" size={16} />
          </View>
          <Text className="text-white/40 text-[10px] font-black uppercase tracking-[2px]">Teto de Sobrevivência</Text>
        </View>
        <Zap color="#8b5cf6" size={14} className="opacity-50" />
      </View>

      <View className="flex-row items-baseline">
        <Text className="text-white text-4xl font-black tracking-tighter">
          {formatCurrency(ceiling)}
        </Text>
        <Text className="text-white/20 text-[10px] font-black uppercase ml-2 tracking-widest">Saldo Livre</Text>
      </View>

      <View className="mt-6 flex-row items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
        <Info size={12} color="rgba(255,255,255,0.2)" className="mr-3" />
        <Text className="text-white/30 text-[9px] font-bold leading-relaxed flex-1">
          Liquidez imediata disponível após deduções de custos fixos e faturas.
        </Text>
      </View>
    </MotiView>
  );
}
