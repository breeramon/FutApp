// Jogadores e o vínculo deles com cada pelada.
// Lembrete do modelo: `Jogador` é a pessoa (só o nome); `PeladaJogador` é a pessoa dentro de uma
// pelada, com posição e se é convidado. Uma pessoa pode estar em várias peladas.

import type { Posicao } from '../../tipos/modelos';
import { compararNomes, limparNome, normalizar } from '../../dominio/texto.ts';
import { gerarId } from '../id.ts';
import { agoraIso, ErroValidacao, type Banco } from './comum.ts';

export interface JogadorDaPelada {
  idPeladaJogador: string;
  idPelada: string;
  idJogador: string;
  nome: string;
  posicao: Posicao;
  convidado: 0 | 1;
}

/** Jogador de outra pelada que pode ser trazido para esta. */
export interface SugestaoJogador {
  idJogador: string;
  nome: string;
  /** Posição que ele usa em outra pelada, para já vir marcada. */
  posicaoSugerida: Posicao;
  /** Nomes das outras peladas em que ele joga, para o organizador reconhecer a pessoa. */
  peladas: string;
}

export interface DadosJogador {
  nome: string;
  posicao: Posicao;
  convidado: boolean;
}

const SELECT_JOGADOR = `
  SELECT pj.idPeladaJogador, pj.idPelada, pj.idJogador, j.nome, pj.posicao, pj.convidado
  FROM PeladaJogador pj
  JOIN Jogador j ON j.idJogador = pj.idJogador
  WHERE pj.excluidoEm IS NULL AND j.excluidoEm IS NULL`;

/** Jogadores ativos da pelada, em ordem alfabética (do português, com acentos). */
export async function listarJogadoresDaPelada(db: Banco, idPelada: string): Promise<JogadorDaPelada[]> {
  const lista = await db.getAllAsync<JogadorDaPelada>(`${SELECT_JOGADOR} AND pj.idPelada = ?`, idPelada);
  return lista.sort((a, b) => compararNomes(a.nome, b.nome));
}

export async function obterJogadorDaPelada(db: Banco, idPeladaJogador: string): Promise<JogadorDaPelada | null> {
  return db.getFirstAsync<JogadorDaPelada>(`${SELECT_JOGADOR} AND pj.idPeladaJogador = ?`, idPeladaJogador);
}

/**
 * Pessoas cadastradas em outras peladas (e que ainda não estão nesta) cujo nome contém o termo.
 * A comparação ignora acentos e maiúsculas: "jose" encontra "José".
 */
export async function buscarJogadoresDeOutrasPeladas(db: Banco, idPelada: string, termo: string): Promise<SugestaoJogador[]> {
  const busca = normalizar(termo);
  if (busca.length < 2) return [];

  const linhas = await db.getAllAsync<{ idJogador: string; nome: string; posicao: Posicao; pelada: string }>(
    `SELECT j.idJogador, j.nome, pj.posicao, p.nome AS pelada
     FROM Jogador j
     JOIN PeladaJogador pj ON pj.idJogador = j.idJogador AND pj.excluidoEm IS NULL
     JOIN Pelada p ON p.idPelada = pj.idPelada AND p.excluidoEm IS NULL
     WHERE j.excluidoEm IS NULL
       AND j.idJogador NOT IN (
         SELECT idJogador FROM PeladaJogador WHERE idPelada = ? AND excluidoEm IS NULL
       )
     ORDER BY pj.criadoEm`,
    idPelada,
  );

  const porJogador = new Map<string, SugestaoJogador>();
  for (const l of linhas) {
    if (!normalizar(l.nome).includes(busca)) continue;
    const atual = porJogador.get(l.idJogador);
    if (atual) atual.peladas += `, ${l.pelada}`;
    else porJogador.set(l.idJogador, { idJogador: l.idJogador, nome: l.nome, posicaoSugerida: l.posicao, peladas: l.pelada });
  }
  return [...porJogador.values()].sort((a, b) => compararNomes(a.nome, b.nome)).slice(0, 5);
}

/** Impede dois jogadores com o mesmo nome (ignorando acentos e maiúsculas) na mesma pelada. */
async function garantirNomeLivre(db: Banco, idPelada: string, nome: string, ignorarIdJogador?: string) {
  const jogadores = await listarJogadoresDaPelada(db, idPelada);
  const alvo = normalizar(nome);
  const repetido = jogadores.find((j) => j.idJogador !== ignorarIdJogador && normalizar(j.nome) === alvo);
  if (repetido) {
    throw new ErroValidacao(`Já existe um "${repetido.nome}" nesta pelada. Use um sobrenome ou apelido para diferenciar.`, 'nome');
  }
}

