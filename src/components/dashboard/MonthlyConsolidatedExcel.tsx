import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { Briefcase, ArrowDownRight, PieChart } from 'lucide-react-native';
import { formatCurrency } from '../../utils/format';

interface MonthlyConsolidatedExcelProps {
  income: number;
  expenses: number;
  balance: number;
  items: Array<{
    name: string;
    value: number;
    type: "INCOME" | "EXPENSE";
    category?: string;
    isInstallment?: boolean;
    isBudget?: boolean;
    isGoal?: boolean;
  }>;
  monthName: string;
}

export default function MonthlyConsolidatedExcel({ 
  income, 
  expenses, 
  balance, 
  items,
  monthName
}: MonthlyConsolidatedExcelProps) {
  return (
    <View className="space-y-6">
      {/* Mini Header de Totais Estilo Planilha */}
      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
          <View className="flex-row items-center gap-2 mb-1">
            <Briefcase size={12} color="rgba(52, 211, 153, 0.4)" />
            <Text className="text-[9px] font-black text-emerald-400/40 uppercase tracking-widest">Recebido</Text>
          </View>
          <Text className="text-lg font-black text-emerald-400 tabular-nums">
            {formatCurrency(income)}
          </Text>
        </View>
        <View className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4">
          <View className="flex-row items-center gap-2 mb-1">
            <ArrowDownRight size={12} color="rgba(255, 255, 255, 0.2)" />
            <Text className="text-[9px] font-black text-white/20 uppercase tracking-widest">Gasto</Text>
          </View>
          <Text className="text-lg font-black text-white/90 tabular-nums">
            {formatCurrency(expenses)}
          </Text>
        </View>
      </View>

      {/* Lista de Itens (O "Excel") */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white/5 rounded-t-[20px] border-x border-t border-white/10">
          <Text className="text-[9px] font-black text-white/40 uppercase tracking-widest">Descrição</Text>
          <Text className="text-[9px] font-black text-white/40 uppercase tracking-widest">Valor</Text>
        </View>
        
        <View className="border border-white/10 bg-white/[0.02] rounded-b-[20px] overflow-hidden">
          {items.map((item, idx) => (
            <View 
              key={`${item.name}-${idx}`}
              className="flex-row items-center justify-between px-4 py-4 border-b border-white/5"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className={`w-1.5 h-1.5 rounded-full ${
                  item.type === "INCOME" ? "bg-emerald-400" : 
                  item.isInstallment ? "bg-violet-400" :
                  item.isGoal ? "bg-amber-400" : "bg-white/20"
                }`} />
                <View className="flex-1">
                  <Text className="text-xs font-bold text-white/70" numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.category && (
                    <Text className="text-[8px] font-black text-white/20 uppercase tracking-tighter mt-0.5">
                      {item.category}
                    </Text>
                  )}
                </View>
              </View>
              <Text className={`text-xs font-black tabular-nums ml-4 ${
                item.type === "INCOME" ? "text-emerald-400" : "text-white/80"
              }`}>
                {item.type === "INCOME" ? "+" : "-"} {formatCurrency(item.value)}
              </Text>
            </View>
          ))}

          {items.length === 0 && (
            <View className="p-8 items-center">
              <Text className="text-[10px] font-black text-white/20 uppercase tracking-widest">Nenhum dado consolidado</Text>
            </View>
          )}
        </View>
      </View>

      {/* Saldo Final (Destaque Excel) */}
      <View className={`p-6 rounded-[32px] border ${
        balance >= 0 
          ? "bg-emerald-500/10 border-emerald-500/20 shadow-lg shadow-emerald-500/5" 
          : "bg-red-500/10 border-red-500/20 shadow-lg shadow-red-500/5"
      }`}>
        <View className="space-y-3">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-[10px] font-black uppercase tracking-widest text-white/30">Salário Recebido</Text>
            <Text className="text-emerald-400 font-black text-xs">{formatCurrency(income)}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-[10px] font-black uppercase tracking-widest text-white/30">Total Gasto</Text>
            <Text className="text-white/60 font-black text-xs">{formatCurrency(expenses)}</Text>
          </View>
          <View className="h-px bg-white/5 w-full my-2" />
          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-[10px] font-black text-white/40 uppercase tracking-widest">Saldo Atual</Text>
              <Text className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">{monthName}</Text>
            </View>
            <Text className={`text-3xl font-black tabular-nums tracking-tighter ${
              balance >= 0 ? "text-emerald-400" : "text-red-400"
            }`}>
              {formatCurrency(balance)}
            </Text>
          </View>
        </View>
      </View>

      {/* Dica Contextual */}
      <View className="flex-row items-center gap-3 px-5 py-4 bg-white/[0.03] rounded-2xl border border-white/5">
        <PieChart size={14} color="rgba(255,255,255,0.2)" />
        <Text className="text-[9px] font-bold text-white/40 leading-relaxed italic flex-1">
          Este resumo consolida receitas, gastos fixos, parcelamentos ativos e provisões de orçamento para {monthName}.
        </Text>
      </View>
    </View>
  );
}
