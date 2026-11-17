import { StyleSheet, Text, View } from 'react-native';

import { cores, raio, texto } from '@/tema/tema';
import type { Posicao } from '@/tipos/modelos';

/**
 * Etiqueta pequena e retangular.
 * - neutra: posição do jogador (GOL, ZAG, MEI, ATA)
 * - alerta: "Incompleto 4/5", "Sem goleiro", "Convidado"
 * - sucesso: confirmações curtas
 */
export type TomEtiqueta = 'neutra' | 'alerta' | 'sucesso';

const TONS: Record<TomEtiqueta, { fundo: string; cor: string }> = {
  neutra: { fundo: cores.superficie, cor: cores.textoMedio },
  alerta: { fundo: cores.alertaFundo, cor: cores.alertaTexto },
  sucesso: { fundo: cores.primariaSuave, cor: cores.primariaEscura },
};

export function Etiqueta({ rotulo, tom = 'neutra' }: { rotulo: string; tom?: TomEtiqueta }) {
  const t = TONS[tom];
  return (
    <View style={[styles.base, { backgroundColor: t.fundo }]}>
      <Text style={[texto.etiqueta, { color: t.cor }, tom !== 'neutra' && styles.textoLongo]}>{rotulo}</Text>
    </View>
  );
}

const NOME_POSICAO: Record<Posicao, string> = { GOL: 'Goleiro', ZAG: 'Zagueiro', MEI: 'Meia', ATA: 'Atacante' };

/** Etiqueta de largura fixa com a sigla da posição, para alinhar as listas. */
export function EtiquetaPosicao({ posicao }: { posicao: Posicao }) {
  return (
    <View style={[styles.base, styles.posicao]} accessibilityLabel={NOME_POSICAO[posicao]}>
      <Text style={[texto.etiqueta, { color: cores.textoMedio }]}>{posicao}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: raio.sm, paddingVertical: 3, paddingHorizontal: 8, alignSelf: 'flex-start' },
  posicao: { width: 40, paddingHorizontal: 0, alignItems: 'center', backgroundColor: cores.superficie },
  textoLongo: { fontSize: 12, fontWeight: '600', letterSpacing: 0 },
});
