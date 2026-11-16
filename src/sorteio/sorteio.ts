import type { Posicao, TipoRestricao } from '../tipos/modelos';

// Este arquivo não conhece banco nem tela: recebe os presentes e devolve os times.
// Por isso dá para testar sozinho (sorteio.test.ts) e reaproveitar depois na API.

export interface JogadorSorteio {
  idJogador: string;
  nome: string;
  posicao: Posicao;
}

export interface RestricaoSorteio {
  idJogadorA: string;
  idJogadorB: string;
  tipo: TipoRestricao;
}

export interface EntradaSorteio {
  /** Jogadores presentes no dia. */
  jogadores: JogadorSorteio[];
  quantidadeTimes: number;
  /** Vem da modalidade: 11, 7 ou 5. */
  jogadoresPorTime: number;
  restricoes?: RestricaoSorteio[];
  /** Quem ficou de reserva no último dia de jogo da pelada (reserva justo). */
  reservasAnteriores?: string[];
  /** Gerador de números aleatórios entre 0 e 1. Os testes passam um gerador previsível. */
  aleatorio?: () => number;
}

export interface TimeSorteado {
  /** 1 = Time A, 2 = Time B... */
  ordem: number;
  nome: string;
  cor: string;
  /** Já ordenados por posição e, na mesma posição, por nome. */
  jogadores: JogadorSorteio[];
  vagas: number;
  completo: boolean;
  semGoleiro: boolean;
  /** Ordem de revezamento no gol (ids). Vazio quando o time tem goleiro. */
  ordemGoleiro: string[];
}

export interface ResultadoSorteio {
  times: TimeSorteado[];
  reservas: JogadorSorteio[];
  /** Mensagens para o organizador, ex.: uma restrição que não deu para cumprir. */
  avisos: string[];
}

export const ORDEM_POSICAO: Record<Posicao, number> = { GOL: 0, ZAG: 1, MEI: 2, ATA: 3 };

/** Cores sorteadas para os times; o organizador pode trocar depois. */
export const CORES_TIMES = ['#2563EB', '#EA7A1A', '#7C3AED', '#0F9488', '#DC2626', '#CA8A04', '#16181A', '#DB2777'];

/** Embaralhamento de Fisher-Yates: devolve uma cópia em ordem aleatória, sem viés. */
export function embaralhar<T>(lista: readonly T[], aleatorio: () => number = Math.random): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Goleiro, zagueiro, meia, atacante; na mesma posição, ordem alfabética. */
export function ordenarPorPosicao(jogadores: readonly JogadorSorteio[]): JogadorSorteio[] {
  return [...jogadores].sort(
    (a, b) =>
      ORDEM_POSICAO[a.posicao] - ORDEM_POSICAO[b.posicao] ||
      a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }),
  );
}

/** Ordem de revezamento no gol para um time sem goleiro. Usada também pelo botão "Sortear ordem". */
export function sortearOrdemGoleiro(
  jogadores: readonly JogadorSorteio[],
  aleatorio: () => number = Math.random,
): string[] {
  return embaralhar(jogadores, aleatorio).map((j) => j.idJogador);
}

export function nomePadraoTime(ordem: number): string {
  return `Time ${String.fromCharCode(64 + ordem)}`;
}

