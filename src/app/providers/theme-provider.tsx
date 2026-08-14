'use client'
import { ThemeProvider } from 'next-themes'
import React from 'react'

/**
 * Componente de provedor de tema para a aplicação.
 * Utiliza o ThemeProvider do pacote 'next-themes' para gerenciar o tema da aplicação.
 * O tema é definido como 'system' por padrão, permitindo que o tema siga as preferências do sistema operacional do usuário.
 * O atributo 'class' é usado para aplicar classes CSS baseadas no tema selecionado.
 *
 * @param {Object} props - As propriedades do componente.
 * @param {React.ReactNode} props.children - Os elementos filhos que serão renderizados dentro do provedor de tema.
 */
export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}
