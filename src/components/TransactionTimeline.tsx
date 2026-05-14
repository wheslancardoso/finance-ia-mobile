import React from 'react';
import { View, Text } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils/format';
import { MotiView } from 'moti';

interface TransactionTimelineProps {
  transactions: any[];
}

export function TransactionTimeline({ transactions }: TransactionTimelineProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <View className="py-12 items-center">
        <Text className="text-white/20 text-[10px] font-black uppercase tracking-widest italic">Nenhuma movimentação detectada</Text>
      </View>
    );
  }

  // Agrupar por dia
  const groups = transactions.reduce((acc: any, t) => {
    const day = format(new Date(t.date), 'dd/MM/yyyy');
    if (!acc[day]) acc[day] = [];
    acc[day].push(t);
    return acc;
  }, {});

  return (
    <View className="pb-4">
      {Object.entries(groups).map(([day, txs]: [string, any], groupIdx) => (
        <View key={day} className="mb-8">
          <View className="flex-row items-center gap-4 mb-4 px-2">
            <Text className="text-[10px] font-black text-white/20 uppercase tracking-[3px]">{day}</Text>
            <View className="h-px flex-1 bg-white/5" />
          </View>
          
          <View className="space-y-4">
            {txs.map((tx: any, idx: number) => (
              <MotiView
                key={tx.id}
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: (groupIdx * 100) + (idx * 50) }}
                className="flex-row items-center justify-between px-4 py-2"
              >
                <View className="flex-row items-center gap-4 flex-1">
                  <View className={`w-2 h-2 rounded-full ${tx.transaction_type === 'INCOME' ? 'bg-emerald-400' : 'bg-white/20'}`} />
                  <View className="flex-1">
                    <Text className="text-white font-bold text-sm" numberOfLines={1}>{tx.description}</Text>
                    <Text className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-0.5">
                      {tx.categories?.name || "Geral"} • {tx.accounts?.name || "Conta"}
                    </Text>
                  </View>
                </View>
                <Text className={`font-black tabular-nums ${tx.transaction_type === 'INCOME' ? 'text-emerald-400' : 'text-white/80'}`}>
                  {tx.transaction_type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount_cents)}
                </Text>
              </MotiView>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
