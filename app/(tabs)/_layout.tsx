import { Tabs } from 'expo-router';
import { View, Platform, Pressable } from 'react-native';
import { LayoutDashboard, History, Wallet, Plus, Target, Settings } from 'lucide-react-native';
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
            height: 68,
            borderRadius: 34,
            backgroundColor: 'rgba(10, 10, 10, 0.95)',
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            elevation: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            // Centralização vertical dos ícones
            paddingTop: 0,
            paddingBottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarItemStyle: {
            // Força cada item a centralizar o ícone verticalmente
            height: 68,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 0,
            paddingBottom: 0,
          },
          tabBarActiveTintColor: '#8b5cf6',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.35)',
          tabBarShowLabel: false,
          tabBarBackground: () => (
            Platform.OS === 'ios' ? (
              <BlurView intensity={40} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 34 }} />
            ) : (
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 10, 10, 0.95)', borderRadius: 34 }} />
            )
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <LayoutDashboard size={22} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Extrato',
            tabBarIcon: ({ color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <History size={22} color={color} />
              </View>
            ),
          }}
        />
        
        {/* BOTÃO CENTRAL DE ADICIONAR */}
        <Tabs.Screen
          name="plus"
          options={{
            tabBarButton: ({ style }) => (
              <Pressable
                style={[style as any, { top: -14, justifyContent: 'center', alignItems: 'center' }]}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setShowAddModal(true);
                }}
              >
                <LinearGradient
                  colors={['#8b5cf6', '#d946ef']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 4,
                    borderColor: '#0a0a0a',
                  }}
                >
                  <Plus size={26} color="#fff" />
                </LinearGradient>
              </Pressable>
            ),
          }}
        />

        <Tabs.Screen
          name="goals"
          options={{
            title: 'Metas',
            tabBarIcon: ({ color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Target size={22} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Config',
            tabBarIcon: ({ color }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Settings size={22} color={color} />
              </View>
            ),
          }}
        />

        {/* Telas que ficam no grupo (tabs) mas não aparecem no rodapé */}
        <Tabs.Screen name="accounts" options={{ href: null }} />
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
          }}
        />
      )}
    </>
  );
}
