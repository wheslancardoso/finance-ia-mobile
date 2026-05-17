import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import { useRouter } from 'expo-router';
import { ChevronLeft, Repeat, Play, Pause, CreditCard, Wallet, Plus } from 'lucide-react-native';
import { useRecurring, RecurringTransaction } from '../../src/hooks/useRecurring';
import AddRecurringModal from '../../src/components/AddRecurringModal';
import { formatCurrency } from '../../src/utils/format';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

export default function RecurringScreen() {
  const router = useRouter();
  const { recurring, loading, toggleStatus, refresh } = useRecurring();
  const [selectedRecurring, setSelectedRecurring] = useState<RecurringTransaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const activeRecurring = recurring.filter(r => r.status === 'active');
  const pausedRecurring = recurring.filter(r => r.status === 'paused');

  if (loading && recurring.length === 0) {
    return (
      <View className="flex-1 bg-[#050505] items-center justify-center">
        <ActivityIndicator color="#8b5cf6" size="large" />
      </View>
    );
  }

  return (
    <ScreenContainer>
      {/* Premium Header */}
      <View className="px-6 pb-6 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl items-center justify-center mr-4"
          >
            <ChevronLeft color="#fff" size={20} />
          </Pressable>
          <View>
            <Text className="text-violet-500 text-[10px] font-black uppercase tracking-[3px] mb-1">Previsibilidade</Text>
            <Text className="text-white text-2xl font-black tracking-tighter">Assinaturas</Text>
          </View>
        </View>
        <Pressable 
          onPress={() => setShowAddModal(true)}
          className="w-12 h-12 bg-violet-600 rounded-2xl items-center justify-center shadow-lg shadow-violet-600/30"
        >
          <Plus color="#fff" size={24} />
        </Pressable>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#8b5cf6" />
        }
      >
        {/* Active Section */}
        <View className="mb-10">
          <View className="flex-row items-center justify-between mb-6 px-1">
            <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">Fluxos Ativos</Text>
            <View className="h-[1px] flex-1 bg-white/5 ml-4" />
          </View>
          {activeRecurring.length === 0 ? (
            <View className="py-10 items-center bg-white/[0.02] rounded-[32px] border border-white/5 border-dashed">
              <Repeat size={24} color="rgba(255,255,255,0.1)" className="mb-2" />
              <Text className="text-white/20 text-[10px] font-black uppercase tracking-widest italic">Nenhuma assinatura ativa</Text>
            </View>
          ) : (
            activeRecurring.map((item, index) => (
              <RecurringItem 
                key={item.id} 
                item={item} 
                index={index} 
                onToggle={toggleStatus} 
                onPress={() => setSelectedRecurring(item)}
              />
            ))
          )}
        </View>

        {/* Paused Section */}
        {pausedRecurring.length > 0 && (
          <View className="mb-12">
            <View className="flex-row items-center justify-between mb-6 px-1">
              <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">Pausados</Text>
              <View className="h-[1px] flex-1 bg-white/5 ml-4" />
            </View>
            {pausedRecurring.map((item, index) => (
              <RecurringItem 
                key={item.id} 
                item={item} 
                index={index + 10} 
                onToggle={toggleStatus} 
                onPress={() => setSelectedRecurring(item)}
              />
            ))}
          </View>
        )}

        <View className="h-10" />
      </ScrollView>

      {(showAddModal || selectedRecurring) && (
        <AddRecurringModal 
          recurring={selectedRecurring}
          onClose={() => {
            setShowAddModal(false);
            setSelectedRecurring(null);
            refresh();
          }}
        />
      )}
    </ScreenContainer>
  );
}

function RecurringItem({ item, index, onToggle, onPress }: { item: any, index: number, onToggle: any, onPress: any }) {
  const isPaused = item.status === 'paused';
  
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: index * 50 }}
      className={`rounded-[32px] mb-4 border ${
        isPaused ? 'bg-white/[0.01] border-white/5' : 'bg-white/[0.03] border-white/10'
      } overflow-hidden shadow-2xl`}
    >
      <Pressable 
        onPress={onPress}
        className="flex-row items-center justify-between p-6"
      >
        <View className="flex-row items-center flex-1">
          <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
            isPaused ? 'bg-white/5' : 'bg-violet-600/10 border border-violet-600/20'
          }`}>
            <Repeat size={20} color={isPaused ? 'rgba(255,255,255,0.2)' : '#8b5cf6'} />
          </View>
          <View className="flex-1">
            <Text className={`font-black text-base tracking-tight ${isPaused ? 'text-white/30' : 'text-white'}`} numberOfLines={1}>
              {item.description}
            </Text>
            <Text className="text-white/20 text-[9px] font-black uppercase tracking-[2px] mt-1">
              {item.frequency === 'monthly' ? 'Mensal' : item.frequency} • {item.categories?.name || 'Geral'}
            </Text>
          </View>
        </View>

        <View className="items-end ml-4">
          <Text className={`text-lg font-black tracking-tighter mb-3 tabular-nums ${isPaused ? 'text-white/20' : 'text-white'}`}>
            {formatCurrency(item.amount_cents)}
          </Text>
          <Pressable 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onToggle(item.id, item.status);
            }}
            className={`px-4 py-2 rounded-xl flex-row items-center border ${
              isPaused ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
            }`}
          >
            {isPaused ? (
              <>
                <Play size={10} color="#34d399" className="mr-2" />
                <Text className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">Reativar</Text>
              </>
            ) : (
              <>
                <Pause size={10} color="#f43f5e" className="mr-2" />
                <Text className="text-rose-500 text-[8px] font-black uppercase tracking-widest">Pausar</Text>
              </>
            )}
          </Pressable>
        </View>
      </Pressable>
    </MotiView>
  );
}
