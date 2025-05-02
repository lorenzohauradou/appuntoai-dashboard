import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Resend from "next-auth/providers/resend"
import Google from "next-auth/providers/google"

// Log per debug: Verifica il valore letto da .env
console.log("[auth.js] Reading AUTH_RESEND_FROM:", process.env.AUTH_RESEND_FROM); 
console.log("[auth.js] Reading RESEND_API_KEY:", process.env.RESEND_API_KEY ? "Presente" : "MANCANTE"); 
console.log("[auth.js] Reading AUTH_SECRET:", process.env.AUTH_SECRET ? "Presente" : "MANCANTE"); 
console.log("[auth.js] Reading GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Presente" : "MANCANTE");
console.log("[auth.js] Reading GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Presente" : "MANCANTE");
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.AUTH_RESEND_FROM,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  }
})