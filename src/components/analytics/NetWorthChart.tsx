import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Polyline, Circle, Line } from 'react-native-svg';
import { MotiView } from 'moti';
import { formatCurrency } from '../../utils/format';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DataPoint {
  month: string;
  amount: number;
}

export default function NetWorthChart({ data }: { data: DataPoint[] }) {
  if (!data || data.length === 0) return null;

  const amounts = data.map(d => d.amount);
  const max = Math.max(...amounts, 0);
  const min = Math.min(...amounts, 0);
  const range = max - min;
  const safeRange = range === 0 ? 100 : range;
  const padding = safeRange * 0.15;
  
  const chartMax = max + padding;
  const chartMin = min - padding;
  const chartRange = chartMax - chartMin;

  const chartWidth = SCREEN_WIDTH - 48;
  const chartHeight = 200;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((d.amount - chartMin) / chartRange) * chartHeight;
    return { x, y };
  });

  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');
  const zeroY = chartHeight - ((0 - chartMin) / chartRange) * chartHeight;

  const areaPath = `M 0,${zeroY} ${points.map(p => `L ${p.x},${p.y}`).join(' ')} L ${chartWidth},${zeroY} Z`;

  return (
    <View className="w-full mb-10">
      <View className="flex-row items-end justify-between mb-8 px-1">
        <View>
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-white/20 mb-1">Patrimônio Atual</Text>
          <Text className="text-4xl font-black text-white tracking-tighter">
            {formatCurrency(data[data.length - 1].amount * 100)}
          </Text>
        </View>
        <View className="bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <Text className="text-emerald-400 font-black text-[10px]">+12.4%</Text>
        </View>
      </View>

      <View style={{ height: chartHeight + 40 }}>
        <Svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
          <Defs>
            <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
            <Line
              key={i}
              x1="0"
              y1={chartHeight * p}
              x2={chartWidth}
              y2={chartHeight * p}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}

          {/* Area */}
          <Path d={areaPath} fill="url(#chartGradient)" />

          {/* Zero Line */}
          <Line
            x1="0"
            y1={zeroY}
            x2={chartWidth}
            y2={zeroY}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />

          {/* Main Line */}
          <Polyline
            points={pointsString}
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots */}
          {points.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#8B5CF6"
              stroke="#fff"
              strokeWidth="2"
            />
          ))}
        </Svg>

        {/* Labels */}
        <View className="flex-row justify-between mt-6 px-1">
          {data.map((d, i) => (
            <Text key={i} className="text-[9px] font-black text-white/20 uppercase tracking-tighter">
              {d.month}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
