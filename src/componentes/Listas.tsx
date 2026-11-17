import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { altura, cores, espaco, raio, texto } from '@/tema/tema';

import { Icone } from './Icone';

interface ItemListaProps {
  titulo: string;
  subtitulo?: string;
  /** Texto cinza à direita, antes da seta ("22", "2 pares"). */
  detalhe?: string;
  /** Conteúdo à esquerda: caixa de seleção, avatar, bolinha de cor. */
  inicio?: ReactNode;
  /** Conteúdo à direita no lugar da seta: etiqueta de posição, botão. */
  fim?: ReactNode;
  onPress?: () => void;
  /** Mostra a seta ">" quando o item leva a outra tela. Padrão: só se tiver onPress e não tiver `fim`. */
  seta?: boolean;
}

/** Linha de lista com divisor embaixo (jogadores, presença, atalhos da pelada). */
export function ItemLista({ titulo, subtitulo, detalhe, inicio, fim, onPress, seta }: ItemListaProps) {
  const mostrarSeta = seta ?? (!!onPress && !fim);
  const conteudo = (
    <>
      {inicio}
      <View style={styles.textos}>
        <Text style={texto.corpoForte} numberOfLines={1}>
          {titulo}
        </Text>
        {subtitulo ? (
          <Text style={texto.apoio} numberOfLines={1}>
            {subtitulo}
          </Text>
        ) : null}
      </View>
      {detalhe ? <Text style={styles.detalhe}>{detalhe}</Text> : null}
      {fim}
      {mostrarSeta ? <Icone nome="avancar" tamanho={18} cor={cores.textoSecundario} /> : null}
    </>
  );

  if (!onPress) return <View style={styles.item}>{conteudo}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.item, pressed && { backgroundColor: cores.superficieAlt }]}
    >
      {conteudo}
    </Pressable>
  );
}

/** Círculo com as iniciais do nome ("Breno Santos" → "BS"). */
export function Avatar({ nome }: { nome: string }) {
  const iniciais = nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no">
      <Text style={styles.avatarTexto}>{iniciais}</Text>
    </View>
  );
}

/** Bolinha com a cor do time. */
export function BolaCor({ cor, tamanho = 12 }: { cor: string; tamanho?: number }) {
  return <View style={{ width: tamanho, height: tamanho, borderRadius: raio.pilula, backgroundColor: cor }} />;
}

/** Título de seção com uma ação opcional à direita ("Suas peladas" · "Criar nova"). */
export function TituloSecao({ titulo, acao }: { titulo: string; acao?: ReactNode }) {
  return (
    <View style={styles.tituloSecao}>
      <Text style={texto.tituloSecao} accessibilityRole="header">
        {titulo}
      </Text>
      {acao}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    minHeight: altura.itemLista,
    paddingVertical: espaco.sm,
    borderBottomWidth: 1,
    borderBottomColor: cores.divisor,
  },
  textos: { flex: 1, gap: 2 },
  detalhe: { fontSize: 14, color: cores.textoSecundario },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: raio.pilula,
    backgroundColor: cores.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { fontSize: 13, fontWeight: '700', color: cores.primaria },
  tituloSecao: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: espaco.sm },
});
