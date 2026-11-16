import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Modalidade } from '@/tipos/modelos';

/**
 * Tela provisória de conferência: mostra que o banco abriu e que as modalidades
 * foram criadas. Ela será trocada pela tela "Início" dos mockups.
 */
export default function Index() {
  const db = useSQLiteContext();
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [versao, setVersao] = useState<number | null>(null);

  useEffect(() => {
    async function carregar() {
      const lista = await db.getAllAsync<Modalidade>(
        'SELECT * FROM Modalidade WHERE excluidoEm IS NULL ORDER BY jogadoresPorTime',
      );
      const linha = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
      setModalidades(lista);
      setVersao(linha?.user_version ?? null);
    }
    carregar();
  }, [db]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Banco pronto</Text>
      <Text style={styles.texto}>Versão do banco: {versao ?? '...'}</Text>
      {modalidades.map((m) => (
        <Text key={m.idModalidade} style={styles.texto}>
          {m.nome}: {m.jogadoresPorTime} por time
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  titulo: { fontSize: 22, fontWeight: '700' },
  texto: { fontSize: 16 },
});
