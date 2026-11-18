/// <reference types="node" />
// Testes dos repositórios contra um SQLite de verdade (em memória), com as tabelas da migração.
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { ID_MODALIDADE } from '../migracoes.ts';
import { criarBancoDeTeste } from './bancoTeste.ts';
import type { Banco } from './comum.ts';
import {
  adicionarJogadorExistente,
  adicionarJogadorNovo,
  atualizarJogadorDaPelada,
  buscarJogadoresDeOutrasPeladas,
  listarJogadoresDaPelada,
  removerJogadorDaPelada,
} from './jogadores.ts';
import { atualizarPelada, criarPelada, excluirPelada, listarPeladas, obterPelada } from './peladas.ts';

let db: Banco;
const futsal = { idModalidadePadrao: ID_MODALIDADE.futsal, diaSemana: 4, horario: '19:00' };

beforeEach(async () => {
  db = await criarBancoDeTeste();
});

describe('peladas', () => {
  it('cria, lista, edita e exclui', async () => {
    const id = await criarPelada(db, { ...futsal, nome: '  Fut   de quinta ' });
    let p = await obterPelada(db, id);
    assert.equal(p?.nome, 'Fut de quinta');
    assert.equal(p?.codigoModalidade, 'futsal');
    assert.equal(p?.totalJogadores, 0);

    await atualizarPelada(db, id, { ...futsal, nome: 'Fut de quinta', idModalidadePadrao: ID_MODALIDADE.fut7 });
    p = await obterPelada(db, id);
    assert.equal(p?.codigoModalidade, 'fut7');

    await excluirPelada(db, id);
    assert.equal(await obterPelada(db, id), null);
    assert.equal((await listarPeladas(db)).length, 0);
  });

  it('recusa pelada sem nome e horário sem dia', async () => {
    await assert.rejects(criarPelada(db, { ...futsal, nome: '   ' }), /nome/);
    await assert.rejects(criarPelada(db, { ...futsal, nome: 'X', diaSemana: null }), /dia da semana/);
  });

  it('conta jogadores e goleiros sem contar convidados', async () => {
    const id = await criarPelada(db, { ...futsal, nome: 'Quinta' });
    await adicionarJogadorNovo(db, id, { nome: 'Carlos', posicao: 'GOL', convidado: false });
    await adicionarJogadorNovo(db, id, { nome: 'Breno', posicao: 'MEI', convidado: false });
    await adicionarJogadorNovo(db, id, { nome: 'Gustavo', posicao: 'ATA', convidado: true });
    const p = await obterPelada(db, id);
    assert.equal(p?.totalJogadores, 2);
    assert.equal(p?.totalGoleiros, 1);
  });
});

describe('jogadores', () => {
  it('lista em ordem alfabética do português', async () => {
    const id = await criarPelada(db, { ...futsal, nome: 'Quinta' });
    for (const nome of ['Érico', 'bruno', 'Ana', 'Davi']) {
      await adicionarJogadorNovo(db, id, { nome, posicao: 'ZAG', convidado: false });
    }
    const nomes = (await listarJogadoresDaPelada(db, id)).map((j) => j.nome);
    assert.deepEqual(nomes, ['Ana', 'bruno', 'Davi', 'Érico']);
  });

  it('não deixa repetir nome na mesma pelada (ignorando acentos)', async () => {
    const id = await criarPelada(db, { ...futsal, nome: 'Quinta' });
    await adicionarJogadorNovo(db, id, { nome: 'José', posicao: 'ZAG', convidado: false });
    await assert.rejects(adicionarJogadorNovo(db, id, { nome: 'jose', posicao: 'ATA', convidado: false }), /Já existe/);
  });

  it('a mesma pessoa joga em duas peladas com posições diferentes', async () => {
    const quinta = await criarPelada(db, { ...futsal, nome: 'Quinta' });
    const sabado = await criarPelada(db, { ...futsal, nome: 'Sábado', idModalidadePadrao: ID_MODALIDADE.fut7 });
    await adicionarJogadorNovo(db, quinta, { nome: 'Carlos Mota', posicao: 'GOL', convidado: false });

    const sugestoes = await buscarJogadoresDeOutrasPeladas(db, sabado, 'carl');
    assert.equal(sugestoes.length, 1);
    assert.equal(sugestoes[0].posicaoSugerida, 'GOL');
    assert.equal(sugestoes[0].peladas, 'Quinta');

    await adicionarJogadorExistente(db, sabado, sugestoes[0].idJogador, 'ATA', false);
    const [noSabado] = await listarJogadoresDaPelada(db, sabado);
    const [naQuinta] = await listarJogadoresDaPelada(db, quinta);
    assert.equal(noSabado.idJogador, naQuinta.idJogador);
    assert.equal(noSabado.posicao, 'ATA');
    assert.equal(naQuinta.posicao, 'GOL');

    // Já está no sábado: não aparece mais como sugestão lá.
    assert.equal((await buscarJogadoresDeOutrasPeladas(db, sabado, 'carl')).length, 0);
  });

  it('editar o nome muda em todas as peladas; posição só na pelada editada', async () => {
    const quinta = await criarPelada(db, { ...futsal, nome: 'Quinta' });
    const sabado = await criarPelada(db, { ...futsal, nome: 'Sábado' });
    const idPJ = await adicionarJogadorNovo(db, quinta, { nome: 'Caio', posicao: 'ATA', convidado: false });
    const [caio] = await listarJogadoresDaPelada(db, quinta);
    await adicionarJogadorExistente(db, sabado, caio.idJogador, 'ATA', false);

    await atualizarJogadorDaPelada(db, idPJ, { nome: 'Caio Rocha', posicao: 'MEI', convidado: false });
    const [naQuinta] = await listarJogadoresDaPelada(db, quinta);
    const [noSabado] = await listarJogadoresDaPelada(db, sabado);
    assert.equal(naQuinta.nome, 'Caio Rocha');
    assert.equal(noSabado.nome, 'Caio Rocha');
    assert.equal(naQuinta.posicao, 'MEI');
    assert.equal(noSabado.posicao, 'ATA');
  });

  it('remover e adicionar de novo reaproveita o vínculo antigo', async () => {
    const quinta = await criarPelada(db, { ...futsal, nome: 'Quinta' });
    const sabado = await criarPelada(db, { ...futsal, nome: 'Sábado' });
    const idPJ = await adicionarJogadorNovo(db, quinta, { nome: 'Igor', posicao: 'GOL', convidado: false });
    const [igor] = await listarJogadoresDaPelada(db, quinta);
    await adicionarJogadorExistente(db, sabado, igor.idJogador, 'GOL', false);

    await removerJogadorDaPelada(db, idPJ);
    assert.equal((await listarJogadoresDaPelada(db, quinta)).length, 0);

    const idDeNovo = await adicionarJogadorExistente(db, quinta, igor.idJogador, 'ZAG', true);
    assert.equal(idDeNovo, idPJ);
    const [volta] = await listarJogadoresDaPelada(db, quinta);
    assert.equal(volta.posicao, 'ZAG');
    assert.equal(volta.convidado, 1);
  });
});
