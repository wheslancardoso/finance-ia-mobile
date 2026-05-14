import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Sparkles, Calendar, Clock, Zap } from 'lucide-react-native';
import { format, addMonths, subMonths, isSameMonth, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface MonthNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function MonthNavigator({ selectedDate, onDateChange }: MonthNavigatorProps) {
  const today = startOfMonth(new Date());
  const isFuture = !isSameMonth(selectedDate, today);
  const isAtToday = isSameMonth(selectedDate, today);

  const monthOffset = React.useMemo(() => {
    const todayMo = startOfMonth(new Date());
    const targetMo = startOfMonth(selectedDate);
    return (targetMo.getFullYear() - todayMo.getFullYear()) * 12 + (targetMo.getMonth() - todayMo.getMonth());
  }, [selectedDate]);

  const handlePrev = () => {
    const prev = subMonths(selectedDate, 1);
    if (prev >= today) {
      onDateChange(prev);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = () => {
    onDateChange(addMonths(selectedDate, 1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleReset = () => {
    onDateChange(today);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View className="bg-white/[0.03] border border-white/10 rounded-[32px] p-5 shadow-2xl relative overflow-hidden h-full">
      {/* Background Glow */}
      <LinearGradient
        colors={[isFuture ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.1)', 'transparent']}
        style={{ position: 'absolute', top: -100, right: -100, width: 200, height: 200, borderRadius: 100 }}
      />

      <View className="relative z-10 flex flex-col gap-6">
        {/* Row 1: Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className={`w-8 h-8 rounded-xl items-center justify-center border ${
              isFuture ? 'bg-violet-500/10 border-violet-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
            }`}>
              {isFuture ? <Zap size={14} color="#a78bfa" /> : <Clock size={14} color="#34d399" />}
            </View>
            <View>
              <Text className="text-[9px] font-black text-white/30 uppercase tracking-[2px]">
                {isFuture ? "Projeção" : "Atual"}
              </Text>
              <Text className={`text-[10px] font-black uppercase tracking-widest ${
                isFuture ? 'text-violet-400' : 'text-emerald-400'
              }`}>
                Time Machine
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1 bg-black/30 border border-white/5 p-1 rounded-xl">
            <Pressable 
              onPress={handlePrev} 
              disabled={isAtToday}
              className={`p-2 rounded-lg ${isAtToday ? 'opacity-20' : ''}`}
            >
              <ChevronLeft size={16} color={isAtToday ? 'rgba(255,255,255,0.1)' : '#fff'} />
            </Pressable>
            <Pressable onPress={handleNext} className="p-2 rounded-lg">
              <ChevronRight size={16} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Row 2: Month Display */}
        <View className="flex-row items-center justify-between px-2">
          <View className="items-center opacity-30">
            <Text className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">
              {format(subMonths(selectedDate, 1), "MMM", { locale: ptBR })}
            </Text>
            <Text className="text-lg font-black text-white/30">{format(subMonths(selectedDate, 1), "yy")}</Text>
          </View>

          <View className="items-center">
            <View className={`px-5 py-3 rounded-2xl border ${
              isFuture ? 'bg-violet-500/10 border-violet-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
            }`}>
              <Text className={`text-2xl font-black capitalize leading-none ${
                isFuture ? 'text-violet-300' : 'text-emerald-300'
              }`}>
                {format(selectedDate, "MMM", { locale: ptBR })}
              </Text>
              <Text className={`text-[10px] font-black uppercase tracking-widest mt-1 text-center ${
                isFuture ? 'text-violet-400/60' : 'text-emerald-400/60'
              }`}>
                {format(selectedDate, "yyyy")}
              </Text>
            </View>
            {isFuture && (
              <Text className="text-[8px] font-black text-violet-400/40 uppercase tracking-widest mt-2">
                +{monthOffset} {monthOffset === 1 ? "mês" : "meses"}
              </Text>
            )}
          </View>

          <View className="items-center opacity-30">
            <Text className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">
              {format(addMonths(selectedDate, 1), "MMM", { locale: ptBR })}
            </Text>
            <Text className="text-lg font-black text-white/30">{format(addMonths(selectedDate, 1), "yy")}</Text>
          </View>
        </View>

        {/* Row 3: Shortcuts */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {!isAtToday && (
            <Pressable 
              onPress={handleReset}
              className="flex-row items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 mr-2"
            >
              <Clock size={12} color="rgba(255,255,255,0.4)" />
              <Text className="text-[9px] font-bold uppercase tracking-widest text-white/40">Hoje</Text>
            </Pressable>
          )}
          <Pressable 
            onPress={() => onDateChange(addMonths(today, 6))}
            className={`flex-row items-center gap-2 px-3 py-2 rounded-lg border mr-2 ${
              isSameMonth(selectedDate, addMonths(today, 6)) ? 'bg-violet-600 border-violet-600' : 'bg-white/5 border-white/5'
            }`}
          >
            <Calendar size={12} color="#fff" />
            <Text className="text-[9px] font-bold uppercase tracking-widest text-white">6 Meses</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}
