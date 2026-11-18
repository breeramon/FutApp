import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ErroValidacao } from '@/banco/repositorios/comum';
import {
  adicionarJogadorExistente,
  adicionarJogadorNovo,
  atualizarJogadorDaPelada,
  buscarJogadoresDeOutrasPeladas,
  obterJogadorDaPelada,
  removerJogadorDaPelada,
  type SugestaoJogador,
} from '@/banco/repositorios/jogadores';
import {
  Aviso,
  Botao,
  Cabecalho,
  CampoTexto,
  Card,
  Carregando,
  EstadoVazio,
  ItemLista,
  LinhaInterruptor,
  Seletor,
  Tela,
} from '@/componentes';
import { useDadosDaTela } from '@/hooks/useDadosDaTela';
import { espaco, texto } from '@/tema/tema';
import type { Posicao } from '@/tipos/modelos';

const POSICOES = [
  { valor: 'GOL', rotulo: 'Goleiro' },
  { valor: 'ZAG', rotulo: 'Zagueiro' },
  { valor: 'MEI', rotulo: 'Meia' },
  { valor: 'ATA', rotulo: 'Atacante' },
] as const;

/**
 * Cadastro e edição de jogador (tela 9 dos mockups).
 * Sem `idPeladaJogador` nos parâmetros é um jogador novo; com ele, edição.
 */
export default function CadastroJogador() {
  const { idPelada, idPeladaJogador } = useLocalSearchParams<{ idPelada: string; idPeladaJogador?: string }>();
  const editando = !!idPeladaJogador;
  const { dados: existente } = useDadosDaTela(`jogador-${idPeladaJogador ?? 'novo'}`, (db) =>
    idPeladaJogador ? obterJogadorDaPelada(db, idPeladaJogador) : Promise.resolve(null),
  );

  if (editando && existente === undefined) {
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  }

  if (editando && existente === null) {
    return (
      <Tela>
        <Cabecalho titulo="Jogador" onVoltar={() => router.back()} />
        <EstadoVazio icone="alerta" titulo="Jogador não encontrado" mensagem="Ele pode ter sido removido da pelada." />
      </Tela>
    );
  }

  // A `key` recria o formulário quando os dados do jogador chegam, preenchendo os campos.
  return <Formulario key={existente?.idPeladaJogador ?? 'novo'} idPelada={idPelada} jogador={existente ?? null} />;
}

interface FormularioProps {
  idPelada: string;
  jogador: Awaited<ReturnType<typeof obterJogadorDaPelada>>;
}

