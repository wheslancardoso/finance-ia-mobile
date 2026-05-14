import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, Globe, ShieldCheck } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

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
      {/* Premium Background Effects */}
      <View className="absolute inset-0 overflow-hidden">
        <MotiView
          from={{ translateX: -100, translateY: -100, opacity: 0.3 }}
          animate={{ translateX: 0, translateY: 0, opacity: 0.5 }}
          transition={{ type: 'timing', duration: 4000, loop: true, repeatReverse: true }}
          className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-violet-600/20 blur-[100px] rounded-full"
        />
        <MotiView
          from={{ translateX: 100, translateY: 100, opacity: 0.2 }}
          animate={{ translateX: 0, translateY: 0, opacity: 0.4 }}
          transition={{ type: 'timing', duration: 5000, loop: true, repeatReverse: true }}
          className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full"
        />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center py-12">
            {/* Logo Section */}
            <MotiView 
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="items-center mb-16"
            >
              <View className="w-24 h-24 bg-white/5 rounded-[32px] border border-white/10 items-center justify-center mb-8 shadow-2xl">
                <LinearGradient
                  colors={['#8b5cf6', '#6d28d9']}
                  className="w-16 h-16 rounded-2xl items-center justify-center"
                >
                  <Sparkles size={32} color="#fff" />
                </LinearGradient>
              </View>
              <Text className="text-white text-5xl font-black tracking-tighter mb-3">
                Ves<Text className="text-violet-500">per</Text>
              </Text>
              <View className="flex-row items-center bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                <ShieldCheck size={12} color="rgba(255,255,255,0.4)" className="mr-2" />
                <Text className="text-white/40 text-[9px] font-black uppercase tracking-[3px]">
                  Engine Financeira Avançada
                </Text>
              </View>
            </MotiView>

            {/* Auth Card */}
            <MotiView 
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200, type: 'timing', duration: 800 }}
              className="bg-white/[0.03] border border-white/10 rounded-[48px] p-8 shadow-2xl overflow-hidden"
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.02)', 'transparent']}
                className="absolute inset-0"
              />

              {error && (
                <MotiView 
                  from={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl mb-8"
                >
                  <Text className="text-red-400 text-xs font-bold text-center">{error}</Text>
                </MotiView>
              )}

              <View className="space-y-6">
                <View>
                  <Text className="text-white/20 text-[9px] font-black uppercase tracking-[3px] mb-3 px-1">Seu E-mail</Text>
                  <View className="relative">
                    <View className="absolute left-5 top-5 z-10">
                      <Mail size={18} color="rgba(255,255,255,0.2)" />
                    </View>
                    <TextInput
                      placeholder="email@exemplo.com"
                      placeholderTextColor="rgba(255,255,255,0.1)"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      className="bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-white font-bold text-base"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-white/20 text-[9px] font-black uppercase tracking-[3px] mb-3 px-1">Sua Senha</Text>
                  <View className="relative">
                    <View className="absolute left-5 top-5 z-10">
                      <Lock size={18} color="rgba(255,255,255,0.2)" />
                    </View>
                    <TextInput
                      placeholder="••••••••"
                      placeholderTextColor="rgba(255,255,255,0.1)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      className="bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-14 text-white font-bold text-base"
                    />
                    <Pressable 
                      onPress={() => {
                        setShowPassword(!showPassword);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      className="absolute right-5 top-5"
                    >
                      {showPassword ? <EyeOff size={18} color="rgba(255,255,255,0.2)" /> : <Eye size={18} color="rgba(255,255,255,0.2)" />}
                    </Pressable>
                  </View>
                </View>
              </View>

              <Pressable 
                onPress={handleAuth}
                disabled={loading}
                className={`mt-10 py-6 rounded-[32px] overflow-hidden shadow-2xl ${loading ? 'opacity-50' : ''}`}
              >
                <LinearGradient
                  colors={['#8b5cf6', '#6d28d9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="absolute inset-0"
                />
                <View className="flex-row items-center justify-center">
                  <Text className="text-white font-black uppercase tracking-[4px] text-xs mr-3">
                    {loading ? 'Sincronizando...' : isSignUp ? 'Criar Acesso' : 'Entrar no Vesper'}
                  </Text>
                  {!loading && <ArrowRight size={18} color="#fff" />}
                </View>
              </Pressable>

              <View className="mt-10 pt-8 border-t border-white/5 items-center">
                <Pressable 
                  onPress={() => {
                    setIsSignUp(!isSignUp);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text className="text-white/40 text-[10px] font-black uppercase tracking-[4px]">
                    {isSignUp ? 'Já tem conta? Login' : 'Novo por aqui? Criar Conta'}
                  </Text>
                </Pressable>
              </View>
            </MotiView>

            {/* Social Auth Footer */}
            <MotiView 
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 600 }}
              className="mt-12 flex-row justify-center gap-6"
            >
              <Pressable className="w-16 h-16 bg-white/5 rounded-3xl border border-white/10 items-center justify-center">
                <Globe size={24} color="rgba(255,255,255,0.4)" />
              </Pressable>
              <Pressable className="w-16 h-16 bg-white/5 rounded-3xl border border-white/10 items-center justify-center">
                <View className="bg-white/10 w-8 h-8 rounded-full items-center justify-center">
                  <Text className="text-white font-black text-sm">G</Text>
                </View>
              </Pressable>
            </MotiView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
