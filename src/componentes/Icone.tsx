import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import { cores } from '@/tema/tema';

// Cada ícone do app tem um nome em português e o nome real em cada sistema:
// Material Symbols no Android e SF Symbols no iPhone (os dois já vêm no expo-symbols).
const ICONES = {
  voltar: { android: 'arrow_back', ios: 'chevron.left' },
  avancar: { android: 'chevron_right', ios: 'chevron.right' },
  abrir: { android: 'expand_more', ios: 'chevron.down' },
  fechar: { android: 'close', ios: 'xmark' },
  adicionar: { android: 'add', ios: 'plus' },
  editar: { android: 'edit', ios: 'pencil' },
  excluir: { android: 'delete', ios: 'trash' },
  buscar: { android: 'search', ios: 'magnifyingglass' },
  calendario: { android: 'calendar_today', ios: 'calendar' },
  pessoas: { android: 'group', ios: 'person.2' },
  bola: { android: 'sports_soccer', ios: 'soccerball' },
  historico: { android: 'history', ios: 'clock' },
  ajustes: { android: 'settings', ios: 'gearshape' },
  check: { android: 'check', ios: 'checkmark' },
  alerta: { android: 'warning', ios: 'exclamationmark.triangle' },
  info: { android: 'info', ios: 'info.circle' },
  colar: { android: 'content_paste', ios: 'doc.on.clipboard' },
  copiar: { android: 'content_copy', ios: 'doc.on.doc' },
  sortear: { android: 'shuffle', ios: 'shuffle' },
  compartilhar: { android: 'share', ios: 'square.and.arrow.up' },
  baixar: { android: 'download', ios: 'square.and.arrow.down' },
  enviar: { android: 'upload', ios: 'square.and.arrow.up' },
  arrastar: { android: 'drag_indicator', ios: 'line.3.horizontal' },
  pausar: { android: 'pause', ios: 'pause.fill' },
  iniciar: { android: 'play_arrow', ios: 'play.fill' },
  zerar: { android: 'restart_alt', ios: 'arrow.counterclockwise' },
  filtros: { android: 'tune', ios: 'slider.horizontal.3' },
  trocar: { android: 'swap_horiz', ios: 'arrow.left.arrow.right' },
} as const satisfies Record<string, Exclude<SymbolViewProps['name'], string>>;

export type NomeIcone = keyof typeof ICONES;

interface Props {
  nome: NomeIcone;
  tamanho?: number;
  cor?: ColorValue;
  style?: StyleProp<ViewStyle>;
}

export function Icone({ nome, tamanho = 20, cor = cores.texto, style }: Props) {
  return (
    <SymbolView
      name={ICONES[nome]}
      size={tamanho}
      tintColor={cor}
      style={style}
      // Ícones são decorativos: quem tem leitor de tela ouve o texto do botão, não o ícone.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
