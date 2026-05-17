import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, ActivityIndicator } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import { Target, Plus } from 'lucide-react-native';
import { useFinancialData } from '../../src/context/FinancialDataContext';
import GoalCard from '../../src/components/GoalCard';
import GoalRecommendations from '../../src/components/dashboard/GoalRecommendations';
import AddGoalModal from '../../src/components/AddGoalModal';

export default function GoalsScreen() {
  const { goals, loading, refresh } = useFinancialData();
  const [showAddModal, setShowAddModal] = useState(false);

  if (loading && goals.length === 0) {
    return (
      <View className="flex-1 bg-[#050505] items-center justify-center">
        <ActivityIndicator color="#8b5cf6" size="large" />
      </View>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView 
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#fff" />}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-8 px-1">
          <View>
            <Text className="text-white font-black text-3xl tracking-tighter">Metas</Text>
            <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px] mt-1">Estratégia & Foco</Text>
          </View>
          <Pressable 
            onPress={() => setShowAddModal(true)}
            className="w-12 h-12 bg-violet-600 rounded-2xl items-center justify-center shadow-lg shadow-violet-600/20"
          >
            <Plus size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Recomendações Inteligentes */}
        <GoalRecommendations onContribution={(goal) => console.log('Aporte:', goal)} />

        <View className="mb-6 px-1">
          <Text className="text-white/60 text-[10px] font-black uppercase tracking-[3px]">Seus Objetivos</Text>
        </View>

        {goals.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-20 h-20 bg-white/5 rounded-[32px] items-center justify-center border border-white/10 mb-6">
              <Target size={32} color="rgba(255,255,255,0.2)" />
            </View>
            <Text className="text-white font-black text-xl">Nenhuma meta ativa</Text>
            <Text className="text-white/40 text-center px-10 mt-2 font-bold">
              Defina seu primeiro objetivo para começar a visualizar o futuro do seu dinheiro.
            </Text>
            <Pressable 
              onPress={() => setShowAddModal(true)}
              className="mt-8 bg-violet-600 px-8 py-4 rounded-2xl"
            >
              <Text className="text-white font-black uppercase tracking-widest text-xs">Criar agora →</Text>
            </Pressable>
          </View>
        ) : (
          <View className="pb-20">
            {goals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onPress={() => console.log('Detalhes:', goal)}
                onContribution={() => console.log('Aporte:', goal)}
              />
            ))}

            <Pressable 
              onPress={() => setShowAddModal(true)}
              className="mt-4 p-8 border-2 border-dashed border-white/5 rounded-[40px] items-center justify-center"
            >
              <View className="w-14 h-14 rounded-full bg-white/5 items-center justify-center mb-4">
                <Plus size={28} color="rgba(255,255,255,0.1)" />
              </View>
              <Text className="text-white/20 font-black uppercase tracking-widest text-[10px]">Nova Meta</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {showAddModal && (
        <AddGoalModal 
          onClose={() => setShowAddModal(false)}
          onSave={async () => {
            setShowAddModal(false);
            refresh();
          }}
        />
      )}
    </ScreenContainer>
  );
}
