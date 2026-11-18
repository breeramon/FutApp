// Regras de data e horário das peladas. Funções puras: recebem a data "agora" para dar para testar.

export const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;
export const DIAS_SEMANA_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

/** Aceita "19:00", "7:30" e "19h"; devolve "19:00" / "07:30" ou null se for inválido. */
export function normalizarHorario(texto: string): string | null {
  const limpo = texto.trim().toLowerCase();
  if (!limpo) return null;
  const m = /^(\d{1,2})(?::|h)?(\d{2})?h?$/.exec(limpo);
  if (!m) return null;
  const hora = Number(m[1]);
  const minuto = m[2] ? Number(m[2]) : 0;
  if (hora > 23 || minuto > 59) return null;
  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
}

/** "Quinta, 19h" / "Quinta, 19h30" / "Quinta" / null. */
export function descreverAgenda(diaSemana: number | null, horario: string | null): string | null {
  if (diaSemana === null) return null;
  const dia = DIAS_SEMANA[diaSemana];
  if (!horario) return dia;
  const [h, m] = horario.split(':');
  return `${dia}, ${Number(h)}h${m === '00' ? '' : m}`;
}

/**
 * Próxima data da pelada a partir de `agora`. Se for hoje e o horário ainda não passou
 * (com 2 horas de tolerância, para o jogo em andamento), é hoje.
 */
export function proximaData(diaSemana: number, horario: string | null, agora: Date): Date {
  const [h, m] = (horario ?? '00:00').split(':').map(Number);
  const data = new Date(agora);
  data.setHours(h, m, 0, 0);
  let diasAte = (diaSemana - agora.getDay() + 7) % 7;
  const limite = new Date(data.getTime() + 2 * 60 * 60 * 1000);
  if (diasAte === 0 && agora > limite) diasAte = 7;
  data.setDate(data.getDate() + diasAte);
  return data;
}

/** Entre as peladas com dia marcado, a que acontece primeiro. */
export function proximaPelada<T extends { diaSemana: number | null; horario: string | null }>(
  peladas: readonly T[],
  agora: Date,
): (T & { data: Date }) | null {
  let melhor: (T & { data: Date }) | null = null;
  for (const p of peladas) {
    if (p.diaSemana === null) continue;
    const data = proximaData(p.diaSemana, p.horario, agora);
    if (!melhor || data < melhor.data) melhor = { ...p, data };
  }
  return melhor;
}

/** "Hoje, 19h", "Amanhã, 19h" ou "Quinta, 19h". */
export function descreverQuando(data: Date, horario: string | null, agora: Date): string {
  const inicio = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((inicio(data) - inicio(agora)) / 86_400_000);
  const dia = dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : DIAS_SEMANA[data.getDay()];
  if (!horario) return dia;
  const [h, m] = horario.split(':');
  return `${dia}, ${Number(h)}h${m === '00' ? '' : m}`;
}

/** "Boa tarde" etc., para a saudação da tela inicial. */
export function saudacao(agora: Date): string {
  const h = agora.getHours();
  if (h < 5) return 'Boa noite';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}
