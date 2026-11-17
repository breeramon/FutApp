import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View, type TextInputProps } from 'react-native';

import { altura, cores, espaco, raio, texto } from '@/tema/tema';

import { Icone } from './Icone';

interface CampoTextoProps extends Omit<TextInputProps, 'style'> {
  rotulo: string;
  erro?: string;
}

/** Campo com rótulo acima ("Nome da pelada", "Nome"). A borda fica verde enquanto está em foco. */
export function CampoTexto({ rotulo, erro, onFocus, onBlur, ...props }: CampoTextoProps) {
  const [foco, setFoco] = useState(false);
  return (
    <View style={styles.campo}>
      <Text style={texto.rotulo}>{rotulo}</Text>
      <TextInput
        {...props}
        accessibilityLabel={rotulo}
        placeholderTextColor={cores.textoSecundario}
        onFocus={(e) => {
          setFoco(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFoco(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          foco && styles.inputFoco,
          erro ? styles.inputErro : null,
        ]}
      />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

/** Busca com lupa e fundo cinza (listas de jogadores e presença). */
export function CampoBusca(props: Omit<TextInputProps, 'style'>) {
  return (
    <View style={styles.busca}>
      <Icone nome="buscar" tamanho={18} cor={cores.textoSecundario} />
      <TextInput
        placeholder="Buscar jogador"
        accessibilityLabel={props.placeholder ?? 'Buscar jogador'}
        placeholderTextColor={cores.textoSecundario}
        returnKeyType="search"
        {...props}
        style={styles.buscaInput}
      />
    </View>
  );
}

/** Caixa de seleção redonda nos cantos (lista de presença). */
export function CaixaSelecao({ marcado, onChange, rotulo }: { marcado: boolean; onChange: (v: boolean) => void; rotulo: string }) {
  return (
    <Pressable
      onPress={() => onChange(!marcado)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: marcado }}
      accessibilityLabel={rotulo}
      hitSlop={10}
      style={[styles.caixa, marcado ? styles.caixaMarcada : styles.caixaVazia]}
    >
      {marcado ? <Icone nome="check" tamanho={16} cor={cores.textoInverso} /> : null}
    </Pressable>
  );
}

interface LinhaInterruptorProps {
  titulo: string;
  descricao?: string;
  valor: boolean;
  onChange: (v: boolean) => void;
}

/** Linha com título, descrição e chave liga/desliga (Convidado, Som no fim do cronômetro). */
export function LinhaInterruptor({ titulo, descricao, valor, onChange }: LinhaInterruptorProps) {
  return (
    <View style={styles.linha}>
      <View style={styles.linhaTexto}>
        <Text style={texto.rotulo}>{titulo}</Text>
        {descricao ? <Text style={texto.apoio}>{descricao}</Text> : null}
      </View>
      <Switch
        value={valor}
        onValueChange={onChange}
        accessibilityLabel={titulo}
        trackColor={{ false: cores.desativado, true: cores.primaria }}
        thumbColor={cores.fundo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  campo: { gap: espaco.sm },
  input: {
    height: altura.campo,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.lg,
    fontSize: 16,
    color: cores.texto,
    backgroundColor: cores.fundo,
  },
  inputFoco: { borderWidth: 2, borderColor: cores.primaria, paddingHorizontal: 13 },
  inputErro: { borderColor: cores.perigo },
  erro: { fontSize: 13, color: cores.perigo },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: raio.lg,
    backgroundColor: cores.superficie,
  },
  buscaInput: { flex: 1, fontSize: 15, color: cores.texto, paddingVertical: 0 },
  caixa: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  caixaMarcada: { backgroundColor: cores.primaria },
  caixaVazia: { borderWidth: 2, borderColor: cores.marcadorVazio },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, minHeight: 60, paddingVertical: espaco.sm },
  linhaTexto: { flex: 1, gap: 2 },
});
