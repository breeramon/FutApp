import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { obterPelada } from '@/banco/repositorios/peladas';
import { Aviso, Botao, BotaoIcone, Cabecalho, Carregando, Chip, EstadoVazio, ItemLista, Tela } from '@/componentes';
import { descreverAgenda } from '@/dominio/agenda';
import { useDadosDaTela } from '@/hooks/useDadosDaTela';
import { espaco, texto } from '@/tema/tema';

/** Tela da pelada (tela 2 dos mockups): resumo, ação principal e atalhos. */
export default function TelaPelada() {
  const { idPelada } = useLocalSearchParams<{ idPelada: string }>();
  const { dados: pelada } = useDadosDaTela(`pelada-${idPelada}`, (db) => obterPelada(db, idPelada));

  if (pelada === undefined) {
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  }

  if (pelada === null) {
    return (
      <Tela>
        <Cabecalho titulo="Pelada" onVoltar={() => router.back()} />
        <EstadoVazio icone="alerta" titulo="Pelada não encontrada" mensagem="Ela pode ter sido excluída." />
      </Tela>
    );
  }

  const irPara = (tela: 'editar' | 'jogadores') =>
    router.push({ pathname: `/pelada/[idPelada]/${tela}`, params: { idPelada } });
  const agenda = descreverAgenda(pelada.diaSemana, pelada.horario);
  const vagas = pelada.jogadoresPorTime * 2;

  return (
    <Tela>
      <Cabecalho
        titulo={pelada.nome}
        onVoltar={() => router.back()}
        acao={<BotaoIcone icone="editar" rotulo="Editar pelada" onPress={() => irPara('editar')} />}
      />

      <View style={styles.chips}>
        <Chip rotulo={pelada.nomeModalidade} />
        <Chip rotulo={pelada.totalJogadores === 1 ? '1 jogador' : `${pelada.totalJogadores} jogadores`} />
        <Chip rotulo={pelada.totalGoleiros === 1 ? '1 goleiro' : `${pelada.totalGoleiros} goleiros`} />
        {agenda ? <Chip icone="calendario" rotulo={agenda} /> : null}
      </View>

      <View style={styles.acao}>
        <Botao titulo="Novo dia de jogo" icone="adicionar" desativado />
        <Text style={[texto.apoio, styles.centro]}>O dia de jogo e o sorteio chegam na próxima etapa.</Text>
      </View>

      {pelada.totalJogadores < vagas ? (
        <Aviso
          mensagem={
            pelada.totalJogadores === 0
              ? 'Comece cadastrando os jogadores da pelada. Você só precisa fazer isso uma vez.'
              : `Para ${pelada.nomeModalidade.toLowerCase()} com 2 times são ${vagas} jogadores. Cadastre a turma toda para o sorteio ficar completo.`
          }
        />
      ) : null}

      <View style={styles.lista}>
        <ItemLista titulo="Jogadores" detalhe={String(pelada.totalJogadores)} onPress={() => irPara('jogadores')} />
        <ItemLista titulo="Restrições" detalhe="Em breve" />
        <ItemLista titulo="Histórico" detalhe="Em breve" />
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  acao: { gap: espaco.sm, marginVertical: espaco.xxl },
  centro: { textAlign: 'center' },
  lista: { marginTop: espaco.lg },
});
