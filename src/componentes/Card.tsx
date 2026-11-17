import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { cores, espaco, raio, sombra } from '@/tema/tema';

/** Caixa branca com borda suave, cantos de 16 e uma sombra leve (cards de time, próximo jogo, restrições). */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.fundo,
    borderWidth: 1,
    borderColor: cores.bordaSuave,
    borderRadius: raio.xl,
    padding: espaco.lg,
    ...sombra.card,
  },
});
