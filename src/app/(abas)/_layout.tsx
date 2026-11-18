import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarraNavegacao, type AbaNavegacao } from '@/componentes';
import { espaco } from '@/tema/tema';

// As três abas do app. A chave é o nome do arquivo da tela dentro de (abas).
const ABAS: readonly AbaNavegacao<string>[] = [
  { chave: 'index', rotulo: 'Peladas', icone: 'bola' },
  { chave: 'historico', rotulo: 'Histórico', icone: 'historico' },
  { chave: 'ajustes', rotulo: 'Ajustes', icone: 'ajustes' },
];

type PropsBarra = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Troca a barra de abas padrão pela nossa barra em pílula, flutuando sobre o conteúdo. */
function BarraAbas({ state, navigateToTab }: PropsBarra) {
  const insets = useSafeAreaInsets();
  const ativa = state.routes[state.index]?.name ?? 'index';
  // A navegação identifica cada aba por uma chave interna; aqui achamos a chave pelo nome do arquivo.
  const selecionar = (nome: string) => {
    const rota = state.routes.find((r) => r.name === nome);
    if (rota) navigateToTab(rota.key);
  };
  return (
    <View pointerEvents="box-none" style={[styles.flutuante, { bottom: insets.bottom + espaco.lg }]}>
      <BarraNavegacao abas={ABAS} ativa={ativa} onSelecionar={selecionar} />
    </View>
  );
}

/**
 * O grupo "(abas)" fica entre parênteses para não aparecer no endereço das telas:
 * a tela inicial continua sendo "/", e não "/abas".
 */
export default function LayoutAbas() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BarraAbas {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Peladas' }} />
      <Tabs.Screen name="historico" options={{ title: 'Histórico' }} />
      <Tabs.Screen name="ajustes" options={{ title: 'Ajustes' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  flutuante: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
});
