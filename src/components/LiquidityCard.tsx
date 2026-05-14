import React from 'react';
import { View, Text, Platform } from 'react-native';
import { formatCurrency } from '../utils/format';
import { Layers, TrendingUp, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

interface LiquidityCardProps {
  netLiquidityCents: number;
  totalAssetsCents: number;
  isCrisis?: boolean;
}

export default function LiquidityCard({ netLiquidityCents, totalAssetsCents, isCrisis }: LiquidityCardProps) {
  const isNegative = netLiquidityCents < 0;

  return (
    <MotiView 
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="w-full mb-8"
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        className="rounded-[40px] p-8 border border-white/10 overflow-hidden"
      >
        {/* Animated Accent Glow */}
        <View 
          className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full opacity-30 ${isNegative ? 'bg-rose-600' : 'bg-violet-600'}`} 
        />
        
        <View className="flex-row items-center justify-between mb-8">
          <View className="flex-row items-center gap-4">
            <View className={`w-12 h-12 rounded-[18px] items-center justify-center border ${isNegative ? 'bg-rose-500/20 border-rose-500/30' : 'bg-violet-500/20 border-violet-500/30'}`}>
              {isNegative ? (
                <AlertTriangle size={22} color="#fb7185" />
              ) : (
                <TrendingUp size={22} color="#8b5cf6" />
              )}
            </View>
            <View>
              <Text className="text-white/40 text-[10px] font-black uppercase tracking-[2px] mb-1">Patrimônio Consolidado</Text>
              <Text className="text-white text-xl font-black tracking-tighter">Liquidez Total</Text>
            </View>
          </View>
        </View>
        
        <View className="mb-8">
          <Text className={`text-5xl font-black tracking-tighter tabular-nums ${isNegative ? 'text-rose-400' : 'text-white'}`}>
            {formatCurrency(netLiquidityCents)}
          </Text>
        </View>
        
        <View className="flex-row items-center justify-between">
          <View className={`px-4 py-2 rounded-full border ${isNegative ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
            <Text className={`text-[9px] font-black uppercase tracking-[1px] ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isNegative ? 'Risco Detectado' : 'Fluxo Estável'}
            </Text>
          </View>
          
          <View className="items-end">
            <Text className="text-white/20 text-[9px] font-black uppercase tracking-[1px] mb-1">Ativos Brutos</Text>
            <Text className="text-white/60 font-bold text-xs">{formatCurrency(totalAssetsCents)}</Text>
          </View>
        </View>
      </LinearGradient>
    </MotiView>
  );
}
