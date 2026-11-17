import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { migrarBanco } from '@/banco/migracoes';
import { cores } from '@/tema/tema';

/**
 * Layout raiz: envolve o app inteiro com o banco de dados.
 * O SQLiteProvider abre o arquivo pelada.db e roda migrarBanco antes de mostrar as telas,
 * então qualquer tela pode usar useSQLiteContext() sabendo que as tabelas já existem.
 */
export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="pelada.db" onInit={migrarBanco}>
      {/* Ícones da barra de status (hora, bateria) em preto, sobre o fundo branco. */}
      <StatusBar style="dark" />
      {/* Cada tela desenha o próprio cabeçalho (componente Cabecalho), então o padrão fica escondido. */}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }} />
    </SQLiteProvider>
  );
}
