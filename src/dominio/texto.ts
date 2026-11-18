/**
 * Deixa um nome pronto para comparar: sem acento, minúsculo e sem espaços sobrando.
 * "  José  da Silva " → "jose da silva". Assim "Jose" e "José" contam como o mesmo nome.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Tira espaços duplicados e das pontas, mantendo acentos e maiúsculas como a pessoa digitou. */
export function limparNome(texto: string): string {
  return texto.replace(/\s+/g, ' ').trim();
}

/** Ordem alfabética do português (acentos no lugar certo, sem diferenciar maiúsculas). */
export function compararNomes(a: string, b: string): number {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}
