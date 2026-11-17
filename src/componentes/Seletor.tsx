import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, raio } from '@/tema/tema';

export interface OpcaoSeletor<T extends string | number> {
  valor: T;
  rotulo: string;
}

interface Props<T extends string | number> {
  opcoes: readonly OpcaoSeletor<T>[];
  valor: T;
  onChange: (valor: T) => void;
  /** Nome do grupo, para o leitor de tela ("Modalidade", "Posição"). */
  rotulo: string;
  /** Quantas opções por linha (3 para modalidades, 2 para posições). */
  colunas?: number;
  /** "retangulo" é o padrão; "circulo" são as bolinhas da quantidade de times. */
  formato?: 'retangulo' | 'circulo';
}

/** Grupo de opções em que só uma fica marcada: modalidade, posição, quantidade de times, regra de rodízio. */
export function Seletor<T extends string | number>({ opcoes, valor, onChange, rotulo, colunas, formato = 'retangulo' }: Props<T>) {
  const circulo = formato === 'circulo';
  const porLinha = colunas ?? opcoes.length;

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={rotulo} style={styles.grupo}>
      {opcoes.map((o) => {
        const marcado = o.valor === valor;
        return (
          <Pressable
            key={String(o.valor)}
            onPress={() => onChange(o.valor)}
            accessibilityRole="radio"
            accessibilityState={{ checked: marcado }}
            accessibilityLabel={o.rotulo}
            style={({ pressed }) => [
              circulo ? styles.circulo : [styles.retangulo, { flexBasis: `${100 / porLinha - 3}%` }],
              marcado ? styles.marcado : styles.desmarcado,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.texto, circulo && styles.textoCirculo, marcado && styles.textoMarcado]}>{o.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  retangulo: { flexGrow: 1, height: 48, borderRadius: raio.lg, alignItems: 'center', justifyContent: 'center' },
  circulo: { width: 52, height: 52, borderRadius: raio.pilula, alignItems: 'center', justifyContent: 'center' },
  // A borda marcada é 2 e a desmarcada 1; a margem compensa para o texto não pular ao trocar.
  desmarcado: { borderWidth: 1, borderColor: cores.borda, backgroundColor: cores.fundo, margin: 0.5 },
  marcado: { borderWidth: 2, borderColor: cores.primaria, backgroundColor: cores.primariaSuave, margin: 0 },
  texto: { fontSize: 14, fontWeight: '500', color: cores.texto },
  textoCirculo: { fontSize: 16 },
  textoMarcado: { color: cores.primaria, fontWeight: '700' },
});
