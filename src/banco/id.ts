/**
 * Gera um UUID versão 4 (ex.: "3b241101-e2bb-4255-8caf-4136c566a962").
 *
 * Usa o gerador criptográfico do ambiente quando existe e, se não existir,
 * cai para Math.random. Para um app local isso é suficiente; se um dia
 * precisarmos de garantia criptográfica em todo aparelho, trocamos por expo-crypto
 * sem mudar quem chama esta função.
 */
export function gerarId(): string {
  const bytes = new Uint8Array(16);
  const cripto = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } }).crypto;

  if (cripto?.getRandomValues) {
    cripto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  // Marca a versão (4) e a variante (RFC 4122), como manda o padrão UUID.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
