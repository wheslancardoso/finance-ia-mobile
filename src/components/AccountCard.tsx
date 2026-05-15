import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { CreditCard, Wallet, Banknote, CalendarDays } from 'lucide-react-native';
import { MotiView } from 'moti';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils/format';

interface AccountCardProps {
  account: any;
  onPress?: (account: any) => void;
  onEdit?: (account: any) => void;
  onDelete?: (account: any) => void;
  onPayInvoice?: () => void;
}

export default function AccountCard({ account, onPress, onEdit, onDelete, onPayInvoice }: AccountCardProps) {
  const { 
    id, 
    name, 
    type, 
    color_hex: colorHex, 
    balance_cents: balance, 
    credit_limit_cents: limit,
    closing_day,
    due_day,
    open_invoice_cents,
    closed_invoice_cents,
    open_invoice_month,
    closed_invoice_month,
    total_debt_cents,
    next_month_impact_cents
  } = account;

  const isCreditCard = type === "CREDIT_CARD";
  const openAmount = open_invoice_cents || 0;
  const closedAmount = closed_invoice_cents || 0;
  const hasClosedInvoice = isCreditCard && closedAmount > 0;

  const spent = isCreditCard ? Math.abs(balance) : Math.abs(balance);
  const available = (limit || 0) - (isCreditCard ? (total_debt_cents || spent) : 0);
  const percentage = isCreditCard && limit > 0 ? Math.min(((total_debt_cents || spent) / limit) * 100, 100) : 0;

  // Formata o mês da fatura
  const getInvoiceMonth = (monthRaw: string) => {
    if (!monthRaw) return "---";
    try {
      const [y, m] = monthRaw.split("-");
      return format(new Date(parseInt(y), parseInt(m) - 1, 1), "MMM", { locale: ptBR });
    } catch (e) {
      return monthRaw;
    }
  };

  return (
    <View className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden mb-4">
      {/* Glow Effect */}
      <View 
        className="absolute -top-12 -right-12 w-24 h-24 blur-[60px]"
        style={{ backgroundColor: colorHex, opacity: 0.15 }}
      />

      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-row items-center gap-4">
          <View 
            className="w-12 h-12 rounded-2xl items-center justify-center border border-white/10"
            style={{ backgroundColor: `${colorHex}15` }}
          >
            {isCreditCard ? (
              <CreditCard size={24} color={colorHex} />
            ) : type === "CASH" ? (
              <Banknote size={24} color={colorHex} />
            ) : (
              <Wallet size={24} color={colorHex} />
            )}
          </View>
          <View>
            <Text className="text-white font-bold text-lg leading-none mb-1">{name}</Text>
            <Text className="text-white/40 text-[10px] uppercase tracking-widest font-black">
              {type === "CHECKING" ? "Conta Corrente" : 
               type === "SAVINGS" ? "Investimento" : 
               type === "CREDIT_CARD" ? "Cartão de Crédito" : "Dinheiro"}
            </Text>
          </View>
        </View>
        
        {/* Simplified Action Button for Mobile */}
        <Pressable onPress={() => onEdit?.(account)} className="p-2">
          <View className="w-1 h-1 bg-white/20 rounded-full mb-1" />
          <View className="w-1 h-1 bg-white/20 rounded-full mb-1" />
          <View className="w-1 h-1 bg-white/20 rounded-full" />
        </Pressable>
      </View>

      <View className="space-y-6">
        {isCreditCard ? (
          <View>
            <View className="flex-row items-center gap-2 mb-2">
              <View className={`w-2 h-2 rounded-full ${hasClosedInvoice ? 'bg-red-400' : 'bg-emerald-400'}`} />
              <Text className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Fatura {hasClosedInvoice ? "Fechada" : "Aberta"} — {getInvoiceMonth(hasClosedInvoice ? closed_invoice_month : open_invoice_month)}
              </Text>
            </View>
            
            <View className="flex-row items-baseline gap-3">
              <Text className="text-4xl font-black tracking-tighter tabular-nums text-amber-500">
                {formatCurrency(hasClosedInvoice ? closedAmount : openAmount)}
              </Text>
              {onPress && (
                <Pressable onPress={() => onPress(account)}>
                  <Text className="text-[9px] font-black text-violet-400/60 uppercase tracking-widest border-b border-violet-400/20">Reajustar</Text>
                </Pressable>
              )}
            </View>
          </View>
        ) : (
          <View>
            <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Saldo Atual</Text>
            <Text className="text-4xl font-black tracking-tighter tabular-nums text-white">
              {formatCurrency(balance)}
            </Text>
          </View>
        )}

        {isCreditCard && limit > 0 && (
          <View className="mt-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-[10px] font-black uppercase tracking-widest text-white/40">Limite Utilizado</Text>
              <Text className="text-[10px] font-black text-white/60">{percentage.toFixed(0)}%</Text>
            </View>
            <View className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
              <MotiView 
                from={{ width: '0%' }}
                animate={{ width: `${percentage}%` }}
                transition={{ type: 'timing', duration: 1000 }}
                style={{ backgroundColor: colorHex }}
                className="h-full rounded-full"
              />
            </View>
            <View className="mt-3 space-y-1">
              <View className="flex-row justify-between">
                <Text className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Disponível: {formatCurrency(available)}</Text>
                <Text className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Total: {formatCurrency(limit)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-[9px] font-black text-violet-400/40 uppercase tracking-tight">Dívida Total: {formatCurrency(total_debt_cents || spent)}</Text>
                {next_month_impact_cents > 0 && (
                  <Text className="text-emerald-400/50 text-[9px] font-black uppercase tracking-tight">+{formatCurrency(next_month_impact_cents)} em breve</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </View>

      <View className="mt-6 pt-6 border-t border-white/5 flex-row items-center justify-between">
        {isCreditCard ? (
          <View className="flex-row gap-6">
            <View>
              <Text className="text-[8px] font-black text-white/20 uppercase tracking-widest">Fecha dia</Text>
              <Text className="text-xs font-black text-white/60 mt-1">{closing_day || "--"}</Text>
            </View>
            <View>
              <Text className="text-[8px] font-black text-white/20 uppercase tracking-widest">Vence dia</Text>
              <Text className="text-xs font-black text-white/60 mt-1">{due_day || "--"}</Text>
            </View>
          </View>
        ) : (
          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colorHex }} />
        )}

        {isCreditCard && hasClosedInvoice ? (
          <Pressable 
            onPress={onPayInvoice}
            className="bg-violet-500/20 px-5 py-2.5 rounded-xl border border-violet-500/20"
          >
            <Text className="text-violet-400 font-black text-[10px] uppercase tracking-widest">Pagar Fatura</Text>
          </Pressable>
        ) : (
          <Text className="text-[10px] text-white/20 font-black uppercase tracking-tighter">Vesper Sync</Text>
        )}
      </View>
    </View>
  );
}