export function sortearTimes(entrada: EntradaSorteio): ResultadoSorteio {
  const { jogadores, quantidadeTimes, jogadoresPorTime } = entrada;
  const aleatorio = entrada.aleatorio ?? Math.random;
  const restricoes = entrada.restricoes ?? [];
  const avisos: string[] = [];

  if (!Number.isInteger(quantidadeTimes) || quantidadeTimes < 2) {
    throw new Error('O sorteio precisa de pelo menos 2 times.');
  }
  if (!Number.isInteger(jogadoresPorTime) || jogadoresPorTime < 1) {
    throw new Error('A quantidade de jogadores por time é inválida.');
  }
  if (jogadores.length < quantidadeTimes) {
    throw new Error(`São necessários pelo menos ${quantidadeTimes} jogadores para ${quantidadeTimes} times.`);
  }

  const nomePorId = new Map(jogadores.map((j) => [j.idJogador, j.nome]));
  const nome = (id: string) => nomePorId.get(id) ?? id;

  // 1. Quem joga e quem fica de reserva.
  const { entram, reservas } = separarReservas(entrada, aleatorio);
  const idsEntram = new Set(entram.map((j) => j.idJogador));

  // 2. Tamanho de cada time. Ex.: 19 jogadores em 4 times de 5 → 5, 5, 5, 4.
  const base = Math.floor(entram.length / quantidadeTimes);
  const sobra = entram.length % quantidadeTimes;
  const times = Array.from({ length: quantidadeTimes }, (_, i) => ({
    tamanho: Math.min(jogadoresPorTime, base + (i < sobra ? 1 : 0)),
    membros: [] as JogadorSorteio[],
    temGoleiro: false,
  }));

  // 3. Restrições. "Juntos" vira um grupo que entra inteiro no mesmo time; "separados" vira um conflito.
  const grupos = new UniaoDeGrupos();
  const separados = new Map<string, Set<string>>();
  for (const r of restricoes) {
    const aJoga = idsEntram.has(r.idJogadorA);
    const bJoga = idsEntram.has(r.idJogadorB);
    if (r.tipo === 'juntos') {
      if (aJoga && bJoga) grupos.unir(r.idJogadorA, r.idJogadorB);
      else if (aJoga !== bJoga) {
        avisos.push(`${nome(r.idJogadorA)} e ${nome(r.idJogadorB)} não ficaram juntos: um deles está na reserva.`);
      }
    } else if (aJoga && bJoga) {
      adicionarConflito(separados, r.idJogadorA, r.idJogadorB);
      adicionarConflito(separados, r.idJogadorB, r.idJogadorA);
    }
  }

  const membrosPorGrupo = new Map<string, JogadorSorteio[]>();
  for (const j of embaralhar(entram, aleatorio)) {
    const raiz = grupos.raiz(j.idJogador);
    membrosPorGrupo.set(raiz, [...(membrosPorGrupo.get(raiz) ?? []), j]);
  }

  // 4. Goleiros titulares: no máximo um por time e um por grupo.
  const gruposComGoleiro = new Set<string>();
  for (const g of embaralhar(entram.filter((j) => j.posicao === 'GOL'), aleatorio)) {
    if (gruposComGoleiro.size >= quantidadeTimes) break;
    gruposComGoleiro.add(grupos.raiz(g.idJogador));
  }

  const conflita = (indice: number, grupo: JogadorSorteio[]) =>
    grupo.some((j) => times[indice].membros.some((m) => separados.get(j.idJogador)?.has(m.idJogador)));

  const escolherTime = (grupo: JogadorSorteio[], soTimeSemGoleiro: boolean, ignorarConflitos: boolean) => {
    const candidatos = times
      .map((_, i) => i)
      .filter(
        (i) =>
          times[i].tamanho - times[i].membros.length >= grupo.length &&
          (!soTimeSemGoleiro || !times[i].temGoleiro) &&
          (ignorarConflitos || !conflita(i, grupo)),
      );
    return candidatos.length > 0 ? candidatos[Math.floor(aleatorio() * candidatos.length)] : -1;
  };

  const colocar = (grupo: JogadorSorteio[], comGoleiro: boolean) => {
    let indice = escolherTime(grupo, comGoleiro, false);
    if (indice < 0 && comGoleiro) indice = escolherTime(grupo, false, false);
    if (indice < 0) {
      indice = escolherTime(grupo, false, true);
      if (indice >= 0) avisos.push(`Não deu para separar ${descreverConflitos(grupo, times[indice].membros)}.`);
    }
    if (indice < 0) {
      // O grupo não cabe inteiro em nenhum time: entra jogador por jogador.
      avisos.push(`Não deu para manter juntos: ${grupo.map((j) => j.nome).join(', ')}.`);
      for (const j of grupo) colocar([j], comGoleiro && j.posicao === 'GOL');
      return;
    }
    times[indice].membros.push(...grupo);
    if (comGoleiro && !times[indice].temGoleiro) times[indice].temGoleiro = true;
  };

  const descreverConflitos = (grupo: JogadorSorteio[], membros: JogadorSorteio[]) =>
    grupo
      .flatMap((j) =>
        membros.filter((m) => separados.get(j.idJogador)?.has(m.idJogador)).map((m) => `${j.nome} e ${m.nome}`),
      )
      .join(', ');

  // 5. Distribuição: primeiro os grupos com goleiro (um por time), depois os maiores grupos, depois o resto.
  const todosGrupos = embaralhar([...membrosPorGrupo.entries()], aleatorio);
  for (const [raiz, grupo] of todosGrupos) {
    if (gruposComGoleiro.has(raiz)) colocar(grupo, true);
  }
  // Grupos maiores e jogadores com "nunca juntos" vão antes, enquanto ainda há vaga em todos os times;
  // deixá-los para o fim pode sobrar vaga só no time do jogador com quem eles não podem ficar.
  const conflitos = (grupo: JogadorSorteio[]) => grupo.filter((j) => separados.has(j.idJogador)).length;
  const restantes = todosGrupos
    .filter(([raiz]) => !gruposComGoleiro.has(raiz))
    .sort((a, b) => b[1].length - a[1].length || conflitos(b[1]) - conflitos(a[1]));
  for (const [, grupo] of restantes) colocar(grupo, false);

  // 6. Resultado: nome, cor, ordem por posição e as sinalizações.
  const cores = embaralhar(CORES_TIMES, aleatorio);
  return {
    times: times.map((t, i) => ({
      ordem: i + 1,
      nome: nomePadraoTime(i + 1),
      cor: cores[i % cores.length],
      jogadores: ordenarPorPosicao(t.membros),
      vagas: jogadoresPorTime,
      completo: t.membros.length === jogadoresPorTime,
      semGoleiro: !t.temGoleiro,
      ordemGoleiro: t.temGoleiro ? [] : sortearOrdemGoleiro(t.membros, aleatorio),
    })),
    reservas: ordenarPorPosicao(reservas),
    avisos,
  };
}

