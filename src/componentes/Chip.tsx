import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, raio } from '@/tema/tema';

import { Icone, type NomeIcone } from './Icone';

interface Props {
  rotulo: string;
  /** Selecionado fica preto (como "Todos 22" nos filtros). */
  ativo?: boolean;
  icone?: NomeIcone;
  /** Sem onPress o chip é só informativo ("Futsal", "22 jogadores"). */
  onPress?: () => void;
}

/** Pílula com contorno: resumo no topo das telas e filtros de lista. */
export function Chip({ rotulo, ativo, icone, onPress }: Props) {
  const corTexto = ativo ? cores.textoInverso : cores.texto;
  const conteudo = (
    <View style={[styles.base, ativo ? styles.ativo : styles.inativo]}>
      {icone ? <Icone nome={icone} tamanho={14} cor={corTexto} /> : null}
      <Text style={[styles.texto, { color: corTexto, fontWeight: ativo ? '600' : '500' }]}>{rotulo}</Text>
    </View>
  );

  if (!onPress) return conteudo;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!ativo }}
      hitSlop={6}
      style={({ pressed }) => pressed && { opacity: 0.7 }}
    >
      {conteudo}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: espaco.md,
    borderRadius: raio.pilula,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  inativo: { borderColor: cores.borda, backgroundColor: cores.fundo },
  ativo: { borderColor: cores.texto, backgroundColor: cores.texto },
  texto: { fontSize: 13 },
});
