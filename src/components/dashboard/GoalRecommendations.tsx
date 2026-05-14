import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Sparkles, ArrowRight, Wallet, Target, Lock } from 'lucide-react-native';
import { MotiView } from 'moti';
import { formatCurrency } from '../../utils/format';
import { useFinancialAnalysis } from '../../hooks/useFinancialAnalysis';

interface GoalRecommendationsProps {
  onContribution: (goal: any) => void;
}

export default function GoalRecommendations({ onContribution }: GoalRecommendationsProps) {
  const { analysis } = useFinancialAnalysis();
  
  if (!analysis?.goalProjections || analysis.goalProjections.length === 0) {
    return null;
  }

  return (
    <View className="mb-10">
      <View className="flex-row items-center justify-between mb-6 px-1">
        <View className="flex-row items-center gap-2">
          <Sparkles size={14} color="#a78bfa" />
          <Text className="text-[10px] font-black uppercase tracking-[3px] text-white/50">Estratégia de Aporte</Text>
        </View>
        <View className={`flex-row items-center gap-2 px-3 py-1.5 rounded-full border ${
          (analysis.debtExit?.monthlySurplus || 0) > 0 
            ? 'bg-emerald-500/10 border-emerald-500/20' 
            : 'bg-red-500/10 border-red-500/20'
        }`}>
          <Wallet size={10} color={(analysis.debtExit?.monthlySurplus || 0) > 0 ? '#34d399' : '#f87171'} />
          <Text className={`text-[9px] font-black uppercase tracking-wider ${
            (analysis.debtExit?.monthlySurplus || 0) > 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            Sobra: {formatCurrency(analysis.debtExit?.monthlySurplus || 0)}
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {analysis.goalProjections.map((rec: any, idx: number) => (
          <MotiView
            key={rec.goalId}
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: idx * 100 }}
            style={{ width: 280, marginRight: 16 }}
          >
            <Pressable
              onPress={() => rec.canFocusNow && onContribution({ id: rec.goalId, name: rec.goalName })}
              disabled={!rec.canFocusNow}
              className={`bg-white/[0.03] border border-white/5 rounded-[32px] p-5 h-[200px] justify-between ${
                !rec.canFocusNow ? 'opacity-60' : ''
              }`}
            >
              <View>
                <View className="flex-row items-center justify-between mb-4">
                  <View className={`w-10 h-10 rounded-2xl items-center justify-center border ${
                    rec.canFocusNow ? 'bg-violet-500/10 border-violet-500/20' : 'bg-white/5 border-white/5'
                  }`}>
                    {rec.canFocusNow ? (
                      <Target size={18} color="#a78bfa" />
                    ) : (
                      <Lock size={18} color="rgba(255,255,255,0.2)" />
                    )}
                  </View>
                  
                  <View className="items-end">
                    <Text className="text-[8px] font-black uppercase tracking-tighter text-white/40 mb-0.5">Início Estimado</Text>
                    <Text className={`text-[10px] font-black uppercase ${
                      rec.canFocusNow ? 'text-emerald-400' : 'text-white/60'
                    }`}>
                      {rec.canFocusNow ? "AGORA" : rec.focusDate.toLocaleDateString("pt-BR", { month: 'short', year: '2-digit' })}
                    </Text>
                  </View>
                </View>
                
                <Text className="text-base font-black text-white" numberOfLines={1}>
                  {rec.goalName}
                </Text>

                <Text className={`mt-1 text-[10px] leading-relaxed ${
                  rec.canFocusNow ? 'text-white/40 font-bold' : 'text-amber-400/60 font-black'
                }`} numberOfLines={2}>
                  {rec.reasoning}
                </Text>
              </View>
              
              <View className="flex-row items-end justify-between mt-4">
                <View>
                  <Text className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">
                    {rec.canFocusNow ? "Aporte Sugerido" : "Pronto em"}
                  </Text>
                  <Text className="text-xl font-black text-white">
                    {rec.canFocusNow 
                      ? formatCurrency(rec.recommendedAmountCents) 
                      : rec.completionDate.toLocaleDateString("pt-BR", { month: 'short', year: '2-digit' })
                    }
                  </Text>
                </View>
                
                {rec.canFocusNow && (
                  <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10">
                    <ArrowRight size={16} color="rgba(255,255,255,0.4)" />
                  </View>
                )}
              </View>
            </Pressable>
          </MotiView>
        ))}
      </ScrollView>
    </View>
  );
}
