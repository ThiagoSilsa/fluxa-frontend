// Vitest
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest'

// Lib
import { getSidebarPreference, setSidebarPreference } from './sidebar-preference'

describe('sidebar-preference', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getSidebarPreference — configuração inexistente', () => {
    it('retorna null quando não há preferência salva para o usuário', () => {
      expect(getSidebarPreference('user-1')).toBeNull()
    })

    it('retorna null para userId ausente (null/undefined/vazio)', () => {
      expect(getSidebarPreference(null)).toBeNull()
      expect(getSidebarPreference(undefined)).toBeNull()
      expect(getSidebarPreference('')).toBeNull()
    })

    it('retorna null quando o valor salvo é inválido', () => {
      localStorage.setItem('sidebar-open:user-1', 'talvez')
      expect(getSidebarPreference('user-1')).toBeNull()
    })
  })

  describe('getSidebarPreference — configuração existente', () => {
    it('retorna true quando a preferência salva é expandida', () => {
      setSidebarPreference('user-1', true)
      expect(getSidebarPreference('user-1')).toBe(true)
    })

    it('retorna false quando a preferência salva é retraída', () => {
      setSidebarPreference('user-1', false)
      expect(getSidebarPreference('user-1')).toBe(false)
    })
  })

  describe('setSidebarPreference — criação e atualização', () => {
    it('cria a preferência quando ainda não existe', () => {
      expect(getSidebarPreference('user-1')).toBeNull()
      setSidebarPreference('user-1', false)
      expect(getSidebarPreference('user-1')).toBe(false)
    })

    it('atualiza a preferência existente (false → true)', () => {
      setSidebarPreference('user-1', false)
      expect(getSidebarPreference('user-1')).toBe(false)

      setSidebarPreference('user-1', true)
      expect(getSidebarPreference('user-1')).toBe(true)
    })

    it('não salva nada quando o userId é ausente', () => {
      setSidebarPreference(null, true)
      setSidebarPreference('', false)
      expect(localStorage.length).toBe(0)
    })
  })

  describe('isolamento por usuário', () => {
    it('mantém preferências independentes entre usuários', () => {
      setSidebarPreference('user-1', true)
      setSidebarPreference('user-2', false)

      expect(getSidebarPreference('user-1')).toBe(true)
      expect(getSidebarPreference('user-2')).toBe(false)
    })

    it('atualizar um usuário não afeta o outro', () => {
      setSidebarPreference('user-1', true)
      setSidebarPreference('user-2', true)

      setSidebarPreference('user-1', false)

      expect(getSidebarPreference('user-1')).toBe(false)
      expect(getSidebarPreference('user-2')).toBe(true)
    })
  })

  describe('resiliência a falhas de storage', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('getSidebarPreference retorna null se o localStorage lançar', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage indisponível')
      })
      expect(getSidebarPreference('user-1')).toBeNull()
    })

    it('setSidebarPreference não propaga erro se o localStorage lançar', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota excedida')
      })
      expect(() => setSidebarPreference('user-1', true)).not.toThrow()
    })
  })
})
