import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Settings } from 'lucide-react-native';
import { MotiView } from 'moti';
import ScreenContainer from '@/components/ScreenContainer';
import { useAccounts, Account } from '../../src/hooks/useAccounts';
import AccountCard from '../../src/components/AccountCard';
import AccountDetailsModal from '../../src/components/AccountDetailsModal';
import AddAccountModal from '../../src/components/AddAccountModal';
import { formatCurrency } from '../../src/utils/format';
import * as Haptics from 'expo-haptics';

export default function AccountsPage() {
  const router = useRouter();
  const { accounts, loading, refresh } = useAccounts();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const totalBalanceCents = accounts.reduce((acc, curr) => 
    curr.type !== 'CREDIT_CARD' ? acc + curr.balance_cents : acc, 0
  );

  const totalCreditDebtCents = accounts.reduce((acc, curr) => 
    curr.type === 'CREDIT_CARD' ? acc + Math.abs(curr.balance_cents) : acc, 0
  );

  if (loading && accounts.length === 0) {
    return (
      <View className="flex-1 bg-[#050505] justify-center items-center">
        <ActivityIndicator color="#10b981" size="large" />
      </View>
    );
  }

  return (
    <ScreenContainer>
      {/* Premium Header */}
      <View className="px-6 pb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-violet-500 text-[10px] font-black uppercase tracking-[3px] mb-1">Gestão</Text>
          <Text className="text-white text-2xl font-black tracking-tighter">Patrimônio</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Pressable 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/profile');
            }}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl items-center justify-center"
          >
            <Settings color="rgba(255,255,255,0.6)" size={18} />
          </Pressable>
          <Pressable 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowAddModal(true);
            }}
            className="w-10 h-10 bg-violet-600 rounded-xl items-center justify-center shadow-lg shadow-violet-600/30"
          >
            <Plus color="#fff" size={20} />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#8b5cf6" />
        }
      >
        {/* Consolidated Summary - Glass Style */}
        <MotiView 
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-10 items-center bg-white/[0.03] border border-white/10 rounded-[40px] mb-10 overflow-hidden"
        >
          <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-600/10 blur-[60px] rounded-full" />
          
          <Text className="text-white/40 text-[10px] font-black uppercase tracking-[2px] mb-3">Saldo Consolidado</Text>
          <Text className="text-white text-5xl font-black tracking-tighter">
            {formatCurrency(totalBalanceCents - totalCreditDebtCents)}
          </Text>
          
          <View className="flex-row gap-6 mt-8">
            <View className="items-center">
              <Text className="text-white/20 text-[8px] font-black uppercase tracking-widest mb-1">Ativos</Text>
              <Text className="text-emerald-400 font-bold text-base">{formatCurrency(totalBalanceCents)}</Text>
            </View>
            <View className="w-[1px] h-6 bg-white/10 self-center" />
            <View className="items-center">
              <Text className="text-white/20 text-[8px] font-black uppercase tracking-widest mb-1">Dívidas</Text>
              <Text className="text-rose-400 font-bold text-base">{formatCurrency(totalCreditDebtCents)}</Text>
            </View>
          </View>
        </MotiView>

        {/* Section: Accounts */}
        <View className="mb-10">
          <View className="flex-row items-center justify-between mb-6 px-1">
            <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">Liquidez Imediata</Text>
            <View className="h-[1px] flex-1 bg-white/5 ml-4" />
          </View>
          {accounts.filter(a => a.type !== 'CREDIT_CARD').map((account) => (
            <AccountCard 
              key={account.id} 
              account={account} 
              onPress={setSelectedAccount} 
              onEdit={setEditingAccount}
            />
          ))}
        </View>

        {/* Section: Cards */}
        <View className="mb-12">
          <View className="flex-row items-center justify-between mb-6 px-1">
            <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">Crédito e Passivos</Text>
            <View className="h-[1px] flex-1 bg-white/5 ml-4" />
          </View>
          {accounts.filter(a => a.type === 'CREDIT_CARD').map((account) => (
            <AccountCard 
              key={account.id} 
              account={account} 
              onPress={setSelectedAccount} 
              onEdit={setEditingAccount}
            />
          ))}
        </View>
      </ScrollView>

      {selectedAccount && (
        <AccountDetailsModal 
          account={selectedAccount} 
          onClose={() => setSelectedAccount(null)} 
          onEdit={(acc) => {
            setSelectedAccount(null);
            setEditingAccount(acc);
          }}
        />
      )}

      {(showAddModal || editingAccount) && (
        <AddAccountModal 
          account={editingAccount}
          onClose={() => {
            setShowAddModal(false);
            setEditingAccount(null);
          }} 
        />
      )}
    </ScreenContainer>
  );
}
