import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { atualizarPelada, excluirPelada, obterPelada } from '@/banco/repositorios/peladas';
import { Carregando, Tela } from '@/componentes';
import { useDadosDaTela } from '@/hooks/useDadosDaTela';
import { FormularioPelada } from '@/telas/FormularioPelada';

/** Editar pelada: o mesmo formulário da criação, já preenchido, com a opção de excluir. */
export default function EditarPelada() {
  const { idPelada } = useLocalSearchParams<{ idPelada: string }>();
  const db = useSQLiteContext();
  // O formulário usa estes dados só para preencher os campos ao abrir; o que a pessoa digitar não é sobrescrito.
  const { dados: pelada } = useDadosDaTela(`pelada-${idPelada}`, (banco) => obterPelada(banco, idPelada));

  if (!pelada) {
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  }

  return (
    <FormularioPelada
      inicial={pelada}
      onVoltar={() => router.back()}
      onSalvar={async (dados) => {
        await atualizarPelada(db, idPelada, dados);
        router.back();
      }}
      onExcluir={async () => {
        await excluirPelada(db, idPelada);
        router.dismissAll(); // volta para a tela inicial
      }}
    />
  );
}
