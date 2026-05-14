import { Tabs } from 'expo-router';
import { View, Platform, Pressable } from 'react-native';
import { LayoutDashboard, History, Wallet, Zap, User, Plus, Target, PieChart } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import AddTransactionModal from '../../src/components/AddTransactionModal';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';


export default function TabsLayout() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 24 : 16,
            left: 16,
            right: 16,
            height: 64,
            borderRadius: 32,
            backgroundColor: 'rgba(10, 10, 10, 0.8)',
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            elevation: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            paddingBottom: 0,
          },
          tabBarActiveTintColor: '#8b5cf6',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
          tabBarShowLabel: false,
          tabBarBackground: () => (
            Platform.OS === 'ios' ? (
              <BlurView intensity={20} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 32 }} />
            ) : (
              <View className="absolute inset-0 bg-[#0a0a0a]/80" style={{ borderRadius: 32 }} />
            )
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ color, size }) => (
              <LayoutDashboard size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Extrato',
            tabBarIcon: ({ color, size }) => (
              <History size={24} color={color} />
            ),
          }}
        />
        
        {/* BOTÃO CENTRAL DE ADICIONAR (ESTILO WEB) */}
        <Tabs.Screen
          name="plus"
          options={{
            tabBarButton: ({ style, ref, ...props }) => (
              <Pressable
                {...props}
                style={style as any}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setShowAddModal(true);
                }}
                className="items-center justify-center -mt-10"
              >
                <LinearGradient
                  colors={['#8b5cf6', '#d946ef']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-14 h-14 rounded-2xl items-center justify-center shadow-xl shadow-violet-600/40 border-4 border-[#050505]"
                >
                  <Plus size={28} color="#fff" />
                </LinearGradient>
              </Pressable>
            ),
          }}
        />


        <Tabs.Screen
          name="accounts"
          options={{
            title: 'Patrimônio',
            tabBarIcon: ({ color, size }) => (
              <Wallet size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: 'Objetivos',
            tabBarIcon: ({ color, size }) => (
              <Target size={24} color={color} />
            ),
          }}
        />

        {/* Telas que ficam no grupo (tabs) mas não aparecem no rodapé */}
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="recurring" options={{ href: null }} />
        <Tabs.Screen name="reports" options={{ href: null }} />
        <Tabs.Screen name="categories" options={{ href: null }} />
        <Tabs.Screen name="analytics" options={{ href: null }} />
      </Tabs>


      {/* Modal Global de Transação */}
      {showAddModal && (
        <AddTransactionModal 
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            // O refresh deve ser disparado por eventos ou context se necessário, 
            // mas o modal já lida com a persistência.
          }}
        />
      )}
    </>
  );
}
