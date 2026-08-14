/**
 * Função responsável por fornecer as variáveis de ambiente da aplicação.
 */
export const EnvConfig = () => {
  const apiUrl = import.meta.env.VITE_API_URL
  const wsUrl = import.meta.env.PROD ? apiUrl : `${apiUrl}/api`

  return {
    apiUrl,
    wsUrl,
  }
}
