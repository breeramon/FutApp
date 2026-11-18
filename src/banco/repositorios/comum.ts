import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * As partes do banco que os repositórios usam. Recebendo só isso (em vez do banco inteiro),
 * os testes conseguem passar um SQLite de teste que roda no Node.
 */
export type Banco = Pick<SQLiteDatabase, 'execAsync' | 'runAsync' | 'getAllAsync' | 'getFirstAsync' | 'withTransactionAsync'>;

/** Erro de regra de negócio, com uma mensagem pronta para mostrar ao organizador. */
export class ErroValidacao extends Error {
  /** Campo do formulário que causou o erro, para mostrar a mensagem embaixo dele. */
  readonly campo?: string;

  constructor(mensagem: string, campo?: string) {
    super(mensagem);
    this.name = 'ErroValidacao';
    this.campo = campo;
  }
}

/** Data e hora atual no formato gravado no banco (ISO 8601, UTC). */
export function agoraIso(): string {
  return new Date().toISOString();
}
