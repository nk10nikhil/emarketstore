import { NextAuthOptions } from "next-auth";
import { Account, User as AuthUser } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/utils/db";
import { nanoid } from "nanoid";

// Create a configuration object for NextAuth
export const authOptions: NextAuthOptions = {
    // Configure one or more authentication providers
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any) {
                try {
                    const user = await prisma.user.findFirst({
                        where: {
                            email: credentials.email,
                        },
                    });

                    if (user) {
                        const isPasswordCorrect = await bcrypt.compare(
                            credentials.password,
                            user.password!
                        );

                        if (isPasswordCorrect) {
                            // Return a user object that matches NextAuth's User type
                            return {
                                id: user.id,
                                email: user.email,
                                name: user.email.split('@')[0], // Using part of email as name for display
                                // Convert null to undefined to match NextAuth's User type
                                role: user.role || undefined,
                            };
                        }
                    }

                    return null;
                } catch (err: any) {
                    console.error("Auth error:", err);
                    return null;
                }
            },
        })
        // GithubProvider({
        //   clientId: process.env.GITHUB_ID ?? "",
        //   clientSecret: process.env.GITHUB_SECRET ?? "",
        // }),
        // GoogleProvider({
        //   clientId: process.env.GOOGLE_ID ?? "",
        //   clientSecret: process.env.GOOGLE_SECRET ?? "",
        // }),
        // ...add more providers here if you want
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "credentials") {
                return true;
            }
            // if (account?.provider === "github") {
            //   // ...existing code...
            // }
            // if (account?.provider === "google") {
            //   // ...existing code...
            // }
            return false;
        },

        // Add this session callback to include user data in the session
        async session({ session, token }: { session: any; token: any }) {
            if (token) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.role = token.role;
            }
            return session;
        },

        // Add this JWT callback to include user data in the token
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
            }
            return token;
        }
    },
};