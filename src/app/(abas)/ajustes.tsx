import { router } from 'expo-router';
import { View } from 'react-native';

import { Aviso, Cabecalho, ItemLista, Tela, TituloSecao } from '@/componentes';

/** Placeholder: backup e preferências chegam na etapa 5. */
export default function Ajustes() {
  return (
    <Tela espacoNavegacao>
      <Cabecalho titulo="Ajustes" grande />
      <Aviso mensagem="Backup, som do cronômetro e tela sempre ligada chegam numa próxima etapa. Por enquanto, tudo fica salvo só neste celular." />

      {/* Só aparece enquanto o app está em desenvolvimento, não na versão publicada. */}
      {__DEV__ ? (
        <View style={{ marginTop: 32 }}>
          <TituloSecao titulo="Desenvolvimento" />
          <ItemLista titulo="Catálogo de componentes" subtitulo="Etapa 1" onPress={() => router.push('/componentes')} />
        </View>
      ) : null}
    </Tela>
  );
}
