import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Sparkles } from 'lucide-react-native';

interface SpendingSimulatorCardProps {
  onPress: () => void;
}

export default function SpendingSimulatorCard({ onPress }: SpendingSimulatorCardProps) {
  return (
    <Pressable 
      onPress={onPress}
      className="bg-violet-600/10 border border-violet-600/20 rounded-[32px] p-6 shadow-2xl flex-1"
    >
      <View className="flex-row items-center gap-4 mb-4">
        <View className="w-10 h-10 rounded-2xl bg-violet-600 items-center justify-center shadow-lg shadow-violet-600/40">
          <Sparkles size={20} color="#fff" />
        </View>
        <View>
          <Text className="text-white font-black text-xs uppercase tracking-widest">Simulador</Text>
          <Text className="text-[9px] text-violet-400 font-bold uppercase tracking-tighter mt-1">Impacto de Gastos</Text>
        </View>
      </View>
      
      <Text className="text-white/40 text-[10px] leading-relaxed font-bold">
        Simule como uma nova compra impacta seu teto de sobrevivência e saída de dívidas.
      </Text>
      
      <View className="mt-6 flex-row items-center justify-between">
        <Text className="text-violet-400 text-[10px] font-black uppercase tracking-widest">Simular agora →</Text>
      </View>
    </Pressable>
  );
}
