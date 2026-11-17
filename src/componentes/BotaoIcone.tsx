import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { altura, cores, raio } from '@/tema/tema';

import { Icone, type NomeIcone } from './Icone';

interface Props {
  icone: NomeIcone;
  /** Obrigatório: é o que o leitor de tela fala, já que o botão não tem texto. */
  rotulo: string;
  onPress?: () => void;
  /** "cinza" é o círculo dos mockups (voltar, editar); "transparente" não tem fundo (fechar). */
  fundo?: 'cinza' | 'transparente';
  tamanho?: number;
  style?: StyleProp<ViewStyle>;
}

/** Botão redondo só com ícone: voltar, fechar, editar, excluir. */
export function BotaoIcone({ icone, rotulo, onPress, fundo = 'cinza', tamanho = altura.toqueMinimo, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={({ pressed }) => [
        styles.base,
        { width: tamanho, height: tamanho, backgroundColor: fundo === 'cinza' ? cores.superficie : 'transparent' },
        pressed && { opacity: 0.6 },
        style,
      ]}
    >
      <Icone nome={icone} tamanho={Math.round(tamanho * 0.45)} cor={cores.texto} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: raio.pilula, alignItems: 'center', justifyContent: 'center' },
});
