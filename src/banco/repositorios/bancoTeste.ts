/// <reference types="node" />
// Só para os testes: um banco SQLite em memória, criado com o SQLite que já vem no Node,
// que imita os métodos do expo-sqlite usados pelos repositórios. Não entra no app.

import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

import { migrarBanco } from '../migracoes.ts';
import type { Banco } from './comum.ts';

type Parametros = SQLInputValue[];

function parametros(args: unknown[]): Parametros {
  const lista = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  return lista.map((v) => (v === undefined ? null : v)) as Parametros;
}

/** Cria um banco novo, vazio e já migrado, para cada teste. */
export async function criarBancoDeTeste(): Promise<Banco> {
  const sqlite = new DatabaseSync(':memory:');
  const banco = {
    async execAsync(sql: string) {
      sqlite.exec(sql);
    },
    async runAsync(sql: string, ...args: unknown[]) {
      const r = sqlite.prepare(sql).run(...parametros(args));
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: Number(r.changes) };
    },
    async getAllAsync(sql: string, ...args: unknown[]) {
      return sqlite
        .prepare(sql)
        .all(...parametros(args))
        .map((linha) => ({ ...linha }));
    },
    async getFirstAsync(sql: string, ...args: unknown[]) {
      const linha = sqlite.prepare(sql).get(...parametros(args));
      return linha ? { ...linha } : null;
    },
    async withTransactionAsync(tarefa: () => Promise<void>) {
      sqlite.exec('BEGIN');
      try {
        await tarefa();
        sqlite.exec('COMMIT');
      } catch (erro) {
        sqlite.exec('ROLLBACK');
        throw erro;
      }
    },
  } as unknown as Banco;

  await migrarBanco(banco as Parameters<typeof migrarBanco>[0]);
  return banco;
}
