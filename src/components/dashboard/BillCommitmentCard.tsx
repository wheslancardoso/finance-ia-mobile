import React from 'react';
import { View, Text } from 'react-native';
import { CreditCard, Calendar, ShoppingCart, Zap } from 'lucide-react-native';
import { formatCurrency } from '../../utils/format';

interface BillCommitmentCardProps {
  immediateCardDebt: number;
  upcomingCardDebt: number;
  scheduledExpenses: number;
  budgetReserves: number;
  totalPlanned: number;
  isCrisis?: boolean;
}

export default function BillCommitmentCard({
  immediateCardDebt,
  upcomingCardDebt,
  scheduledExpenses,
  budgetReserves,
  totalPlanned,
  isCrisis = false
}: BillCommitmentCardProps) {
  const baseItemsSum = (immediateCardDebt + upcomingCardDebt) + scheduledExpenses + budgetReserves;
  const simulationImpact = Math.max(0, totalPlanned - baseItemsSum);

  const items = [
    { 
      label: "Cartões", 
      value: immediateCardDebt + upcomingCardDebt, 
      icon: CreditCard, 
      color: "#f87171", // red-400
      bgColor: "rgba(248, 113, 113, 0.1)"
    },
    { 
      label: "Agendados", 
      value: scheduledExpenses, 
      icon: Calendar, 
      color: "#a78bfa", // violet-400
      bgColor: "rgba(167, 139, 250, 0.1)"
    },
    { 
      label: "Reservas", 
      value: budgetReserves, 
      icon: ShoppingCart, 
      color: "#34d399", // emerald-400
      bgColor: "rgba(52, 211, 153, 0.1)"
    }
  ];

  if (simulationImpact > 0) {
    items.push({
      label: "Simulado",
      value: simulationImpact,
      icon: Zap,
      color: "#fbbf24", // amber-400
      bgColor: "rgba(251, 191, 36, 0.1)"
    });
  }

  return (
    <View className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 shadow-2xl overflow-hidden flex-1">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-xs font-black text-white uppercase tracking-widest">Compromissos</Text>
          <Text className="text-[9px] text-white/30 font-bold uppercase tracking-tighter mt-1">Saídas previstas</Text>
        </View>
        <View className={`px-2 py-1 rounded-full border ${
          isCrisis ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
        }`}>
          <Text className={`text-[8px] font-black uppercase tracking-widest ${
            isCrisis ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {isCrisis ? "Crítico" : "Ok"}
          </Text>
        </View>
      </View>

      <View className="space-y-4 flex-1">
        {items.map((item, idx) => (
          <View key={idx} className="flex-row items-center justify-between py-3 border-b border-white/5">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl items-center justify-center" style={{ backgroundColor: item.bgColor }}>
                <item.icon size={16} color={item.color} />
              </View>
              <Text className="text-xs font-bold text-white/70">{item.label}</Text>
            </View>
            <Text className="text-xs font-black tabular-nums text-white/90">
              {formatCurrency(item.value)}
            </Text>
          </View>
        ))}
      </View>

      <View className="pt-4 mt-2 border-t border-white/10 flex-row items-center justify-between">
        <Text className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total</Text>
        <Text className="text-xl font-black text-white tabular-nums">{formatCurrency(totalPlanned)}</Text>
      </View>
    </View>
  );
}
