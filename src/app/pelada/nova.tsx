import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { criarPelada } from '@/banco/repositorios/peladas';
import { FormularioPelada } from '@/telas/FormularioPelada';

/** Criar pelada. Ao salvar, vai direto para a tela da pelada nova (no lugar desta). */
export default function NovaPelada() {
  const db = useSQLiteContext();
  return (
    <FormularioPelada
      onVoltar={() => router.back()}
      onSalvar={async (dados) => {
        const idPelada = await criarPelada(db, dados);
        router.replace({ pathname: '/pelada/[idPelada]', params: { idPelada } });
      }}
    />
  );
}
