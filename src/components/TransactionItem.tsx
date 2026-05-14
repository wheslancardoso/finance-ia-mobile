import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, EllipsisVertical, Trash2 } from 'lucide-react-native';
import { MotiView } from 'moti';
import Svg, { Path } from 'react-native-svg';
import Animated, { useAnimatedProps, withSpring } from 'react-native-reanimated';
import { formatCurrency } from '../utils/format';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface TransactionItemProps {
  description: string;
  amount: number;
  date: string;
  category: string;
  account: string;
  isPaid: boolean;
  onTogglePaid: () => void;
  onDelete?: () => void;
  onPress?: () => void;
}

export default function TransactionItem({
  description,
  amount,
  date,
  category,
  account,
  isPaid,
  onTogglePaid,
  onDelete,
  onPress,
}: TransactionItemProps) {
  const isNegative = amount < 0;

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: withSpring(isPaid ? 0 : 30),
    };
  });

  return (
    <MotiView 
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="relative w-full bg-white/[0.03] border border-white/10 rounded-[32px] mb-3 overflow-hidden shadow-2xl"
    >
      <View className="flex-row items-center justify-between p-5">
        <Pressable 
          onPress={onPress}
          className="flex-row items-center gap-4 flex-1"
        >
          {/* Icon with Glow */}
          <View className={`w-12 h-12 rounded-2xl items-center justify-center border ${isNegative ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
            {isNegative ? (
              <ArrowDownLeft size={20} color="#f87171" />
            ) : (
              <ArrowUpRight size={20} color="#34d399" />
            )}
          </View>

          <View className="flex-1">
            <Text className="text-white font-bold text-base truncate" numberOfLines={1}>
              {description}
            </Text>
            <View className="flex-row items-center gap-2 mt-1.5">
              <View className="px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5">
                <Text className="text-white/40 text-[8px] font-black uppercase tracking-widest">
                  {category}
                </Text>
              </View>
              <Text className="text-white/20 text-[10px] font-black uppercase tracking-widest">
                • {account}
              </Text>
            </View>
          </View>
        </Pressable>

        <View className="flex-row items-center gap-4 ml-4">
          <View className="items-end">
            <Text className={`text-base font-black tabular-nums ${isNegative ? 'text-white' : 'text-emerald-400'}`}>
              {isNegative ? '' : '+'}{formatCurrency(amount)}
            </Text>
            <Text className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-1">{date}</Text>
          </View>

          {/* Premium Circle Check */}
          <Pressable 
            onPress={onTogglePaid}
            className={`w-10 h-10 rounded-full items-center justify-center border-2 transition-all ${isPaid ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/40' : 'bg-white/5 border-white/10'}`}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <AnimatedPath
                d="M20 6 9 17l-5-5"
                stroke={isPaid ? "#050505" : "transparent"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="30"
                animatedProps={animatedProps}
              />
            </Svg>
          </Pressable>
        </View>
      </View>
      
      {/* Absolute Action Menu dot */}
      <View className="absolute top-2 right-2">
        <EllipsisVertical size={16} color="rgba(255,255,255,0.2)" />
      </View>
    </MotiView>
  );
}
