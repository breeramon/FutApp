import { Cabecalho, EstadoVazio, Tela } from '@/componentes';

/** Placeholder: o histórico de dias de jogo chega na etapa 5. */
export default function Historico() {
  return (
    <Tela espacoNavegacao>
      <Cabecalho titulo="Histórico" grande />
      <EstadoVazio
        icone="historico"
        titulo="Nenhum dia de jogo ainda"
        mensagem="Depois do primeiro sorteio, os dias de jogo de todas as peladas aparecem aqui."
      />
    </Tela>
  );
}
