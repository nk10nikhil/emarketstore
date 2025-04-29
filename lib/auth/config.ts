import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/utils/db";

export const authOptions: NextAuthOptions = {
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
                    if (!credentials?.email || !credentials?.password) {
                        return null;
                    }

                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                    });

                    if (!user || !user.password) {
                        return null;
                    }

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (isPasswordCorrect) {
                        return {
                            id: user.id,
                            email: user.email,
                            role: user.role
                        };
                    }

                    return null;
                } catch (err: any) {
                    console.error("Auth error:", err);
                    return null;
                }
            },
        }),
        // Commented providers can be uncommented and configured as needed
        // GithubProvider({
        //   clientId: process.env.GITHUB_ID ?? "",
        //   clientSecret: process.env.GITHUB_SECRET ?? "",
        // }),
        // GoogleProvider({
        //   clientId: process.env.GOOGLE_ID ?? "",
        //   clientSecret: process.env.GOOGLE_SECRET ?? "",
        // }),
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.role = token.role as string | undefined;
            }
            return session;
        }
    },
};