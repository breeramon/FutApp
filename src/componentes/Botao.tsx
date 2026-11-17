import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { altura, cores, espaco, raio, texto } from '@/tema/tema';

import { Icone, type NomeIcone } from './Icone';

/**
 * - primario: verde, ação principal da tela ("Sortear times")
 * - secundario: contorno cinza ("Ressortear", "Colar lista")
 * - escuro: preto ("Encerrar partida")
 * - texto: só o texto, sem fundo ("Sortear ordem")
 * - perigo: texto vermelho ("Excluir pelada")
 */
export type VarianteBotao = 'primario' | 'secundario' | 'escuro' | 'texto' | 'perigo';

interface Props {
  titulo: string;
  onPress?: () => void;
  variante?: VarianteBotao;
  icone?: NomeIcone;
  /** Altura 44 em vez de 52, para botões lado a lado ou dentro de cards. */
  compacto?: boolean;
  desativado?: boolean;
  carregando?: boolean;
  style?: StyleProp<ViewStyle>;
}

const ESTILO_VARIANTE: Record<VarianteBotao, { fundo: string; borda?: string; cor: string }> = {
  primario: { fundo: cores.primaria, cor: cores.textoInverso },
  secundario: { fundo: cores.fundo, borda: cores.borda, cor: cores.texto },
  escuro: { fundo: cores.texto, cor: cores.textoInverso },
  texto: { fundo: 'transparent', cor: cores.primaria },
  perigo: { fundo: 'transparent', cor: cores.perigo },
};

export function Botao({ titulo, onPress, variante = 'primario', icone, compacto, desativado, carregando, style }: Props) {
  const v = ESTILO_VARIANTE[variante];
  const soTexto = variante === 'texto' || variante === 'perigo';
  const bloqueado = desativado || carregando;

  return (
    <Pressable
      onPress={onPress}
      disabled={bloqueado}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: bloqueado, busy: carregando }}
      hitSlop={soTexto ? 8 : undefined}
      style={({ pressed }) => [
        styles.base,
        soTexto ? styles.soTexto : { height: compacto ? altura.botaoCompacto : altura.botao },
        { backgroundColor: v.fundo, borderColor: v.borda ?? 'transparent', borderWidth: v.borda ? 1 : 0 },
        desativado && !soTexto && { backgroundColor: cores.desativado, borderColor: 'transparent' },
        pressed && !bloqueado && { opacity: 0.75 },
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={v.cor} />
      ) : (
        <View style={styles.conteudo}>
          {icone ? <Icone nome={icone} tamanho={compacto ? 18 : 20} cor={desativado ? cores.textoSecundario : v.cor} /> : null}
          <Text
            style={[texto.botao, compacto && styles.textoCompacto, { color: desativado ? cores.textoSecundario : v.cor }]}
            numberOfLines={1}
          >
            {titulo}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: raio.lg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: espaco.lg },
  soTexto: { minHeight: 32, paddingHorizontal: 0, alignSelf: 'flex-start' },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  textoCompacto: { fontSize: 14 },
});
