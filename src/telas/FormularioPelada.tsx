import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ID_MODALIDADE } from '@/banco/migracoes';
import { ErroValidacao } from '@/banco/repositorios/comum';
import { listarModalidades, type DadosPelada, type ResumoPelada } from '@/banco/repositorios/peladas';
import { Aviso, Botao, Cabecalho, CampoTexto, Carregando, Seletor, Tela } from '@/componentes';
import { DIAS_SEMANA_CURTO, normalizarHorario } from '@/dominio/agenda';
import { useDadosDaTela } from '@/hooks/useDadosDaTela';
import { cores, espaco, texto } from '@/tema/tema';

const SEM_DIA = -1;
const OPCOES_DIA = [
  { valor: SEM_DIA, rotulo: 'Sem dia' },
  ...DIAS_SEMANA_CURTO.map((rotulo, valor) => ({ valor, rotulo })),
];

interface Props {
  /** Pelada sendo editada; sem ela, o formulário cria uma nova. */
  inicial?: ResumoPelada;
  onSalvar: (dados: DadosPelada) => Promise<void>;
  onVoltar: () => void;
  onExcluir?: () => Promise<void>;
}

/** O mesmo formulário serve para criar e para editar a pelada (tela 7 dos mockups). */
export function FormularioPelada({ inicial, onSalvar, onVoltar, onExcluir }: Props) {
  const { dados: modalidades } = useDadosDaTela('modalidades', listarModalidades);
  const [nome, setNome] = useState(inicial?.nome ?? '');
  const [idModalidade, setIdModalidade] = useState<string>(inicial?.idModalidadePadrao ?? ID_MODALIDADE.futsal);
  const [dia, setDia] = useState(inicial?.diaSemana ?? SEM_DIA);
  const [horario, setHorario] = useState(inicial?.horario ?? '');
  const [erros, setErros] = useState<{ nome?: string; horario?: string; geral?: string }>({});
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const horarioNormalizado = dia === SEM_DIA ? null : normalizarHorario(horario);
    if (dia !== SEM_DIA && horario.trim() && !horarioNormalizado) {
      setErros({ horario: 'Use o formato 19:00.' });
      return;
    }
    setSalvando(true);
    setErros({});
    try {
      await onSalvar({
        nome,
        idModalidadePadrao: idModalidade,
        diaSemana: dia === SEM_DIA ? null : dia,
        horario: horarioNormalizado,
      });
    } catch (e) {
      if (e instanceof ErroValidacao && e.campo === 'nome') setErros({ nome: e.message });
      else setErros({ geral: e instanceof Error ? e.message : 'Não foi possível salvar.' });
      setSalvando(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert(
      'Excluir pelada?',
      `"${inicial?.nome}" some da lista. Os jogadores continuam cadastrados nas outras peladas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => onExcluir?.() },
      ],
    );
  }

  return (
    <Tela
      rodape={
        <Botao titulo={inicial ? 'Salvar' : 'Criar pelada'} onPress={salvar} carregando={salvando} />
      }
    >
      <Cabecalho
        titulo={inicial ? 'Editar pelada' : 'Nova pelada'}
        subtitulo={inicial ? undefined : 'Depois você cadastra os jogadores.'}
        onVoltar={onVoltar}
      />

      {!modalidades ? (
        <Carregando />
      ) : (
        <View style={styles.campos}>
          <CampoTexto
            rotulo="Nome da pelada"
            placeholder="Ex.: Fut de quinta"
            value={nome}
            onChangeText={setNome}
            erro={erros.nome}
            autoFocus={!inicial}
            autoCapitalize="sentences"
            maxLength={60}
          />

          <View style={styles.grupo}>
            <Text style={texto.rotulo}>Modalidade padrão</Text>
            <Seletor
              rotulo="Modalidade padrão"
              opcoes={modalidades.map((m) => ({ valor: m.idModalidade, rotulo: m.nome }))}
              valor={idModalidade}
              onChange={setIdModalidade}
            />
            <Text style={texto.apoio}>Dá para trocar a modalidade em cada dia de jogo.</Text>
          </View>

          <View style={styles.grupo}>
            <Text style={texto.rotulo}>
              Dia da semana <Text style={styles.opcional}>(opcional)</Text>
            </Text>
            <Seletor rotulo="Dia da semana" opcoes={OPCOES_DIA} valor={dia} onChange={setDia} colunas={4} />
          </View>

          {dia !== SEM_DIA ? (
            <CampoTexto
              rotulo="Horário"
              placeholder="19:00"
              value={horario}
              onChangeText={setHorario}
              erro={erros.horario}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          ) : null}

          {erros.geral ? <Aviso tom="alerta" mensagem={erros.geral} /> : null}

          {inicial && onExcluir ? <Botao titulo="Excluir pelada" variante="perigo" onPress={confirmarExclusao} /> : null}
        </View>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  campos: { gap: espaco.xxl },
  grupo: { gap: espaco.sm },
  opcional: { fontWeight: '400', color: cores.textoSecundario },
});
