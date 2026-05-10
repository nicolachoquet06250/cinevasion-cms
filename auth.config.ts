import EmailProvider from "@auth/core/providers/email";
import Google from "@auth/core/providers/google";
import MicrosoftEntraID from "@auth/core/providers/microsoft-entra-id";
import Credentials from "@auth/core/providers/credentials";
import { defineConfig } from "auth-astro";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./src/db/index.ts";
import { accounts, sessions, users, verificationTokens } from "./src/db/schema/auth";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export default defineConfig({
  trustHost: true,
  redirectProxyUrl: import.meta.env.AUTH_REDIRECT_PROXY_URL,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    EmailProvider({
      server: {
        host: import.meta.env.EMAIL_SERVER_HOST,
        port: import.meta.env.EMAIL_SERVER_PORT,
        auth: {
          user: import.meta.env.EMAIL_SERVER_USER,
          pass: import.meta.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: import.meta.env.AUTH_FROM,
    }),
    Credentials({
      name: "Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.code) {
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Valider le code 2FA (email code)
        const verificationToken = await db.query.verificationTokens.findFirst({
          where: and(
            eq(verificationTokens.identifier, user.email as string),
            eq(verificationTokens.token, credentials.code as string)
          )
        });

        if (!verificationToken || new Date(verificationToken.expires) < new Date()) {
          return null;
        }

        // console.log("Token valid, deleting and returning user");

        // Supprimer le token utilisé
        // @ts-ignore
        await db.delete(verificationTokens).where(
          and(
            eq(verificationTokens.identifier, user.email as string),
            eq(verificationTokens.token, credentials.code as string)
          )
        );

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
    },
  },
});
