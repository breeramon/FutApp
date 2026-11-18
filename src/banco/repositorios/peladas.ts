// Tudo o que o app lê e grava sobre peladas. As telas chamam estas funções; nenhuma tela escreve SQL.

import type { CodigoModalidade, Modalidade } from '../../tipos/modelos';
import { limparNome } from '../../dominio/texto.ts';
import { gerarId } from '../id.ts';
import { agoraIso, ErroValidacao, type Banco } from './comum.ts';

/** A pelada com o que as telas precisam mostrar dela (modalidade e contagem de jogadores). */
export interface ResumoPelada {
  idPelada: string;
  nome: string;
  idModalidadePadrao: string;
  nomeModalidade: string;
  codigoModalidade: CodigoModalidade;
  jogadoresPorTime: number;
  diaSemana: number | null;
  horario: string | null;
  totalJogadores: number;
  totalGoleiros: number;
}

export interface DadosPelada {
  nome: string;
  idModalidadePadrao: string;
  diaSemana: number | null;
  horario: string | null;
}

// Convidados não contam no total da pelada: eles só jogam no dia em que foram adicionados.
const SELECT_RESUMO = `
  SELECT p.idPelada, p.nome, p.idModalidadePadrao, p.diaSemana, p.horario,
         m.nome AS nomeModalidade, m.codigo AS codigoModalidade, m.jogadoresPorTime,
         COUNT(pj.idPeladaJogador) AS totalJogadores,
         COALESCE(SUM(pj.posicao = 'GOL'), 0) AS totalGoleiros
  FROM Pelada p
  JOIN Modalidade m ON m.idModalidade = p.idModalidadePadrao
  LEFT JOIN PeladaJogador pj
    ON pj.idPelada = p.idPelada AND pj.excluidoEm IS NULL AND pj.convidado = 0
  WHERE p.excluidoEm IS NULL`;

export async function listarModalidades(db: Banco): Promise<Modalidade[]> {
  return db.getAllAsync<Modalidade>(
    'SELECT * FROM Modalidade WHERE excluidoEm IS NULL ORDER BY jogadoresPorTime DESC',
  );
}

export async function listarPeladas(db: Banco): Promise<ResumoPelada[]> {
  return db.getAllAsync<ResumoPelada>(`${SELECT_RESUMO} GROUP BY p.idPelada ORDER BY p.nome COLLATE NOCASE`);
}

export async function obterPelada(db: Banco, idPelada: string): Promise<ResumoPelada | null> {
  return db.getFirstAsync<ResumoPelada>(`${SELECT_RESUMO} AND p.idPelada = ? GROUP BY p.idPelada`, idPelada);
}

function validar(dados: DadosPelada): DadosPelada {
  const nome = limparNome(dados.nome);
  if (!nome) throw new ErroValidacao('Dê um nome para a pelada.', 'nome');
  if (nome.length > 60) throw new ErroValidacao('Use um nome com até 60 letras.', 'nome');
  if (dados.horario !== null && dados.diaSemana === null) {
    throw new ErroValidacao('Escolha o dia da semana do horário.', 'diaSemana');
  }
  return { ...dados, nome };
}

/** Cria a pelada e devolve o id dela. */
export async function criarPelada(db: Banco, dados: DadosPelada): Promise<string> {
  const d = validar(dados);
  const idPelada = gerarId();
  await db.runAsync(
    'INSERT INTO Pelada (idPelada, nome, idModalidadePadrao, diaSemana, horario) VALUES (?, ?, ?, ?, ?)',
    idPelada,
    d.nome,
    d.idModalidadePadrao,
    d.diaSemana,
    d.horario,
  );
  return idPelada;
}

export async function atualizarPelada(db: Banco, idPelada: string, dados: DadosPelada): Promise<void> {
  const d = validar(dados);
  await db.runAsync(
    `UPDATE Pelada SET nome = ?, idModalidadePadrao = ?, diaSemana = ?, horario = ?, atualizadoEm = ?
     WHERE idPelada = ? AND excluidoEm IS NULL`,
    d.nome,
    d.idModalidadePadrao,
    d.diaSemana,
    d.horario,
    agoraIso(),
    idPelada,
  );
}

/** Exclusão lógica: a pelada some das listas, mas continua no banco (útil para a sincronização futura). */
export async function excluirPelada(db: Banco, idPelada: string): Promise<void> {
  const agora = agoraIso();
  await db.runAsync('UPDATE Pelada SET excluidoEm = ?, atualizadoEm = ? WHERE idPelada = ?', agora, agora, idPelada);
}
