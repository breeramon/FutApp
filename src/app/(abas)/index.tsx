import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { listarPeladas, type ResumoPelada } from '@/banco/repositorios/peladas';
import { Avatar, Botao, Cabecalho, Card, Carregando, Chip, EstadoVazio, ItemLista, Tela, TituloSecao } from '@/componentes';
import { descreverAgenda, descreverQuando, proximaPelada, saudacao } from '@/dominio/agenda';
import { useDadosDaTela } from '@/hooks/useDadosDaTela';
import { cores, espaco, raio, texto } from '@/tema/tema';

/** Tela inicial: o próximo jogo em destaque e a lista de peladas. */
export default function Inicio() {
  const { dados: peladas } = useDadosDaTela('peladas', listarPeladas);
  const agora = new Date();

  if (!peladas) {
    return (
      <Tela espacoNavegacao>
        <Carregando />
      </Tela>
    );
  }

  const proxima = proximaPelada(peladas, agora);
  const abrir = (p: ResumoPelada) => router.push({ pathname: '/pelada/[idPelada]', params: { idPelada: p.idPelada } });
  const criar = () => router.push('/pelada/nova');

  return (
    <Tela espacoNavegacao>
      <Cabecalho titulo={saudacao(agora)} grande />

      {peladas.length === 0 ? (
        <EstadoVazio
          icone="bola"
          titulo="Nenhuma pelada ainda"
          mensagem="Crie a sua pelada, cadastre a turma uma vez e depois é só marcar quem veio e sortear."
          acao={<Botao titulo="Criar pelada" icone="adicionar" onPress={criar} />}
        />
      ) : (
        <>
          <View style={styles.chips}>
            {proxima ? <Chip icone="calendario" rotulo={`Próximo: ${descreverQuando(proxima.data, proxima.horario, agora)}`} /> : null}
            <Chip icone="pessoas" rotulo={peladas.length === 1 ? '1 pelada' : `${peladas.length} peladas`} />
          </View>

          {proxima ? (
            <View style={styles.secao}>
              <TituloSecao titulo="Próximo jogo" />
              <Card style={styles.cardJogo}>
                <View style={styles.faixa}>
                  <Text style={styles.selo}>{proxima.nomeModalidade}</Text>
                </View>
                <View style={styles.cardCorpo}>
                  <Text style={styles.nomeJogo}>{proxima.nome}</Text>
                  <Text style={texto.apoio}>
                    {descreverQuando(proxima.data, proxima.horario, agora)} · {proxima.totalJogadores} jogadores
                  </Text>
                  <Botao titulo="Abrir pelada" onPress={() => abrir(proxima)} style={styles.botaoJogo} />
                </View>
              </Card>
            </View>
          ) : null}

          <View style={styles.secao}>
            <TituloSecao titulo="Suas peladas" acao={<Botao titulo="Criar nova" variante="texto" onPress={criar} />} />
            {peladas.map((p) => (
              <ItemLista
                key={p.idPelada}
                titulo={p.nome}
                subtitulo={[p.nomeModalidade, `${p.totalJogadores} jogadores`, descreverAgenda(p.diaSemana, p.horario)]
                  .filter(Boolean)
                  .join(' · ')}
                inicio={<Avatar nome={p.nome} />}
                onPress={() => abrir(p)}
              />
            ))}
          </View>
        </>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm, marginBottom: espaco.sm },
  secao: { marginTop: espaco.xxl },
  cardJogo: { padding: 0, overflow: 'hidden' },
  faixa: { height: 72, backgroundColor: cores.primaria, padding: espaco.md },
  selo: {
    alignSelf: 'flex-start',
    backgroundColor: cores.fundo,
    color: cores.texto,
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: raio.pilula,
    overflow: 'hidden',
  },
  cardCorpo: { padding: espaco.lg, gap: 4 },
  nomeJogo: { fontSize: 17, fontWeight: '600', color: cores.texto },
  botaoJogo: { marginTop: espaco.md },
});
