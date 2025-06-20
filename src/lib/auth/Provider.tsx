'use client'

import { SessionProvider } from 'next-auth'

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
} 