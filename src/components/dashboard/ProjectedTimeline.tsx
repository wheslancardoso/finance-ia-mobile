import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { 
  Utensils, Car, Gamepad, Briefcase, TrendingUp, ShoppingBag, Home, Layers,
  ArrowUpRight, ArrowDownRight, Calendar, Zap, CreditCard, Tv, Music, Wifi,
  Lightbulb, Droplets, Smartphone, Coffee, Heart
} from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/utils/format';

interface ProjectedTimelineProps {
  transactions: any[];
}

const getIcon = (description: string, categoryName: string, type: string) => {
  const desc = description.toLowerCase();
  const name = categoryName?.toLowerCase() || "";
  
  if (desc.includes("netflix") || desc.includes("prime video") || desc.includes("disney") || desc.includes("hbo")) return Tv;
  if (desc.includes("spotify") || desc.includes("youtube premium") || desc.includes("music") || desc.includes("deezer")) return Music;
  if (desc.includes("internet") || desc.includes("wi-fi") || desc.includes("claro") || desc.includes("vivo")) return Wifi;
  if (desc.includes("celular") || desc.includes("tim") || desc.includes("recharge")) return Smartphone;
  if (desc.includes("luz") || desc.includes("energia") || desc.includes("enel")) return Lightbulb;
  if (desc.includes("água") || desc.includes("sabesp") || desc.includes("condomínio")) return Droplets;
  if (desc.includes("amazon") || desc.includes("shopee") || desc.includes("mercado livre") || desc.includes("magalu")) return ShoppingBag;
  if (name.includes("alimento") || name.includes("comer") || name.includes("restaurante") || name.includes("iFood")) return Utensils;
  if (name.includes("café") || desc.includes("starbucks") || desc.includes("padaria")) return Coffee;
  if (name.includes("transporte") || name.includes("uber") || name.includes("carro") || desc.includes("combustível")) return Car;
  if (name.includes("lazer") || name.includes("game") || name.includes("diversão") || desc.includes("steam")) return Gamepad;
  if (name.includes("saúde") || name.includes("médico") || name.includes("farmácia") || name.includes("convênio")) return Heart;
  if (name.includes("salário") || name.includes("trampo") || name.includes("job") || name.includes("recebimento")) return Briefcase;
  if (name.includes("invest") || name.includes("rendimento")) return TrendingUp;
  if (name.includes("moradia") || name.includes("aluguel") || name.includes("casa")) return Home;
  
  return type === "INCOME" ? ArrowUpRight : ArrowDownRight;
};

export default function ProjectedTimeline({ transactions }: ProjectedTimelineProps) {
  if (transactions.length === 0) {
    return (
      <View className="items-center justify-center py-20">
        <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center mb-4 border border-white/10">
          <Calendar size={32} color="rgba(255,255,255,0.1)" />
        </View>
        <Text className="text-white/20 text-[10px] font-black uppercase tracking-widest">Sem previsões para este mês</Text>
      </View>
    );
  }

  const incomes = transactions.filter(t => t.transaction_type === "INCOME");
  const recurringExpenses = transactions.filter(t => t.transaction_type === "EXPENSE" && t.id.startsWith('virtual'));
  const otherExpenses = transactions.filter(t => t.transaction_type === "EXPENSE" && !t.id.startsWith('virtual'));

  return (
    <View className="space-y-8 pb-4">
      {incomes.length > 0 && (
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-4 pl-2">
            <TrendingUp size={12} color="#34d399" />
            <Text className="text-[10px] font-black text-emerald-400/40 uppercase tracking-[3px]">Receitas Esperadas</Text>
          </View>
          {incomes.map((tx) => <ProjectedItem key={tx.id} tx={tx} />)}
        </View>
      )}

      {recurringExpenses.length > 0 && (
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-4 pl-2">
            <Zap size={12} color="#a78bfa" />
            <Text className="text-[10px] font-black text-violet-400/40 uppercase tracking-[3px]">Compromissos Fixos</Text>
          </View>
          {recurringExpenses.map((tx) => <ProjectedItem key={tx.id} tx={tx} />)}
        </View>
      )}

      {otherExpenses.length > 0 && (
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-4 pl-2">
            <Layers size={12} color="rgba(255,255,255,0.2)" />
            <Text className="text-[10px] font-black text-white/20 uppercase tracking-[3px]">Outros Previstos</Text>
          </View>
          {otherExpenses.map((tx) => <ProjectedItem key={tx.id} tx={tx} />)}
        </View>
      )}
    </View>
  );
}

function ProjectedItem({ tx }: { tx: any }) {
  const Icon = getIcon(tx.description, tx.category?.name || tx.category || "", tx.transaction_type);
  const isIncome = tx.transaction_type === "INCOME";
  
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="mb-3"
    >
      <View className="bg-white/[0.03] border border-white/5 p-4 rounded-[28px] flex-row items-center justify-between">
        <View className="flex-row items-center gap-4 flex-1">
          <View className={`w-10 h-10 rounded-2xl items-center justify-center border ${
            isIncome ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5'
          }`}>
            <Icon size={20} color={isIncome ? '#34d399' : 'rgba(255,255,255,0.4)'} />
          </View>

          <View className="flex-1">
            <Text className="text-sm font-bold text-white/80" numberOfLines={1}>
              {tx.description}
            </Text>
            <View className="flex-row items-center gap-2 mt-0.5">
              <Text className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                {format(new Date(tx.date), "dd 'de' MMM", { locale: ptBR })}
              </Text>
            </View>
          </View>
        </View>

        <View className="items-end ml-4">
          <Text className={`text-base font-black tabular-nums tracking-tight ${
            isIncome ? 'text-emerald-400' : 'text-white/90'
          }`}>
            {isIncome ? "+" : "-"} {formatCurrency(tx.amount_cents)}
          </Text>
        </View>
      </View>
    </MotiView>
  );
}
