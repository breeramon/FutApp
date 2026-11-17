/// <reference types="node" />
// Testes da lógica de sorteio. Rodam com o executor de testes do próprio Node: npm test
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { sortearTimes, type JogadorSorteio } from './sorteio.ts';

/** Gerador aleatório com semente: o mesmo número gera sempre a mesma sequência, então o teste é reproduzível. */
function geradorComSemente(semente: number): () => number {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cria presentes: `goleiros` goleiros e o resto distribuído entre ZAG, MEI e ATA. */
function presentes(total: number, goleiros: number): JogadorSorteio[] {
  const linha = ['ZAG', 'MEI', 'ATA'] as const;
  return Array.from({ length: total }, (_, i) => ({
    idJogador: `j${i + 1}`,
    nome: `Jogador ${String(i + 1).padStart(2, '0')}`,
    posicao: i < goleiros ? 'GOL' : linha[i % 3],
  }));
}

const SEMENTES = Array.from({ length: 50 }, (_, i) => i + 1);

describe('sortearTimes', () => {
  it('19 presentes em 4 times de futsal: 5, 5, 5 e um time 4/5', () => {
    const r = sortearTimes({ jogadores: presentes(19, 4), quantidadeTimes: 4, jogadoresPorTime: 5, aleatorio: geradorComSemente(1) });
    assert.deepEqual(r.times.map((t) => t.jogadores.length), [5, 5, 5, 4]);
    assert.deepEqual(r.times.map((t) => t.completo), [true, true, true, false]);
    assert.equal(r.reservas.length, 0);
  });

  it('todo presente aparece uma única vez (em um time ou na reserva)', () => {
    for (const semente of SEMENTES) {
      const jogadores = presentes(23, 3);
      const r = sortearTimes({ jogadores, quantidadeTimes: 4, jogadoresPorTime: 5, aleatorio: geradorComSemente(semente) });
      const ids = [...r.times.flatMap((t) => t.jogadores), ...r.reservas].map((j) => j.idJogador).sort();
      assert.deepEqual(ids, jogadores.map((j) => j.idJogador).sort());
      assert.equal(r.reservas.length, 3);
    }
  });

  it('com 3 goleiros e 4 times, um time fica sem goleiro e ganha ordem de revezamento', () => {
    for (const semente of SEMENTES) {
      const r = sortearTimes({ jogadores: presentes(19, 3), quantidadeTimes: 4, jogadoresPorTime: 5, aleatorio: geradorComSemente(semente) });
      const semGoleiro = r.times.filter((t) => t.semGoleiro);
      assert.equal(semGoleiro.length, 1);
      const time = semGoleiro[0];
      assert.equal(time.ordemGoleiro.length, time.jogadores.length);
      assert.deepEqual([...time.ordemGoleiro].sort(), time.jogadores.map((j) => j.idJogador).sort());
      for (const t of r.times.filter((t) => !t.semGoleiro)) {
        assert.equal(t.jogadores.filter((j) => j.posicao === 'GOL').length, 1);
        assert.deepEqual(t.ordemGoleiro, []);
      }
    }
  });

  it('goleiro não fica de reserva enquanto faltar goleiro em algum time', () => {
    for (const semente of SEMENTES) {
      const r = sortearTimes({ jogadores: presentes(26, 2), quantidadeTimes: 4, jogadoresPorTime: 5, aleatorio: geradorComSemente(semente) });
      assert.equal(r.reservas.filter((j) => j.posicao === 'GOL').length, 0);
    }
  });

  it('jogadores dentro do time ficam ordenados por posição e depois por nome', () => {
    const jogadores: JogadorSorteio[] = [
      { idJogador: 'a', nome: 'Zeca', posicao: 'ATA' },
      { idJogador: 'b', nome: 'André', posicao: 'ATA' },
      { idJogador: 'c', nome: 'Bruno', posicao: 'MEI' },
      { idJogador: 'd', nome: 'Carlos', posicao: 'GOL' },
      { idJogador: 'e', nome: 'Davi', posicao: 'ZAG' },
      { idJogador: 'f', nome: 'Edu', posicao: 'ATA' },
    ];
    const r = sortearTimes({ jogadores, quantidadeTimes: 2, jogadoresPorTime: 5, aleatorio: geradorComSemente(7) });
    for (const t of r.times) {
      const ordenado = [...t.jogadores].sort(
        (x, y) => 'GOL ZAG MEI ATA'.indexOf(x.posicao) - 'GOL ZAG MEI ATA'.indexOf(y.posicao) || x.nome.localeCompare(y.nome, 'pt-BR'),
      );
      assert.deepEqual(t.jogadores, ordenado);
    }
  });

  it('respeita "sempre juntos" e "nunca juntos"', () => {
    for (const semente of SEMENTES) {
      const r = sortearTimes({
        jogadores: presentes(20, 4),
        quantidadeTimes: 4,
        jogadoresPorTime: 5,
        restricoes: [
          { idJogadorA: 'j5', idJogadorB: 'j6', tipo: 'juntos' },
          { idJogadorA: 'j6', idJogadorB: 'j7', tipo: 'juntos' },
          { idJogadorA: 'j8', idJogadorB: 'j9', tipo: 'separados' },
        ],
        aleatorio: geradorComSemente(semente),
      });
      const timeDe = (id: string) => r.times.findIndex((t) => t.jogadores.some((j) => j.idJogador === id));
      assert.equal(timeDe('j5'), timeDe('j6'));
      assert.equal(timeDe('j6'), timeDe('j7'));
      assert.notEqual(timeDe('j8'), timeDe('j9'));
      assert.deepEqual(r.avisos, []);
    }
  });

  it('reserva justo: quem ficou de fora no último jogo entra agora', () => {
    for (const semente of SEMENTES) {
      const r = sortearTimes({
        jogadores: presentes(24, 4),
        quantidadeTimes: 4,
        jogadoresPorTime: 5,
        reservasAnteriores: ['j10', 'j15', 'j20', 'j24'],
        aleatorio: geradorComSemente(semente),
      });
      const reservas = r.reservas.map((j) => j.idJogador);
      for (const id of ['j10', 'j15', 'j20', 'j24']) assert.ok(!reservas.includes(id), `${id} ficou de reserva de novo`);
    }
  });

  it('dá nome padrão e cores diferentes para cada time', () => {
    const r = sortearTimes({ jogadores: presentes(20, 4), quantidadeTimes: 4, jogadoresPorTime: 5, aleatorio: geradorComSemente(3) });
    assert.deepEqual(r.times.map((t) => t.nome), ['Time A', 'Time B', 'Time C', 'Time D']);
    assert.equal(new Set(r.times.map((t) => t.cor)).size, 4);
  });

  it('recusa sortear com menos presentes do que times', () => {
    assert.throws(() => sortearTimes({ jogadores: presentes(3, 0), quantidadeTimes: 4, jogadoresPorTime: 5 }));
  });
});
