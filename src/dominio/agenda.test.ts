/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { descreverAgenda, descreverQuando, normalizarHorario, proximaData, proximaPelada } from './agenda.ts';
import { normalizar } from './texto.ts';

// 18/11/2026 é uma quarta-feira (getDay() = 3).
const quarta15h = new Date(2026, 10, 18, 15, 0);

describe('agenda', () => {
  it('entende os jeitos comuns de digitar horário', () => {
    assert.equal(normalizarHorario('19:00'), '19:00');
    assert.equal(normalizarHorario('7:30'), '07:30');
    assert.equal(normalizarHorario('19h'), '19:00');
    assert.equal(normalizarHorario('19h30'), '19:30');
    assert.equal(normalizarHorario('25:00'), null);
    assert.equal(normalizarHorario('abc'), null);
    assert.equal(normalizarHorario(''), null);
  });

  it('descreve o dia e horário da pelada', () => {
    assert.equal(descreverAgenda(4, '19:00'), 'Quinta, 19h');
    assert.equal(descreverAgenda(6, '08:30'), 'Sábado, 8h30');
    assert.equal(descreverAgenda(null, '19:00'), null);
  });

  it('calcula a próxima data da pelada', () => {
    assert.equal(proximaData(4, '19:00', quarta15h).getDate(), 19); // quinta seguinte
    assert.equal(proximaData(3, '19:00', quarta15h).getDate(), 18); // hoje, ainda vai acontecer
    assert.equal(proximaData(3, '10:00', quarta15h).getDate(), 25); // hoje já passou: semana que vem
  });

  it('escolhe a pelada que acontece primeiro e ignora as sem dia', () => {
    const p = proximaPelada(
      [
        { nome: 'Sábado', diaSemana: 6, horario: '08:00' },
        { nome: 'Sem dia', diaSemana: null, horario: null },
        { nome: 'Quinta', diaSemana: 4, horario: '19:00' },
      ],
      quarta15h,
    );
    assert.equal(p?.nome, 'Quinta');
    assert.equal(descreverQuando(p!.data, '19:00', quarta15h), 'Amanhã, 19h');
  });

  it('normaliza nomes para comparação', () => {
    assert.equal(normalizar('  José   da Silva '), 'jose da silva');
    assert.equal(normalizar('JOÃO'), normalizar('joao'));
  });
});
