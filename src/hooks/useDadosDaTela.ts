import { useFocusEffect } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Carrega dados do banco sempre que a tela aparece (inclusive ao voltar de outra tela).
 * Assim, ao cadastrar um jogador e voltar, a lista já vem atualizada.
 *
 * @param chave muda quando a tela precisa recarregar por outro motivo (ex.: o id da pelada).
 * @param carregar função que lê do banco e devolve os dados.
 */
export function useDadosDaTela<T>(chave: string, carregar: (db: SQLiteDatabase) => Promise<T>) {
  const db = useSQLiteContext();
  const [dados, setDados] = useState<T | undefined>(undefined);
  const [erro, setErro] = useState<Error | null>(null);
  const [versao, setVersao] = useState(0);

  // Guarda sempre a versão mais nova de `carregar` sem precisar recarregar a cada renderização.
  const carregarRef = useRef(carregar);
  useEffect(() => {
    carregarRef.current = carregar;
  });

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      carregarRef
        .current(db)
        .then((resultado) => {
          if (ativo) {
            setDados(resultado);
            setErro(null);
          }
        })
        .catch((e: unknown) => {
          if (ativo) setErro(e instanceof Error ? e : new Error(String(e)));
        });
      // Se a pessoa sair da tela antes de terminar, o resultado é descartado.
      return () => {
        ativo = false;
      };
    }, [db, chave, versao]),
  );

  return { dados, erro, carregando: dados === undefined && !erro, recarregar: () => setVersao((v) => v + 1) };
}
