import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { executeQuery } from '@/lib/db/cassandra'
import type { NextAuthConfig } from 'next-auth'

const config = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password')
        }

        try {
          // Query user from Cassandra
          const users = await executeQuery(
            'SELECT * FROM users WHERE email = ? ALLOW FILTERING',
            [credentials.email]
          )

          const user = users[0]

          if (!user) {
            throw new Error('No user found with this email')
          }

          // Here you would typically verify the password hash
          // For now, we'll just return the user
          // In production, implement proper password hashing and verification
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            userType: credentials.userType
          }
        } catch (error) {
          console.error('Error during authentication:', error)
          throw new Error('Authentication error')
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.userType = user.userType
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        (session.user as any).userType = token.userType
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig

const handler = NextAuth(config)

export { handler as GET, handler as POST } 