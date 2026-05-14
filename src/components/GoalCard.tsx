import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Sparkles, ShieldCheck } from 'lucide-react-native';
import { MotiView } from 'moti';
import { formatCurrency } from '../utils/format';
import { Goal } from '../hooks/useGoals';
import * as Haptics from 'expo-haptics';

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
  onContribute?: () => void;
}

export default function GoalCard({ goal, onPress, onContribute }: GoalCardProps) {
  const percentage = Math.min((goal.current_amount_cents / goal.target_amount_cents) * 100, 100);
  const remaining = goal.target_amount_cents - goal.current_amount_cents;
  const isCompleted = percentage >= 100;
  const color = goal.color_hex || '#8b5cf6';

  return (
    <Pressable 
      onPress={onPress}
      className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 mb-6 overflow-hidden shadow-2xl"
    >
      {/* Background Glow */}
      <View 
        className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-[0.05]"
        style={{ backgroundColor: color, filter: 'blur(50px)' }}
      />

      <View className="flex-row items-start justify-between mb-8">
        <View 
          className="w-14 h-14 rounded-2xl items-center justify-center border border-white/10"
          style={{ backgroundColor: `${color}15` }}
        >
          <Sparkles size={28} color={color} />
        </View>
        {goal.deadline && (
          <View className="items-end bg-white/5 px-3 py-2 rounded-xl border border-white/5">
            <Text className="text-white/20 text-[8px] font-black uppercase tracking-[2px] mb-1">Expectativa</Text>
            <Text className="text-white/60 text-[10px] font-black">
              {new Date(goal.deadline).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {isCompleted && (
        <MotiView 
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex-row items-center gap-3 mb-6"
        >
          <ShieldCheck size={16} color="#34d399" />
          <Text className="text-emerald-400 text-[9px] font-black uppercase tracking-[2px]">
            Objetivo Alcançado • Pronto para Execução
          </Text>
        </MotiView>
      )}

      <View className="mb-6">
        <Text className="text-white text-2xl font-black tracking-tighter mb-2">{goal.name}</Text>
        <View className="flex-row items-baseline justify-between">
          <View className="flex-row items-baseline gap-2">
            <Text className="text-white text-xl font-black tabular-nums">{formatCurrency(goal.current_amount_cents)}</Text>
            <Text className="text-white/20 text-[10px] font-bold">DE {formatCurrency(goal.target_amount_cents)}</Text>
          </View>
        </View>
      </View>

      <View className="space-y-4">
        <View className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <MotiView 
            from={{ width: '0%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'timing', duration: 1500, delay: 300 }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-[10px] font-black uppercase tracking-[2px]" style={{ color }}>
            {percentage.toFixed(1)}% CONCLUÍDO
          </Text>
          <Text className="text-white/20 text-[10px] font-black uppercase tracking-[2px]">
            Faltam {formatCurrency(remaining)}
          </Text>
        </View>
      </View>

      <View className="mt-8 pt-6 border-t border-white/5 flex-row items-center justify-between">
        <View>
          {goal.monthly_contribution_cents > 0 && (
            <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              +{formatCurrency(goal.monthly_contribution_cents)}/MÊS
            </Text>
          )}
        </View>
        <Pressable 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onContribute?.();
          }}
          className="bg-violet-600 px-6 py-3 rounded-2xl shadow-lg shadow-violet-600/20"
        >
          <Text className="text-white text-[10px] font-black uppercase tracking-[2px]">Aportar</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
