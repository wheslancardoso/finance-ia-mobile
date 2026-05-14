import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { MotiView } from 'moti';
import { formatCurrency } from '../../utils/format';

interface IncomeMixItem {
  name: string;
  value: number;
}

export default function IncomeMixChart({ data }: { data: IncomeMixItem[] }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B"];
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <View className="items-center bg-white/[0.03] border border-white/10 rounded-[40px] p-8 mb-8">
      <View className="w-full mb-6">
        <Text className="text-[10px] font-black uppercase tracking-[3px] text-white/40">Mix de Receitas</Text>
      </View>

      <View className="relative w-48 h-48 items-center justify-center">
        <Svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {data.map((item, i) => {
            const percent = (item.value / total) * 100;
            const dashOffset = circumference - (percent / 100) * circumference;
            const rotation = (cumulativePercent / 100) * 360;
            cumulativePercent += percent;

            return (
              <G key={item.name} rotation={rotation} origin="50, 50">
                <Circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={colors[i % colors.length]}
                  strokeWidth="10"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              </G>
            );
          })}
        </Svg>
        
        <View className="absolute items-center justify-center">
          <Text className="text-[8px] font-black uppercase tracking-widest text-white/20">Total</Text>
          <Text className="text-xl font-black text-white">{formatCurrency(total * 100)}</Text>
        </View>
      </View>

      <View className="mt-10 flex-row flex-wrap justify-between w-full">
        {data.map((item, i) => (
          <View key={item.name} className="flex-row items-center gap-3 mb-4" style={{ width: '45%' }}>
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
            <View>
              <Text className="text-[9px] font-black text-white/40 uppercase tracking-tighter" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-xs font-black text-white">{Math.round((item.value / total) * 100)}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
