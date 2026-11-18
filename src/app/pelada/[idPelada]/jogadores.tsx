import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { listarJogadoresDaPelada } from '@/banco/repositorios/jogadores';
import { obterPelada } from '@/banco/repositorios/peladas';
import {
  Avatar,
  Botao,
  Cabecalho,
  CampoBusca,
  Carregando,
  Chip,
  EstadoVazio,
  Etiqueta,
  EtiquetaPosicao,
  ItemLista,
  Tela,
} from '@/componentes';
import { normalizar } from '@/dominio/texto';
import { useDadosDaTela } from '@/hooks/useDadosDaTela';
import { espaco } from '@/tema/tema';
import type { Posicao } from '@/tipos/modelos';

const FILTROS: { valor: Posicao | 'todos'; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'GOL', rotulo: 'Goleiros' },
  { valor: 'ZAG', rotulo: 'Zagueiros' },
  { valor: 'MEI', rotulo: 'Meias' },
  { valor: 'ATA', rotulo: 'Atacantes' },
];

/** Lista de jogadores da pelada (tela 8 dos mockups), com busca e filtro por posição. */
export default function Jogadores() {
  const { idPelada } = useLocalSearchParams<{ idPelada: string }>();
  const { dados } = useDadosDaTela(`jogadores-${idPelada}`, async (db) => ({
    pelada: await obterPelada(db, idPelada),
    jogadores: await listarJogadoresDaPelada(db, idPelada),
  }));
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Posicao | 'todos'>('todos');

  const abrirCadastro = (idPeladaJogador?: string) =>
    router.push({
      pathname: '/pelada/[idPelada]/jogador',
      params: idPeladaJogador ? { idPelada, idPeladaJogador } : { idPelada },
    });

  if (!dados) {
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  }

  const { pelada, jogadores } = dados;
  const termo = normalizar(busca);
  const visiveis = jogadores.filter(
    (j) => (filtro === 'todos' || j.posicao === filtro) && (!termo || normalizar(j.nome).includes(termo)),
  );
  const contar = (valor: Posicao | 'todos') =>
    valor === 'todos' ? jogadores.length : jogadores.filter((j) => j.posicao === valor).length;

  return (
    <Tela rodape={<Botao titulo="Adicionar jogador" icone="adicionar" onPress={() => abrirCadastro()} />}>
      <Cabecalho
        titulo="Jogadores"
        subtitulo={pelada ? `${pelada.nome} · ${jogadores.length} jogadores` : undefined}
        onVoltar={() => router.back()}
      />

      {jogadores.length === 0 ? (
        <EstadoVazio
          icone="pessoas"
          titulo="Nenhum jogador ainda"
          mensagem="Cadastre a turma com nome e posição. Quem já joga em outra pelada sua aparece como sugestão ao digitar o nome."
        />
      ) : (
        <>
          <View style={styles.filtros}>
            <CampoBusca value={busca} onChangeText={setBusca} />
            <View style={styles.chips}>
              {FILTROS.map((f) => (
                <Chip
                  key={f.valor}
                  rotulo={`${f.rotulo} ${contar(f.valor)}`}
                  ativo={filtro === f.valor}
                  onPress={() => setFiltro(f.valor)}
                />
              ))}
            </View>
          </View>

          {visiveis.length === 0 ? (
            <EstadoVazio icone="buscar" titulo="Ninguém encontrado" mensagem="Tente outro nome ou outro filtro." />
          ) : (
            visiveis.map((j) => (
              <ItemLista
                key={j.idPeladaJogador}
                titulo={j.nome}
                inicio={<Avatar nome={j.nome} />}
                fim={
                  <View style={styles.etiquetas}>
                    {j.convidado ? <Etiqueta rotulo="Convidado" tom="alerta" /> : null}
                    <EtiquetaPosicao posicao={j.posicao} />
                  </View>
                }
                seta
                onPress={() => abrirCadastro(j.idPeladaJogador)}
              />
            ))
          )}
        </>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  filtros: { gap: espaco.md, marginBottom: espaco.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  etiquetas: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
