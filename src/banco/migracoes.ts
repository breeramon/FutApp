import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Versão do banco que este código espera. Toda vez que mudarmos a estrutura
 * (criar tabela, adicionar coluna), sobe 1 aqui e entra um novo bloco em MIGRACOES.
 */
export const VERSAO_BANCO = 1;

/** IDs fixos das modalidades: iguais em todo aparelho, o que facilita a sincronização futura. */
export const ID_MODALIDADE = {
  futebol: '0b6f0a52-6a1f-4c51-9d0e-1f1a7c3b0001',
  fut7: '0b6f0a52-6a1f-4c51-9d0e-1f1a7c3b0002',
  futsal: '0b6f0a52-6a1f-4c51-9d0e-1f1a7c3b0003',
} as const;

// Colunas de controle repetidas em quase toda tabela.
const AUDITORIA = `
  criadoEm TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  atualizadoEm TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  excluidoEm TEXT`;

const MIGRACAO_1 = `
CREATE TABLE Modalidade (
  idModalidade TEXT PRIMARY KEY NOT NULL,
  codigo TEXT NOT NULL UNIQUE CHECK (codigo IN ('futebol', 'fut7', 'futsal')),
  nome TEXT NOT NULL,
  jogadoresPorTime INTEGER NOT NULL CHECK (jogadoresPorTime > 0),
  goleirosPorTime INTEGER NOT NULL DEFAULT 1,${AUDITORIA}
);

CREATE TABLE Configuracao (
  chave TEXT PRIMARY KEY NOT NULL,
  valor TEXT NOT NULL,
  atualizadoEm TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE Pelada (
  idPelada TEXT PRIMARY KEY NOT NULL,
  nome TEXT NOT NULL,
  idModalidadePadrao TEXT NOT NULL REFERENCES Modalidade (idModalidade),
  diaSemana INTEGER CHECK (diaSemana BETWEEN 0 AND 6),
  horario TEXT,${AUDITORIA}
);

CREATE TABLE Jogador (
  idJogador TEXT PRIMARY KEY NOT NULL,
  nome TEXT NOT NULL,${AUDITORIA}
);

CREATE TABLE PeladaJogador (
  idPeladaJogador TEXT PRIMARY KEY NOT NULL,
  idPelada TEXT NOT NULL REFERENCES Pelada (idPelada),
  idJogador TEXT NOT NULL REFERENCES Jogador (idJogador),
  posicao TEXT NOT NULL CHECK (posicao IN ('GOL', 'ZAG', 'MEI', 'ATA')),
  convidado INTEGER NOT NULL DEFAULT 0 CHECK (convidado IN (0, 1)),${AUDITORIA},
  UNIQUE (idPelada, idJogador)
);

CREATE TABLE JogadorApelido (
  idJogadorApelido TEXT PRIMARY KEY NOT NULL,
  idJogador TEXT NOT NULL REFERENCES Jogador (idJogador),
  apelido TEXT NOT NULL,${AUDITORIA}
);

CREATE TABLE Restricao (
  idRestricao TEXT PRIMARY KEY NOT NULL,
  idPelada TEXT NOT NULL REFERENCES Pelada (idPelada),
  idJogadorA TEXT NOT NULL REFERENCES Jogador (idJogador),
  idJogadorB TEXT NOT NULL REFERENCES Jogador (idJogador),
  tipo TEXT NOT NULL CHECK (tipo IN ('juntos', 'separados')),${AUDITORIA},
  CHECK (idJogadorA <> idJogadorB)
);

CREATE TABLE DiaDeJogo (
  idDiaDeJogo TEXT PRIMARY KEY NOT NULL,
  idPelada TEXT NOT NULL REFERENCES Pelada (idPelada),
  idModalidade TEXT NOT NULL REFERENCES Modalidade (idModalidade),
  data TEXT NOT NULL,
  quantidadeTimes INTEGER NOT NULL CHECK (quantidadeTimes >= 2),
  status TEXT NOT NULL DEFAULT 'presenca'
    CHECK (status IN ('presenca', 'sorteado', 'emAndamento', 'encerrado')),
  regraRodizio TEXT NOT NULL DEFAULT 'ganhouFica' CHECK (regraRodizio IN ('ganhouFica', 'doisSaem')),
  limiteGols INTEGER,
  limiteMinutos INTEGER,${AUDITORIA}
);

CREATE TABLE Presenca (
  idPresenca TEXT PRIMARY KEY NOT NULL,
  idDiaDeJogo TEXT NOT NULL REFERENCES DiaDeJogo (idDiaDeJogo),
  idJogador TEXT NOT NULL REFERENCES Jogador (idJogador),
  origem TEXT NOT NULL DEFAULT 'manual' CHECK (origem IN ('manual', 'lista')),${AUDITORIA},
  UNIQUE (idDiaDeJogo, idJogador)
);

CREATE TABLE Time (
  idTime TEXT PRIMARY KEY NOT NULL,
  idDiaDeJogo TEXT NOT NULL REFERENCES DiaDeJogo (idDiaDeJogo),
  nome TEXT NOT NULL,
  cor TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  posicaoFila INTEGER,
  trocaGoleiro TEXT NOT NULL DEFAULT 'golSofrido' CHECK (trocaGoleiro IN ('golSofrido', 'minutos', 'partida')),
  trocaGoleiroMinutos INTEGER,${AUDITORIA}
);

CREATE TABLE Escalacao (
  idEscalacao TEXT PRIMARY KEY NOT NULL,
  idDiaDeJogo TEXT NOT NULL REFERENCES DiaDeJogo (idDiaDeJogo),
  idJogador TEXT NOT NULL REFERENCES Jogador (idJogador),
  idTime TEXT REFERENCES Time (idTime),
  ordemGoleiro INTEGER,${AUDITORIA},
  UNIQUE (idDiaDeJogo, idJogador)
);

CREATE TABLE Partida (
  idPartida TEXT PRIMARY KEY NOT NULL,
  idDiaDeJogo TEXT NOT NULL REFERENCES DiaDeJogo (idDiaDeJogo),
  numero INTEGER NOT NULL,
  idTimeA TEXT NOT NULL REFERENCES Time (idTime),
  idTimeB TEXT NOT NULL REFERENCES Time (idTime),
  idTimeVencedor TEXT REFERENCES Time (idTime),
  iniciadaEm TEXT NOT NULL,
  encerradaEm TEXT,${AUDITORIA},
  UNIQUE (idDiaDeJogo, numero)
);

CREATE TABLE Gol (
  idGol TEXT PRIMARY KEY NOT NULL,
  idPartida TEXT NOT NULL REFERENCES Partida (idPartida),
  idTime TEXT NOT NULL REFERENCES Time (idTime),
  idJogador TEXT REFERENCES Jogador (idJogador),
  contra INTEGER NOT NULL DEFAULT 0 CHECK (contra IN (0, 1)),
  momentoSegundos INTEGER NOT NULL DEFAULT 0,${AUDITORIA}
);

-- Índices nas chaves estrangeiras mais consultadas.
CREATE INDEX ixPeladaJogador_idJogador ON PeladaJogador (idJogador);
CREATE INDEX ixJogadorApelido_idJogador ON JogadorApelido (idJogador);
CREATE INDEX ixRestricao_idPelada ON Restricao (idPelada);
CREATE INDEX ixDiaDeJogo_idPelada ON DiaDeJogo (idPelada, data);
CREATE INDEX ixTime_idDiaDeJogo ON Time (idDiaDeJogo);
CREATE INDEX ixEscalacao_idTime ON Escalacao (idTime);
CREATE INDEX ixGol_idPartida ON Gol (idPartida);

INSERT INTO Modalidade (idModalidade, codigo, nome, jogadoresPorTime, goleirosPorTime) VALUES
  ('${ID_MODALIDADE.futebol}', 'futebol', 'Futebol', 11, 1),
  ('${ID_MODALIDADE.fut7}', 'fut7', 'Fut7', 7, 1),
  ('${ID_MODALIDADE.futsal}', 'futsal', 'Futsal', 5, 1);

INSERT INTO Configuracao (chave, valor) VALUES
  ('somCronometro', '1'),
  ('telaLigada', '1');
`;

/** Cada posição do array leva o banco da versão i para a versão i + 1. */
const MIGRACOES: string[] = [MIGRACAO_1];

/**
 * Roda ao abrir o app (pelo SQLiteProvider). Liga as configurações do SQLite
 * e aplica, em ordem, as migrações que o banco ainda não recebeu.
 */
export async function migrarBanco(db: SQLiteDatabase): Promise<void> {
  // WAL deixa leitura e escrita mais rápidas; foreign_keys faz o SQLite respeitar as chaves estrangeiras.
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const linha = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let versaoAtual = linha?.user_version ?? 0;

  while (versaoAtual < VERSAO_BANCO) {
    const sql = MIGRACOES[versaoAtual];
    // Transação: ou a migração inteira entra, ou nada entra.
    await db.withTransactionAsync(async () => {
      await db.execAsync(sql);
    });
    versaoAtual += 1;
    await db.execAsync(`PRAGMA user_version = ${versaoAtual}`);
  }
}
