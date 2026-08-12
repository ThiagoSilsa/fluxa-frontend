// Types
import type { AuthSession, AuthUser } from '../types/auth.types'

// lib
import { isTokenValid } from '#/shared/lib/auth-token'

// Constants para as chaves usadas no sessionStorage
export const AUTH_TOKEN_KEY = 'token'
export const AUTH_USER_KEY = 'user'

/**
 * Checa se o código está rodando no ambiente do navegador
 * para evitar erros ao acessar `window` ou `sessionStorage` no servidor.
 */
function isBrowser() {
  return typeof window !== 'undefined'
}

/**
 * Armazena o token de autenticação e as informações do usuário na sessão do navegador.
 */
export function setAuthSession({ accessToken, user }: AuthSession) {
  if (!isBrowser()) {
    return
  }

  sessionStorage.setItem(AUTH_TOKEN_KEY, accessToken)
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

/**
 * Guarda só o token, sem tocar na pessoa.
 *
 * Existe para a troca de empresa: o token novo precisa valer **antes** de os
 * detalhes serem lidos, porque é ele que recorta cargo, permissões e unidades
 * pela empresa escolhida. Gravar junto a pessoa incompleta que a rota devolve
 * faria as telas protegidas recusarem acesso até os detalhes chegarem.
 *
 * @param accessToken Token da sessão nova.
 */
export function setAuthToken(accessToken: string) {
  if (!isBrowser()) {
    return
  }

  sessionStorage.setItem(AUTH_TOKEN_KEY, accessToken)
}

/**
 * Recupera o token de autenticação da sessão do navegador.
 */
export function getAuthToken() {
  if (!isBrowser()) {
    return null
  }

  return sessionStorage.getItem(AUTH_TOKEN_KEY)
}

/**
 * Recupera as informações do usuário da sessão do navegador.
 */
export function getAuthUser(): AuthUser | null {
  if (!isBrowser()) {
    return null
  }

  const value = sessionStorage.getItem(AUTH_USER_KEY)
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as AuthUser
  } catch {
    return null
  }
}

/**
 * Recupera a sessao persistida se o token atual for valido.
 * Se o token for inválido ou não existir, retorna null e limpa a sessão.
 */
export function getStoredAuthSession(): AuthSession | null {
  const token = getAuthToken()
  if (!token || !isTokenValid(token)) {
    return null
  }

  const user = getAuthUser()
  if (!user) {
    return null
  }

  return {
    accessToken: token,
    user,
  }
}

/**
 * Limpa a sessão de autenticação, removendo o token e as informações do usuário.
 */
export function clearAuthSession() {
  if (!isBrowser()) {
    return
  }

  sessionStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(AUTH_USER_KEY)
}

/**
 * Verifica se o usuário está autenticado, ou seja, se possui um token válido.
 */
export function isAuthenticated() {
  return !!getStoredAuthSession()
}