function validarNome(nome: string): string {
  const limpo = limparNome(nome);
  if (!limpo) throw new ErroValidacao('Digite o nome do jogador.', 'nome');
  if (limpo.length > 40) throw new ErroValidacao('Use um nome com até 40 letras.', 'nome');
  return limpo;
}

/**
 * Liga uma pessoa à pelada. Se ela já esteve na pelada e foi removida, reaproveita o vínculo antigo
 * (o banco não deixa dois vínculos da mesma pessoa com a mesma pelada).
 */
async function vincular(db: Banco, idPelada: string, idJogador: string, posicao: Posicao, convidado: boolean): Promise<string> {
  const antigo = await db.getFirstAsync<{ idPeladaJogador: string }>(
    'SELECT idPeladaJogador FROM PeladaJogador WHERE idPelada = ? AND idJogador = ?',
    idPelada,
    idJogador,
  );
  if (antigo) {
    await db.runAsync(
      `UPDATE PeladaJogador SET posicao = ?, convidado = ?, excluidoEm = NULL, atualizadoEm = ?
       WHERE idPeladaJogador = ?`,
      posicao,
      convidado ? 1 : 0,
      agoraIso(),
      antigo.idPeladaJogador,
    );
    return antigo.idPeladaJogador;
  }
  const idPeladaJogador = gerarId();
  await db.runAsync(
    'INSERT INTO PeladaJogador (idPeladaJogador, idPelada, idJogador, posicao, convidado) VALUES (?, ?, ?, ?, ?)',
    idPeladaJogador,
    idPelada,
    idJogador,
    posicao,
    convidado ? 1 : 0,
  );
  return idPeladaJogador;
}

/** Cadastra uma pessoa nova e já a coloca na pelada. Devolve o idPeladaJogador. */
export async function adicionarJogadorNovo(db: Banco, idPelada: string, dados: DadosJogador): Promise<string> {
  const nome = validarNome(dados.nome);
  await garantirNomeLivre(db, idPelada, nome);
  let idPeladaJogador = '';
  // Transação: a pessoa e o vínculo são gravados juntos ou nenhum dos dois.
  await db.withTransactionAsync(async () => {
    const idJogador = gerarId();
    await db.runAsync('INSERT INTO Jogador (idJogador, nome) VALUES (?, ?)', idJogador, nome);
    idPeladaJogador = await vincular(db, idPelada, idJogador, dados.posicao, dados.convidado);
  });
  return idPeladaJogador;
}

/** Traz para esta pelada uma pessoa que já está cadastrada em outra. */
export async function adicionarJogadorExistente(
  db: Banco,
  idPelada: string,
  idJogador: string,
  posicao: Posicao,
  convidado: boolean,
): Promise<string> {
  const pessoa = await db.getFirstAsync<{ nome: string }>(
    'SELECT nome FROM Jogador WHERE idJogador = ? AND excluidoEm IS NULL',
    idJogador,
  );
  if (!pessoa) throw new ErroValidacao('Esse jogador não existe mais.');
  await garantirNomeLivre(db, idPelada, pessoa.nome, idJogador);
  return vincular(db, idPelada, idJogador, posicao, convidado);
}

/**
 * Atualiza o jogador dentro da pelada. O nome é da pessoa, então muda em todas as peladas dela;
 * posição e convidado valem só para esta pelada.
 */
export async function atualizarJogadorDaPelada(db: Banco, idPeladaJogador: string, dados: DadosJogador): Promise<void> {
  const atual = await obterJogadorDaPelada(db, idPeladaJogador);
  if (!atual) throw new ErroValidacao('Esse jogador não está mais na pelada.');
  const nome = validarNome(dados.nome);
  await garantirNomeLivre(db, atual.idPelada, nome, atual.idJogador);
  const agora = agoraIso();
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE Jogador SET nome = ?, atualizadoEm = ? WHERE idJogador = ?', nome, agora, atual.idJogador);
    await db.runAsync(
      'UPDATE PeladaJogador SET posicao = ?, convidado = ?, atualizadoEm = ? WHERE idPeladaJogador = ?',
      dados.posicao,
      dados.convidado ? 1 : 0,
      agora,
      idPeladaJogador,
    );
  });
}

/** Tira o jogador desta pelada. A pessoa continua existindo nas outras peladas e no histórico. */
export async function removerJogadorDaPelada(db: Banco, idPeladaJogador: string): Promise<void> {
  const agora = agoraIso();
  await db.runAsync(
    'UPDATE PeladaJogador SET excluidoEm = ?, atualizadoEm = ? WHERE idPeladaJogador = ?',
    agora,
    agora,
    idPeladaJogador,
  );
}
