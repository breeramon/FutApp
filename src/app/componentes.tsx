import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  Avatar,
  Aviso,
  BarraNavegacao,
  BolaCor,
  Botao,
  BotaoIcone,
  CaixaSelecao,
  CampoBusca,
  CampoTexto,
  Cabecalho,
  Card,
  Chip,
  Etiqueta,
  EtiquetaPosicao,
  ItemLista,
  LinhaInterruptor,
  Seletor,
  Tela,
  TituloSecao,
} from '@/componentes';
import { CORES_TIMES, espaco, texto } from '@/tema/tema';
import type { CodigoModalidade } from '@/tipos/modelos';

const MODALIDADES = [
  { valor: 'futebol', rotulo: 'Futebol' },
  { valor: 'fut7', rotulo: 'Fut7' },
  { valor: 'futsal', rotulo: 'Futsal' },
] as const;

const ABAS = [
  { chave: 'peladas', rotulo: 'Peladas', icone: 'bola' },
  { chave: 'historico', rotulo: 'Histórico', icone: 'historico' },
  { chave: 'ajustes', rotulo: 'Ajustes', icone: 'ajustes' },
] as const;

/**
 * Catálogo com todos os componentes da etapa 1, para conferir no emulador.
 * Só é acessível pela aba Ajustes enquanto o app está em desenvolvimento.
 */
export default function Catalogo() {
  const [modalidade, setModalidade] = useState<CodigoModalidade>('futsal');
  const [times, setTimes] = useState(4);
  const [presente, setPresente] = useState(true);
  const [convidado, setConvidado] = useState(false);
  const [aba, setAba] = useState<(typeof ABAS)[number]['chave']>('peladas');
  const [filtro, setFiltro] = useState('todos');

  return (
    <Tela navegacao={<BarraNavegacao abas={ABAS} ativa={aba} onSelecionar={setAba} />}>
      <Cabecalho
        titulo="Componentes"
        subtitulo="Etapa 1 · base visual do app"
        onVoltar={() => router.back()}
        acao={<BotaoIcone icone="editar" rotulo="Editar" />}
      />

      <Secao titulo="Botões">
        <Botao titulo="Novo dia de jogo" icone="adicionar" />
        <View style={styles.linha2}>
          <Botao titulo="Ressortear" icone="sortear" variante="secundario" style={styles.flex} />
          <Botao titulo="Compartilhar" icone="compartilhar" style={styles.flex} />
        </View>
        <Botao titulo="Encerrar partida" variante="escuro" />
        <Botao titulo="Salvando" carregando />
        <Botao titulo="Sem presentes suficientes" desativado />
        <View style={styles.linha}>
          <Botao titulo="Sortear ordem" variante="texto" />
          <Botao titulo="Excluir pelada" variante="perigo" />
        </View>
      </Secao>

      <Secao titulo="Chips e etiquetas">
        <View style={styles.linha}>
          <Chip rotulo="Futsal" />
          <Chip rotulo="22 jogadores" icone="pessoas" />
          <Chip rotulo="Quinta, 19h" icone="calendario" />
        </View>
        <View style={styles.linha}>
          {['todos', 'presentes', 'ausentes'].map((f) => (
            <Chip key={f} rotulo={f[0].toUpperCase() + f.slice(1)} ativo={filtro === f} onPress={() => setFiltro(f)} />
          ))}
        </View>
        <View style={styles.linha}>
          <EtiquetaPosicao posicao="GOL" />
          <EtiquetaPosicao posicao="ZAG" />
          <EtiquetaPosicao posicao="MEI" />
          <EtiquetaPosicao posicao="ATA" />
          <Etiqueta rotulo="Incompleto 4/5" tom="alerta" />
          <Etiqueta rotulo="Convidado" tom="alerta" />
        </View>
      </Secao>

      <Secao titulo="Seletores">
        <Text style={texto.rotulo}>Modalidade</Text>
        <Seletor rotulo="Modalidade" opcoes={MODALIDADES} valor={modalidade} onChange={setModalidade} />
        <Text style={texto.rotulo}>Quantidade de times</Text>
        <Seletor
          rotulo="Quantidade de times"
          formato="circulo"
          opcoes={[2, 3, 4, 5, 6].map((n) => ({ valor: n, rotulo: String(n) }))}
          valor={times}
          onChange={setTimes}
        />
      </Secao>

      <Secao titulo="Campos">
        <CampoTexto rotulo="Nome da pelada" placeholder="Ex.: Fut de quinta" />
        <CampoBusca />
        <LinhaInterruptor
          titulo="Convidado"
          descricao="Joga só hoje. Depois você decide se ele entra na pelada."
          valor={convidado}
          onChange={setConvidado}
        />
      </Secao>

      <Secao titulo="Lista">
        <ItemLista
          titulo="Breno Santos"
          inicio={<CaixaSelecao marcado={presente} onChange={setPresente} rotulo="Breno Santos presente" />}
          fim={<EtiquetaPosicao posicao="MEI" />}
        />
        <ItemLista titulo="Carlos Mota" inicio={<Avatar nome="Carlos Mota" />} fim={<EtiquetaPosicao posicao="GOL" />} />
        <ItemLista titulo="Jogadores" detalhe="22" onPress={() => {}} />
      </Secao>

      <Secao titulo="Avisos">
        <Aviso mensagem="Futsal tem 5 por time, com 1 goleiro. Com 4 times, são 20 vagas." />
        <Aviso tom="alerta" mensagem="Time D ficou com 4 de 5 jogadores e sem goleiro." />
        <Aviso tom="sucesso" mensagem="17 nomes reconhecidos" />
      </Secao>

      <Secao titulo="Card de time">
        <Card style={styles.card}>
          <View style={styles.cabecalhoTime}>
            <BolaCor cor={CORES_TIMES[3]} tamanho={28} />
            <Text style={[texto.tituloSecao, styles.flex]}>Time D</Text>
            <Text style={texto.apoio}>4/5</Text>
          </View>
          <View style={styles.linha}>
            <Etiqueta rotulo="Incompleto 4/5" tom="alerta" />
            <Etiqueta rotulo="Sem goleiro" tom="alerta" />
          </View>
        </Card>
        <View style={styles.linha}>
          {CORES_TIMES.map((c) => (
            <BolaCor key={c} cor={c} tamanho={28} />
          ))}
        </View>
      </Secao>
    </Tela>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={styles.secao}>
      <TituloSecao titulo={titulo} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  secao: { gap: espaco.md, marginBottom: espaco.xxxl },
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm, alignItems: 'center' },
  linha2: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  card: { gap: espaco.md },
  cabecalhoTime: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
