import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, SafeAreaView, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, DollarSign, Wallet, LogOut, ShieldCheck, ChevronRight, MessageSquare, Phone, Zap, Palette, Target, PieChart } from 'lucide-react-native';
import { useProfile } from '../../src/hooks/useProfile';
import { supabase } from '../../src/lib/supabase';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loading, updateProfile } = useProfile();
  
  const [income, setIncome] = useState('');
  const [fixedExpenses, setFixedExpenses] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setIncome((profile.monthly_income_cents / 100).toString());
      setFixedExpenses((profile.fixed_expenses_cents / 100).toString());
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await updateProfile({
        monthly_income_cents: Math.round(parseFloat(income.replace(',', '.')) * 100) || 0,
        fixed_expenses_cents: Math.round(parseFloat(fixedExpenses.replace(',', '.')) * 100) || 0,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await supabase.auth.signOut();
    router.replace('/'); 
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#050505] items-center justify-center">
        <ActivityIndicator color="#8b5cf6" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#050505]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Premium Header */}
        <View className="px-6 py-8 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Pressable 
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl items-center justify-center mr-4"
            >
              <ChevronLeft color="#fff" size={20} />
            </Pressable>
            <View>
              <Text className="text-violet-500 text-[10px] font-black uppercase tracking-[3px] mb-1">Centro de Comando</Text>
              <Text className="text-white text-2xl font-black tracking-tighter">Configurações</Text>
            </View>
          </View>
          <View className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl items-center justify-center">
            <User color="rgba(255,255,255,0.6)" size={20} />
          </View>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Profile Card - Glassy */}
          <MotiView 
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 mb-10 items-center overflow-hidden"
          >
            <View className="absolute -top-10 -left-10 w-40 h-40 bg-violet-600/10 blur-[60px] rounded-full" />
            
            <View className="w-24 h-24 bg-violet-600 rounded-[32px] items-center justify-center mb-6 shadow-2xl shadow-violet-600/40">
              <User color="#fff" size={40} />
            </View>
            <Text className="text-white text-2xl font-black tracking-tighter mb-2">{(profile as any)?.full_name || 'Seu Perfil'}</Text>
            <View className="flex-row items-center bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
              <ShieldCheck size={12} color="#34d399" className="mr-2" />
              <Text className="text-emerald-400 text-[9px] font-black uppercase tracking-[2px]">Usuário Verificado</Text>
            </View>
          </MotiView>

          {/* Form Section */}
          <View className="mb-10">
            <View className="flex-row items-center justify-between mb-8 px-1">
              <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">Parâmetros Financeiros</Text>
              <View className="h-[1px] flex-1 bg-white/5 ml-4" />
            </View>

            <View className="space-y-6">
              <View>
                <Text className="text-white/20 text-[9px] font-black uppercase tracking-[2px] mb-3 px-1">Renda Mensal Sugerida</Text>
                <View className="flex-row items-center bg-white/[0.03] border border-white/10 rounded-[24px] px-6 py-5">
                  <DollarSign size={20} color="#8b5cf6" className="mr-4" />
                  <TextInput
                    className="flex-1 text-white text-xl font-black tabular-nums"
                    placeholder="0,00"
                    placeholderTextColor="rgba(255,255,255,0.1)"
                    keyboardType="numeric"
                    value={income}
                    onChangeText={setIncome}
                  />
                </View>
              </View>

              <View>
                <Text className="text-white/20 text-[9px] font-black uppercase tracking-[2px] mb-3 px-1">Gastos Fixos Estimados</Text>
                <View className="flex-row items-center bg-white/[0.03] border border-white/10 rounded-[24px] px-6 py-5">
                  <Wallet size={20} color="#8b5cf6" className="mr-4" />
                  <TextInput
                    className="flex-1 text-white text-xl font-black tabular-nums"
                    placeholder="0,00"
                    placeholderTextColor="rgba(255,255,255,0.1)"
                    keyboardType="numeric"
                    value={fixedExpenses}
                    onChangeText={setFixedExpenses}
                  />
                </View>
              </View>

              <Pressable 
                onPress={handleSave}
                disabled={saving}
                className="bg-violet-600 w-full py-6 rounded-[24px] items-center shadow-xl shadow-violet-600/30"
              >
                <Text className="text-white font-black uppercase tracking-[3px] text-xs">
                  {saving ? 'Sincronizando...' : 'Atualizar Parâmetros'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* WhatsApp Section */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            className="mb-10"
          >
            <View className="flex-row items-center justify-between mb-8 px-1">
              <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">Protocolo WhatsApp</Text>
              <View className="h-[1px] flex-1 bg-white/5 ml-4" />
            </View>

            <View className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 overflow-hidden">
              <View className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full" />
              
              <Text className="text-white/30 text-[10px] font-bold mb-6 leading-relaxed">Comande o Vesper via mensagens de voz ou texto.</Text>
              <View className="bg-white/5 border border-white/10 rounded-[20px] px-5 py-4 flex-row items-center mb-6">
                <Phone size={18} color="#10b981" className="mr-4" />
                <TextInput
                  className="flex-1 text-white font-black text-base"
                  placeholder="5511999999999"
                  placeholderTextColor="rgba(255,255,255,0.1)"
                  keyboardType="numeric"
                  value={profile?.whatsapp_number || ''}
                  onChangeText={(val) => updateProfile({ whatsapp_number: val.replace(/\D/g, '') })}
                />
              </View>
              <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex-row items-center">
                <Zap size={14} color="#34d399" className="mr-3" />
                <Text className="text-emerald-400 text-[9px] font-black uppercase tracking-[1px]">Número sincronizado e ativo</Text>
              </View>
            </View>
          </MotiView>

          {/* Preferences Section */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            className="mb-12"
          >
            <View className="flex-row items-center justify-between mb-8 px-1">
              <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">Preferências do App</Text>
              <View className="h-[1px] flex-1 bg-white/5 ml-4" />
            </View>

            <View className="space-y-4">
              <Pressable 
                onPress={() => router.push('/goals' as any)}
                className="bg-white/[0.03] border border-white/10 rounded-[28px] p-6 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center mr-4">
                    <Target size={18} color="#10b981" />
                  </View>
                  <View>
                    <Text className="text-white font-bold text-sm">Metas Financeiras</Text>
                    <Text className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-0.5">Gestão de Objetivos</Text>
                  </View>
                </View>
                <ChevronRight color="rgba(255,255,255,0.2)" size={20} />
              </Pressable>

              <Pressable 
                onPress={() => router.push('/reports' as any)}
                className="bg-white/[0.03] border border-white/10 rounded-[28px] p-6 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-xl bg-amber-500/10 items-center justify-center mr-4">
                    <PieChart size={18} color="#f59e0b" />
                  </View>
                  <View>
                    <Text className="text-white font-bold text-sm">Relatórios e Gráficos</Text>
                    <Text className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-0.5">Análise de Desempenho</Text>
                  </View>
                </View>
                <ChevronRight color="rgba(255,255,255,0.2)" size={20} />
              </Pressable>

              <Pressable 
                onPress={() => router.push('/recurring' as any)}
                className="bg-white/[0.03] border border-white/10 rounded-[28px] p-6 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-xl bg-violet-500/10 items-center justify-center mr-4">
                    <Zap size={18} color="#8b5cf6" />
                  </View>
                  <View>
                    <Text className="text-white font-bold text-sm">Fluxos Recorrentes</Text>
                    <Text className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-0.5">Assinaturas e Parcelas</Text>
                  </View>
                </View>
                <ChevronRight color="rgba(255,255,255,0.2)" size={20} />
              </Pressable>

              <Pressable 
                onPress={() => router.push('/categories' as any)}
                className="bg-white/[0.03] border border-white/10 rounded-[28px] p-6 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-xl bg-blue-500/10 items-center justify-center mr-4">
                    <Palette size={18} color="#3b82f6" />
                  </View>
                  <View>
                    <Text className="text-white font-bold text-sm">Categorias</Text>
                    <Text className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-0.5">Gerenciar Classificações</Text>
                  </View>
                </View>
                <ChevronRight color="rgba(255,255,255,0.2)" size={20} />
              </Pressable>
            </View>
          </MotiView>

          {/* Logout Button */}
          <Pressable 
            onPress={handleLogout}
            className="w-full py-6 rounded-[32px] border border-rose-500/20 bg-rose-500/5 items-center mb-12"
          >
            <View className="flex-row items-center">
              <LogOut size={16} color="#f43f5e" className="mr-3" />
              <Text className="text-rose-500 font-black uppercase text-[10px] tracking-[4px]">Encerrar Sessão</Text>
            </View>
          </Pressable>
          
          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
