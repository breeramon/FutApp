import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';

import { migrarBanco } from '@/banco/migracoes';

/**
 * Layout raiz: envolve o app inteiro com o banco de dados.
 * O SQLiteProvider abre o arquivo pelada.db e roda migrarBanco antes de mostrar as telas,
 * então qualquer tela pode usar useSQLiteContext() sabendo que as tabelas já existem.
 */
export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="pelada.db" onInit={migrarBanco}>
      <Stack />
    </SQLiteProvider>
  );
}
