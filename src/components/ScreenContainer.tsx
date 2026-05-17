import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

interface ScreenContainerProps {
  children: React.ReactNode;
  /** Padding extra além do safe area inset (default: 16) */
  extraTopPadding?: number;
}

/**
 * Contêiner raiz de todas as telas do app.
 *
 * Usa uma combinação de useSafeAreaInsets() e Constants.statusBarHeight
 * para garantir padding superior correto em TODOS os cenários:
 * - Dev Build com SafeAreaProvider funcional → insets.top > 0
 * - Expo Go no Android onde insets.top === 0 → fallback para statusBarHeight
 * - iOS com notch → insets.top retorna o valor correto nativamente
 */
export default function ScreenContainer({
  children,
  extraTopPadding = 16,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  // No Android, o insets.top pode retornar 0 dentro do Expo Go.
  // Constants.statusBarHeight é a fonte mais confiável nesse caso.
  const statusBarFallback = Platform.OS === 'android'
    ? (Constants.statusBarHeight ?? 24)
    : 0;

  const topPadding = Math.max(insets.top, statusBarFallback) + extraTopPadding;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
});
