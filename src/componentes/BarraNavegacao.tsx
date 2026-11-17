import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, raio, sombra } from '@/tema/tema';

import { Icone, type NomeIcone } from './Icone';

export interface AbaNavegacao<T extends string> {
  chave: T;
  rotulo: string;
  icone: NomeIcone;
}

interface Props<T extends string> {
  abas: readonly AbaNavegacao<T>[];
  ativa: T;
  onSelecionar: (chave: T) => void;
}

/** Barra flutuante em formato de pílula, inspirada no OpenTable (Peladas, Histórico, Ajustes). */
export function BarraNavegacao<T extends string>({ abas, ativa, onSelecionar }: Props<T>) {
  return (
    <View style={styles.barra} accessibilityRole="tablist">
      {abas.map((aba) => {
        const selecionada = aba.chave === ativa;
        const cor = selecionada ? cores.primaria : cores.textoMedio;
        return (
          <Pressable
            key={aba.chave}
            onPress={() => onSelecionar(aba.chave)}
            accessibilityRole="tab"
            accessibilityState={{ selected: selecionada }}
            accessibilityLabel={aba.rotulo}
            style={[styles.aba, selecionada && styles.abaAtiva]}
          >
            <Icone nome={aba.icone} tamanho={20} cor={cor} />
            <Text style={[styles.rotulo, { color: cor, fontWeight: selecionada ? '600' : '500' }]}>{aba.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    gap: 4,
    padding: 6,
    backgroundColor: cores.fundo,
    borderRadius: raio.pilula,
    ...sombra.flutuante,
  },
  aba: { width: 84, paddingVertical: 8, borderRadius: raio.pilula, alignItems: 'center', gap: 2 },
  abaAtiva: { backgroundColor: cores.primariaSuave },
  rotulo: { fontSize: 11 },
});