/**
 * Decide quem fica de fora quando há mais presentes que vagas.
 * Quem foi reserva da última vez entra primeiro; depois, garante que os goleiros joguem
 * (até um por time) antes de completar com o resto, em ordem aleatória.
 */
function separarReservas(entrada: EntradaSorteio, aleatorio: () => number) {
  const vagas = entrada.quantidadeTimes * entrada.jogadoresPorTime;
  const anteriores = new Set(entrada.reservasAnteriores ?? []);
  const embaralhados = embaralhar(entrada.jogadores, aleatorio);
  const ordem = [
    ...embaralhados.filter((j) => anteriores.has(j.idJogador)),
    ...embaralhados.filter((j) => !anteriores.has(j.idJogador)),
  ];

  const entram = ordem.slice(0, vagas);
  const reservas = ordem.slice(vagas);

  // Se um goleiro ficou de fora e ainda falta goleiro para algum time, ele troca com um jogador de linha.
  let goleirosJogando = entram.filter((j) => j.posicao === 'GOL').length;
  while (goleirosJogando < entrada.quantidadeTimes) {
    const iReserva = reservas.findIndex((j) => j.posicao === 'GOL');
    if (iReserva < 0) break;
    const iSai = ultimoIndice(entram, (j) => j.posicao !== 'GOL' && !anteriores.has(j.idJogador));
    const iSaiQualquer = iSai >= 0 ? iSai : ultimoIndice(entram, (j) => j.posicao !== 'GOL');
    if (iSaiQualquer < 0) break;
    [entram[iSaiQualquer], reservas[iReserva]] = [reservas[iReserva], entram[iSaiQualquer]];
    goleirosJogando += 1;
  }

  return { entram, reservas };
}

function ultimoIndice<T>(lista: T[], condicao: (item: T) => boolean): number {
  for (let i = lista.length - 1; i >= 0; i--) if (condicao(lista[i])) return i;
  return -1;
}

function adicionarConflito(mapa: Map<string, Set<string>>, a: string, b: string) {
  const conjunto = mapa.get(a) ?? new Set<string>();
  conjunto.add(b);
  mapa.set(a, conjunto);
}

/** Estrutura "union-find": junta jogadores ligados por restrições "juntos", inclusive em cadeia (A+B e B+C). */
class UniaoDeGrupos {
  private pai = new Map<string, string>();

  raiz(id: string): string {
    let atual = id;
    while (this.pai.has(atual) && this.pai.get(atual) !== atual) atual = this.pai.get(atual)!;
    return atual;
  }

  unir(a: string, b: string) {
    const ra = this.raiz(a);
    const rb = this.raiz(b);
    if (ra !== rb) this.pai.set(rb, ra);
  }
}