function Formulario({ idPelada, jogador }: FormularioProps) {
  const db = useSQLiteContext();
  const editando = !!jogador;
  const [nome, setNome] = useState(jogador?.nome ?? '');
  const [posicao, setPosicao] = useState<Posicao>(jogador?.posicao ?? 'MEI');
  const [convidado, setConvidado] = useState(jogador ? jogador.convidado === 1 : false);
  // Quando a pessoa escolhe uma sugestão, o cadastro vira "trazer jogador de outra pelada".
  const [escolhido, setEscolhido] = useState<SugestaoJogador | null>(null);
  const [sugestoes, setSugestoes] = useState<SugestaoJogador[]>([]);
  const [erroNome, setErroNome] = useState<string>();
  const [erroGeral, setErroGeral] = useState<string>();
  const [salvando, setSalvando] = useState(false);
  const [salvos, setSalvos] = useState(0);

  // Ao digitar o nome de um jogador novo, procura a pessoa nas outras peladas.
  useEffect(() => {
    if (editando || escolhido) {
      setSugestoes([]);
      return;
    }
    let ativo = true;
    buscarJogadoresDeOutrasPeladas(db, idPelada, nome).then((lista) => {
      if (ativo) setSugestoes(lista);
    });
    return () => {
      ativo = false;
    };
  }, [db, idPelada, nome, editando, escolhido]);

  function escolher(s: SugestaoJogador) {
    setEscolhido(s);
    setNome(s.nome);
    setPosicao(s.posicaoSugerida);
    setErroNome(undefined);
  }

  function limpar() {
    setEscolhido(null);
    setNome('');
    setPosicao('MEI');
    setConvidado(false);
  }

  async function salvar(continuar: boolean) {
    setSalvando(true);
    setErroNome(undefined);
    setErroGeral(undefined);
    try {
      if (jogador) {
        await atualizarJogadorDaPelada(db, jogador.idPeladaJogador, { nome, posicao, convidado });
      } else if (escolhido) {
        await adicionarJogadorExistente(db, idPelada, escolhido.idJogador, posicao, convidado);
      } else {
        await adicionarJogadorNovo(db, idPelada, { nome, posicao, convidado });
      }
      if (continuar) {
        limpar();
        setSalvos((n) => n + 1);
        setSalvando(false);
      } else {
        router.back();
      }
    } catch (e) {
      if (e instanceof ErroValidacao && e.campo === 'nome') setErroNome(e.message);
      else setErroGeral(e instanceof Error ? e.message : 'Não foi possível salvar.');
      setSalvando(false);
    }
  }

  function confirmarRemocao() {
    if (!jogador) return;
    Alert.alert(
      'Remover da pelada?',
      `${jogador.nome} sai desta pelada. Se ele joga em outras, continua nelas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await removerJogadorDaPelada(db, jogador.idPeladaJogador);
            router.back();
          },
        },
      ],
    );
  }

  return (
    <Tela
      rodape={
        editando ? (
          <Botao titulo="Salvar" onPress={() => salvar(false)} carregando={salvando} />
        ) : (
          <View style={styles.botoes}>
            <Botao
              titulo="Salvar e outro"
              variante="secundario"
              onPress={() => salvar(true)}
              desativado={salvando}
              style={styles.flex}
            />
            <Botao titulo="Salvar" onPress={() => salvar(false)} carregando={salvando} style={styles.flex} />
          </View>
        )
      }
    >
      <Cabecalho titulo={editando ? 'Editar jogador' : 'Novo jogador'} onVoltar={() => router.back()} />

      <View style={styles.campos}>
        {salvos > 0 ? (
          <Aviso tom="sucesso" mensagem={salvos === 1 ? '1 jogador salvo. Pode cadastrar o próximo.' : `${salvos} jogadores salvos.`} />
        ) : null}

        {escolhido ? (
          <Card style={styles.escolhido}>
            <View style={styles.flex}>
              <Text style={texto.rotulo}>{escolhido.nome}</Text>
              <Text style={texto.apoio}>Já joga em: {escolhido.peladas}</Text>
            </View>
            <Botao titulo="Trocar" variante="texto" onPress={limpar} />
          </Card>
        ) : (
          <View style={styles.grupo}>
            <CampoTexto
              rotulo="Nome"
              placeholder="Ex.: Breno Santos"
              value={nome}
              onChangeText={setNome}
              erro={erroNome}
              autoFocus={!editando}
              autoCapitalize="words"
              maxLength={40}
            />
            {editando ? (
              <Text style={texto.apoio}>Se ele joga em outras peladas, o nome muda em todas.</Text>
            ) : null}
            {sugestoes.length > 0 ? (
              <View>
                <Text style={[texto.apoio, styles.tituloSugestoes]}>Já cadastrado em outra pelada?</Text>
                {sugestoes.map((s) => (
                  <ItemLista
                    key={s.idJogador}
                    titulo={s.nome}
                    subtitulo={`Joga em: ${s.peladas}`}
                    fim={<Botao titulo="Usar" variante="texto" onPress={() => escolher(s)} />}
                    onPress={() => escolher(s)}
                  />
                ))}
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.grupo}>
          <Text style={texto.rotulo}>Posição</Text>
          <Seletor rotulo="Posição" opcoes={POSICOES} valor={posicao} onChange={setPosicao} colunas={2} />
        </View>

        <LinhaInterruptor
          titulo="Convidado"
          descricao="Joga só hoje. Não entra na contagem da pelada; depois você pode efetivá-lo."
          valor={convidado}
          onChange={setConvidado}
        />

        {erroGeral ? <Aviso tom="alerta" mensagem={erroGeral} /> : null}

        {editando ? <Botao titulo="Remover da pelada" variante="perigo" onPress={confirmarRemocao} /> : null}
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  campos: { gap: espaco.xxl },
  grupo: { gap: espaco.sm },
  botoes: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  escolhido: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  tituloSugestoes: { marginTop: espaco.xs },
});
