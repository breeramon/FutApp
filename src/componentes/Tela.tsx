import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cores, espaco, sombra, texto } from '@/tema/tema';

import { BotaoIcone } from './BotaoIcone';

interface TelaProps {
  children: ReactNode;
  /** Botões fixos no rodapé, com sombra ("Sortear times", "Ressortear | Compartilhar"). */
  rodape?: ReactNode;
  /** Barra de navegação em pílula flutuando no fim da tela (Início, Histórico, Ajustes). */
  navegacao?: ReactNode;
  /** false para telas que já têm a própria lista rolável (FlatList). */
  rolavel?: boolean;
  /** Reserva espaço no fim para a barra das abas, que é desenhada pelo layout das abas. */
  espacoNavegacao?: boolean;
}

/**
 * Estrutura comum a todas as telas: fundo branco, respeita a área do relógio/câmera
 * no topo, rola o conteúdo, desvia do teclado e reserva espaço para o rodapé.
 */
export function Tela({ children, rodape, navegacao, rolavel = true, espacoNavegacao }: TelaProps) {
  const insets = useSafeAreaInsets();
  const espacoFinal = (rodape || navegacao || espacoNavegacao ? 120 : espaco.xxxl) + insets.bottom;
  const conteudo = (
    <View style={{ paddingTop: insets.top + espaco.sm, paddingHorizontal: espaco.xl, paddingBottom: espacoFinal }}>
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.raiz} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {rolavel ? (
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {conteudo}
        </ScrollView>
      ) : (
        <View style={styles.raiz}>{conteudo}</View>
      )}
      {rodape ? (
        <View style={[styles.rodape, { paddingBottom: insets.bottom + espaco.lg }]}>{rodape}</View>
      ) : null}
      {navegacao ? <View style={[styles.navegacao, { bottom: insets.bottom + espaco.lg }]}>{navegacao}</View> : null}
    </KeyboardAvoidingView>
  );
}

interface CabecalhoProps {
  titulo: string;
  subtitulo?: string;
  onVoltar?: () => void;
  /** Botão à direita da linha do voltar (ex.: editar). */
  acao?: ReactNode;
  /** Título maior (28) das telas principais, como Início e Histórico. */
  grande?: boolean;
}

/** Voltar + ação à direita, e abaixo o título com subtítulo. */
export function Cabecalho({ titulo, subtitulo, onVoltar, acao, grande }: CabecalhoProps) {
  return (
    <View style={styles.cabecalho}>
      {onVoltar || acao ? (
        <View style={styles.linhaTopo}>
          {onVoltar ? <BotaoIcone icone="voltar" rotulo="Voltar" onPress={onVoltar} /> : <View />}
          {acao}
        </View>
      ) : null}
      <Text style={[texto.tituloTela, grande && styles.tituloGrande]} accessibilityRole="header">
        {titulo}
      </Text>
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.fundo },
  rodape: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 14,
    paddingHorizontal: espaco.xl,
    backgroundColor: cores.fundo,
    gap: 10,
    ...sombra.rodape,
  },
  navegacao: { position: 'absolute', alignSelf: 'center' },
  cabecalho: { gap: 4, marginBottom: espaco.lg },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: espaco.md },
  tituloGrande: { fontSize: 28, letterSpacing: -0.4, marginTop: espaco.xxl },
  subtitulo: { fontSize: 14, color: cores.textoSecundario },
});
