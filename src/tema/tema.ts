// Tema do app: as cores, espaçamentos, cantos e textos tirados dos mockups.
// Os componentes usam só estes valores, nunca uma cor escrita direto.
// Para mudar a cor de destaque do app inteiro, basta trocar `primaria` aqui.

export const cores = {
  fundo: '#FFFFFF',
  superficie: '#F4F5F3', // fundo de campos, chips de posição, caixas de informação
  superficieAlt: '#FAFBF9',

  texto: '#16181A',
  textoSecundario: '#5F6368', // legendas, subtítulos
  textoMedio: '#3C4043',
  textoInverso: '#FFFFFF',
  iconeSuave: '#9AA09A',

  borda: '#DADDD8', // contorno de botões e chips
  bordaSuave: '#E3E5E1', // contorno de cards
  divisor: '#EEF0EC', // linhas entre itens de lista
  desativado: '#C9CCC6',
  marcadorVazio: '#B5B9B3', // caixa de seleção desmarcada

  primaria: '#1E7A4C',
  primariaEscura: '#165C39',
  primariaSuave: '#EEF5F0',

  alertaFundo: '#FFF4E0',
  alertaTexto: '#8A5300',
  alertaTextoForte: '#6B4100',

  perigo: '#B42318',
  perigoSuave: '#FDECEA',
  perigoTexto: '#8E1C12',

  escurecer: 'rgba(22, 24, 26, 0.45)', // atrás de bottom sheets
} as const;

/** Cores oferecidas para os times (as mesmas do sorteio). */
export { CORES_TIMES } from '../sorteio/sorteio';

/** Espaçamentos em múltiplos de 4. A margem lateral das telas é `xl` (20). */
export const espaco = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const raio = {
  sm: 6, // etiquetas
  md: 10,
  lg: 12, // botões e campos
  xl: 16, // cards
  folha: 24, // topo dos bottom sheets
  pilula: 999,
} as const;

/** Altura mínima de toque recomendada (44) e alturas padrão dos controles. */
export const altura = {
  toqueMinimo: 44,
  botao: 52,
  botaoCompacto: 44,
  campo: 52,
  itemLista: 52,
} as const;

export const texto = {
  tituloTela: { fontSize: 26, fontWeight: '700', letterSpacing: -0.3, color: cores.texto },
  tituloFolha: { fontSize: 22, fontWeight: '700', color: cores.texto },
  tituloSecao: { fontSize: 16, fontWeight: '600', color: cores.texto },
  rotulo: { fontSize: 15, fontWeight: '600', color: cores.texto },
  corpo: { fontSize: 15, fontWeight: '400', color: cores.texto },
  corpoForte: { fontSize: 15, fontWeight: '500', color: cores.texto },
  apoio: { fontSize: 13, fontWeight: '400', color: cores.textoSecundario, lineHeight: 19 },
  rotuloSecao: { fontSize: 13, fontWeight: '700', letterSpacing: 0.6, color: cores.textoSecundario },
  etiqueta: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  botao: { fontSize: 16, fontWeight: '600' },
} as const;

export const sombra = {
  card: {
    shadowColor: cores.texto,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rodape: {
    shadowColor: cores.texto,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  flutuante: {
    shadowColor: cores.texto,
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
} as const;
