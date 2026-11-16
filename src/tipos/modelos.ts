// Tipos que espelham as tabelas do banco (ver documento de requisitos, seção "Modelo de dados").
// Cada interface tem os mesmos nomes de atributos das colunas no SQLite.

export type Posicao = 'GOL' | 'ZAG' | 'MEI' | 'ATA';
export type CodigoModalidade = 'futebol' | 'fut7' | 'futsal';
export type TipoRestricao = 'juntos' | 'separados';
export type StatusDiaDeJogo = 'presenca' | 'sorteado' | 'emAndamento' | 'encerrado';
export type RegraRodizio = 'ganhouFica' | 'doisSaem';
export type TrocaGoleiro = 'golSofrido' | 'minutos' | 'partida';
export type OrigemPresenca = 'manual' | 'lista';

/** Colunas de controle que toda tabela tem. Datas em texto ISO 8601. */
export interface Auditoria {
  criadoEm: string;
  atualizadoEm: string;
  excluidoEm: string | null;
}

export interface Modalidade extends Auditoria {
  idModalidade: string;
  codigo: CodigoModalidade;
  nome: string;
  jogadoresPorTime: number;
  goleirosPorTime: number;
}

export interface Configuracao {
  chave: string;
  valor: string;
  atualizadoEm: string;
}

export interface Pelada extends Auditoria {
  idPelada: string;
  nome: string;
  idModalidadePadrao: string;
  diaSemana: number | null;
  horario: string | null;
}

export interface Jogador extends Auditoria {
  idJogador: string;
  nome: string;
}

export interface PeladaJogador extends Auditoria {
  idPeladaJogador: string;
  idPelada: string;
  idJogador: string;
  posicao: Posicao;
  /** No SQLite booleanos são 0 ou 1. */
  convidado: 0 | 1;
}

export interface JogadorApelido extends Auditoria {
  idJogadorApelido: string;
  idJogador: string;
  apelido: string;
}

export interface Restricao extends Auditoria {
  idRestricao: string;
  idPelada: string;
  idJogadorA: string;
  idJogadorB: string;
  tipo: TipoRestricao;
}

export interface DiaDeJogo extends Auditoria {
  idDiaDeJogo: string;
  idPelada: string;
  idModalidade: string;
  data: string;
  quantidadeTimes: number;
  status: StatusDiaDeJogo;
  regraRodizio: RegraRodizio;
  limiteGols: number | null;
  limiteMinutos: number | null;
}

export interface Presenca extends Auditoria {
  idPresenca: string;
  idDiaDeJogo: string;
  idJogador: string;
  origem: OrigemPresenca;
}

export interface Time extends Auditoria {
  idTime: string;
  idDiaDeJogo: string;
  nome: string;
  cor: string;
  ordem: number;
  posicaoFila: number | null;
  trocaGoleiro: TrocaGoleiro;
  trocaGoleiroMinutos: number | null;
}

export interface Escalacao extends Auditoria {
  idEscalacao: string;
  idDiaDeJogo: string;
  idJogador: string;
  /** null = ficou de reserva */
  idTime: string | null;
  ordemGoleiro: number | null;
}

export interface Partida extends Auditoria {
  idPartida: string;
  idDiaDeJogo: string;
  numero: number;
  idTimeA: string;
  idTimeB: string;
  idTimeVencedor: string | null;
  iniciadaEm: string;
  encerradaEm: string | null;
}

export interface Gol extends Auditoria {
  idGol: string;
  idPartida: string;
  idTime: string;
  /** null = autor não informado */
  idJogador: string | null;
  contra: 0 | 1;
  momentoSegundos: number;
}
