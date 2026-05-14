import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, Globe } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { supabase } from '../src/lib/supabase';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  async function handleAuth() {
    if (!email || !password) return;
    
    setLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setError("Verifique seu e-mail para confirmar a conta!");
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.replace('/');
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#050505]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Background Glow */}
          <View className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-600/10 blur-[100px] rounded-full" />

          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 1000 }}
            className="flex-1 justify-center py-12"
          >
            <View className="items-center mb-12">
              <View className="w-20 h-20 bg-white/5 rounded-[28px] border border-white/10 items-center justify-center mb-6 shadow-2xl shadow-black">
                <Sparkles size={32} color="#8b5cf6" />
              </View>
              <Text className="text-white text-4xl font-black tracking-tighter mb-2">
                Ves<Text className="text-violet-500">per</Text>
              </Text>
              <Text className="text-white/40 font-medium text-center">
                Seu fluxo financeiro, agora no bolso.
              </Text>
            </View>

            <View className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 shadow-2xl">
              {error && (
                <MotiView 
                  from={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-6"
                >
                  <Text className="text-red-400 text-xs font-bold text-center">{error}</Text>
                </MotiView>
              )}

              <View className="space-y-4">
                <View className="relative">
                  <View className="absolute left-4 top-4 z-10">
                    <Mail size={20} color="rgba(255,255,255,0.2)" />
                  </View>
                  <TextInput
                    placeholder="Seu e-mail"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className="bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-medium"
                  />
                </View>

                <View className="relative">
                  <View className="absolute left-4 top-4 z-10">
                    <Lock size={20} color="rgba(255,255,255,0.2)" />
                  </View>
                  <TextInput
                    placeholder="Sua senha"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    className="bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white font-medium"
                  />
                  <Pressable 
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4"
                  >
                    {showPassword ? <EyeOff size={20} color="rgba(255,255,255,0.2)" /> : <Eye size={20} color="rgba(255,255,255,0.2)" />}
                  </Pressable>
                </View>
              </View>

              <Pressable 
                onPress={handleAuth}
                disabled={loading}
                className={`mt-8 flex-row items-center justify-center py-5 rounded-3xl shadow-xl ${loading ? 'bg-violet-600/50' : 'bg-violet-600 shadow-violet-600/20'}`}
              >
                <Text className="text-white font-black uppercase tracking-widest mr-2">
                  {loading ? 'Entrando...' : isSignUp ? 'Criar Conta' : 'Entrar no Vesper'}
                </Text>
                {!loading && <ArrowRight size={18} color="#fff" />}
              </Pressable>

              <View className="mt-8 pt-8 border-t border-white/5 items-center">
                <Pressable onPress={() => setIsSignUp(!isSignUp)}>
                  <Text className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    {isSignUp ? 'Já tem conta? Faça Login' : 'Não tem conta? Começar Agora'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="mt-12 flex-row justify-center gap-4">
              <Pressable className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 items-center justify-center">
                <Globe size={24} color="rgba(255,255,255,0.4)" />
              </Pressable>
              <View className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 items-center justify-center opacity-30">
                <Text className="text-white font-black text-lg">G</Text>
              </View>
            </View>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
