import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, raio, texto } from '@/tema/tema';

import { Icone, type NomeIcone } from './Icone';

/** Indicador de carregamento centralizado. */
export function Carregando() {
  return (
    <View style={styles.centro}>
      <ActivityIndicator color={cores.primaria} size="large" />
    </View>
  );
}

interface EstadoVazioProps {
  icone: NomeIcone;
  titulo: string;
  mensagem: string;
  /** Normalmente um Botao com a ação que resolve o vazio ("Criar pelada"). */
  acao?: ReactNode;
}

/** O que aparece quando uma lista ainda não tem nada: explica e oferece o próximo passo. */
export function EstadoVazio({ icone, titulo, mensagem, acao }: EstadoVazioProps) {
  return (
    <View style={styles.vazio}>
      <View style={styles.circulo}>
        <Icone nome={icone} tamanho={30} cor={cores.primaria} />
      </View>
      <Text style={[texto.tituloSecao, styles.centralizado]}>{titulo}</Text>
      <Text style={[texto.apoio, styles.centralizado]}>{mensagem}</Text>
      {acao ? <View style={styles.acao}>{acao}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { paddingVertical: 80, alignItems: 'center' },
  vazio: { alignItems: 'center', gap: espaco.sm, paddingVertical: espaco.xxxl, paddingHorizontal: espaco.lg },
  circulo: {
    width: 64,
    height: 64,
    borderRadius: raio.pilula,
    backgroundColor: cores.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaco.sm,
  },
  centralizado: { textAlign: 'center' },
  acao: { alignSelf: 'stretch', marginTop: espaco.lg },
});
