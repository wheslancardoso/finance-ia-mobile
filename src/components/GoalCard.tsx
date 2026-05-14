import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Sparkles, ShieldCheck } from 'lucide-react-native';
import { MotiView } from 'moti';
import { formatCurrency } from '../utils/format';

interface GoalCardProps {
  goal: any;
  onPress?: () => void;
  onContribution?: () => void;
}

export default function GoalCard({ goal, onPress, onContribution }: GoalCardProps) {
  const percentage = Math.min((goal.current_amount_cents / goal.target_amount_cents) * 100, 100);
  const remaining = goal.target_amount_cents - goal.current_amount_cents;
  const isCompleted = percentage >= 100;

  return (
    <View className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden mb-4 h-[320px] justify-between">
      {/* Background Glow */}
      <View 
        className="absolute -top-10 -right-10 w-24 h-24 blur-[60px]"
        style={{ backgroundColor: goal.color_hex, opacity: 0.1 }}
      />

      <View>
        <View className="flex-row justify-between items-start mb-6">
          <View 
            className="w-14 h-14 rounded-2xl items-center justify-center border border-white/10"
            style={{ backgroundColor: `${goal.color_hex}15` }}
          >
            <Sparkles size={28} color={goal.color_hex} />
          </View>
          {goal.deadline && (
            <View className="items-end">
              <Text className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Prazo Estimado</Text>
              <Text className="text-xs font-black text-white/60">
                {new Date(goal.deadline).toLocaleDateString("pt-BR", { month: 'short', year: 'numeric' })}
              </Text>
            </View>
          )}
        </View>

        {isCompleted && (
          <View className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex-row items-center gap-2 mb-4">
            <ShieldCheck size={16} color="#34d399" />
            <Text className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex-1">Pronto para Compra</Text>
          </View>
        )}

        <View className="space-y-2 mb-6">
          <Text className="text-2xl font-black text-white tracking-tighter" numberOfLines={1}>{goal.name}</Text>
          <View className="flex-row items-center justify-between mt-1">
            <View className="flex-row items-baseline gap-1.5">
              <Text className="text-white font-black text-base">{formatCurrency(goal.current_amount_cents)}</Text>
              <Text className="text-white/20 text-[10px] font-bold">de {formatCurrency(goal.target_amount_cents)}</Text>
            </View>
            {goal.monthly_contribution_cents > 0 && (
              <Text className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{formatCurrency(goal.monthly_contribution_cents)} / mês</Text>
            )}
          </View>
        </View>
      </View>

      <View>
        <View className="space-y-3 mb-6">
          <View className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
            <MotiView 
              from={{ width: '0%' }}
              animate={{ width: `${percentage}%` }}
              transition={{ type: 'timing', duration: 1000 }}
              style={{ backgroundColor: goal.color_hex }}
              className="h-full rounded-full"
            />
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: goal.color_hex }}>{percentage.toFixed(1)}% Completo</Text>
            <Text className="text-[10px] font-black text-white/20 uppercase tracking-widest">Faltam {formatCurrency(remaining)}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between pt-4 border-t border-white/5">
          <Pressable onPress={onPress}>
            <Text className="text-[10px] font-black text-white/40 uppercase tracking-widest">Detalhes</Text>
          </Pressable>
          <Pressable 
            onPress={onContribution}
            className="bg-white/5 px-5 py-2.5 rounded-xl border border-white/5"
          >
            <Text className="text-[10px] font-black text-white uppercase tracking-widest">Aportar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
