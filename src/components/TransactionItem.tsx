import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, Layers, Check } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MotiView } from 'moti';
import { formatCurrency } from '../utils/format';

interface TransactionItemProps {
  transaction: any;
  onPress?: () => void;
  onTogglePaid?: () => void;
}

export default function TransactionItem({ transaction, onPress, onTogglePaid }: TransactionItemProps) {
  const isIncome = transaction.transaction_type === "INCOME";
  const isPaid = transaction.is_paid;
  const isInstallment = (transaction.installment_total || 0) > 1;

  return (
    <Pressable 
      onPress={onPress}
      className={`bg-white/[0.03] border border-white/5 rounded-[24px] p-4 mb-3 flex-row items-center justify-between ${isPaid ? 'opacity-40' : ''}`}
    >
      <View className="flex-row items-center gap-4 flex-1">
        {/* Icon Container */}
        <View className={`w-12 h-12 rounded-2xl items-center justify-center border ${
          isIncome ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
        }`}>
          {isIncome ? (
            <ArrowUpRight size={20} color="#34d399" />
          ) : (
            <ArrowDownLeft size={20} color="#f87171" />
          )}
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text 
            numberOfLines={1} 
            className={`text-white font-bold text-base ${isPaid ? 'line-through text-white/40' : ''}`}
          >
            {transaction.description}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <View 
              className="px-2 py-0.5 rounded-full border"
              style={{ 
                backgroundColor: `${transaction.category?.color_hex || '#ffffff'}10`,
                borderColor: `${transaction.category?.color_hex || '#ffffff'}30`
              }}
            >
              <Text 
                className="text-[8px] font-black uppercase tracking-widest"
                style={{ color: transaction.category?.color_hex || '#ffffff' }}
              >
                {transaction.category?.name || "Geral"}
              </Text>
            </View>
            <Text className="text-[8px] font-black text-white/20 uppercase tracking-tighter">
              • {transaction.account?.name || "Conta"}
            </Text>
            {isInstallment && (
              <View className="flex-row items-center gap-1 bg-violet-500/10 px-1.5 py-0.5 rounded-md border border-violet-500/20">
                <Layers size={10} color="#a78bfa" />
                <Text className="text-[8px] font-black text-violet-400">
                  {transaction.installment_current}/{transaction.installment_total}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Right side: Amount and Paid Toggle */}
      <View className="flex-row items-center gap-4">
        <View className="items-end">
          <Text className={`font-black text-lg tabular-nums ${
            isIncome ? 'text-emerald-400' : 'text-white'
          } ${isPaid ? 'text-white/20' : ''}`}>
            {isIncome ? "+" : "-"} {formatCurrency(transaction.amount_cents)}
          </Text>
          <Text className="text-[8px] font-black text-white/20 uppercase">
            {format(new Date(transaction.date), "dd MMM yy", { locale: ptBR })}
          </Text>
        </View>

        {/* Paid Button */}
        {!isIncome && (
          <Pressable 
            onPress={onTogglePaid}
            className={`w-8 h-8 rounded-full items-center justify-center border-2 transition-all ${
              isPaid 
                ? 'bg-emerald-500 border-emerald-500 shadow-lg' 
                : 'bg-transparent border-white/10'
            }`}
          >
            <Check size={16} color={isPaid ? '#000' : 'transparent'} strokeWidth={4} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
