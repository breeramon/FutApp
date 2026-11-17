import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, raio } from '@/tema/tema';

import { Icone } from './Icone';

/**
 * Caixa de mensagem com ícone.
 * - info: cinza, explicação neutra ("Futsal tem 5 por time...")
 * - alerta: laranja, algo que o organizador precisa saber ("Time D ficou com 4 de 5")
 * - sucesso: verde ("17 nomes reconhecidos")
 */
export type TomAviso = 'info' | 'alerta' | 'sucesso';

const TONS = {
  info: { fundo: cores.superficie, cor: cores.textoMedio, icone: 'info' },
  alerta: { fundo: cores.alertaFundo, cor: cores.alertaTextoForte, icone: 'alerta' },
  sucesso: { fundo: cores.primariaSuave, cor: cores.primariaEscura, icone: 'check' },
} as const;

export function Aviso({ mensagem, tom = 'info' }: { mensagem: string; tom?: TomAviso }) {
  const t = TONS[tom];
  return (
    <View
      style={[styles.base, { backgroundColor: t.fundo }]}
      accessibilityRole={tom === 'alerta' ? 'alert' : undefined}
    >
      <Icone nome={t.icone} tamanho={18} cor={tom === 'alerta' ? cores.alertaTexto : t.cor} style={styles.icone} />
      <Text style={[styles.texto, { color: t.cor, fontWeight: tom === 'sucesso' ? '600' : '400' }]}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', gap: 10, padding: espaco.md, paddingHorizontal: 14, borderRadius: raio.lg },
  icone: { marginTop: 1 },
  texto: { flex: 1, fontSize: 13, lineHeight: 19 },
});
