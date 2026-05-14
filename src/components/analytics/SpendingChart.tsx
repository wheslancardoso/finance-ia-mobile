import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { formatCurrency } from '../../utils/format';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SpendingPoint {
  day: string;
  value: number;
}

export default function SpendingChart({ data }: { data: SpendingPoint[] }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min;
  const safeRange = range === 0 ? 100 : range;

  const chartWidth = SCREEN_WIDTH - 48;
  const chartHeight = 150;
  const padding = 20;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = (chartHeight - padding * 2) - ((d.value - min) / safeRange) * (chartHeight - padding * 2) + padding;
    return { x, y };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const areaPath = `${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <View className="w-full bg-white/[0.03] border border-white/10 rounded-[40px] p-8 mb-8">
      <View className="mb-6">
        <Text className="text-[10px] font-black uppercase tracking-[3px] text-white/40">Gasto Diário (Semana)</Text>
      </View>

      <View style={{ height: chartHeight + 30 }}>
        <Svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
          <Defs>
            <LinearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#7C3AED" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          <Path d={areaPath} fill="url(#spendingGradient)" />
          
          <Path
            d={linePath}
            fill="none"
            stroke="#A78BFA"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#fff"
            />
          ))}
        </Svg>

        <View className="flex-row justify-between mt-6 px-1">
          {data.map((d, i) => (
            <Text key={i} className="text-[9px] font-black text-white/20 uppercase tracking-tighter">
              {d.day}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
