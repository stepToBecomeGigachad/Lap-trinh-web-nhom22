import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from './lib/prisma';
import { hashPassword, verifyPassword } from './lib/password';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        // Google OAuth Provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),

        // Email/Password Provider
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email.toLowerCase().trim();

                const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
                const ADMIN_PASS = process.env.ADMIN_PASSWORD;

                // Check database user
                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.passwordHash) {
                    return null;
                }

                const isValid = verifyPassword(credentials.password, user.passwordHash);
                if (!isValid) {
                    const isAdminCredentials =
                        ADMIN_EMAIL &&
                        ADMIN_PASS &&
                        email === ADMIN_EMAIL.toLowerCase() &&
                        credentials.password === ADMIN_PASS;
                    const isScryptHash = String(user.passwordHash || '').startsWith('scrypt:');
                    if (!(isAdminCredentials && !isScryptHash)) {
                        return null;
                    }
                    const upgradedHash = hashPassword(credentials.password);
                    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: upgradedHash, role: 'ADMIN' } });
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role === 'ADMIN' ? 'admin' : 'user',
                };
            },
        }),
    ],

    pages: {
        signIn: '/login',
        error: '/login',
    },

    callbacks: {
        async signIn({ user, account, profile }) {
            // Handle Google sign-in
            if (account?.provider === 'google') {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email },
                    });

                    if (existingUser) {
                        // Update provider info if not set
                        if (!existingUser.provider) {
                            await prisma.user.update({
                                where: { id: existingUser.id },
                                data: {
                                    provider: 'google',
                                    providerId: account.providerAccountId,
                                },
                            });
                        }
                    } else {
                        // Create new user
                        await prisma.user.create({
                            data: {
                                email: user.email,
                                name: user.name || '',
                                passwordHash: null,
                                provider: 'google',
                                providerId: account.providerAccountId,
                                role: 'USER',
                            },
                        });
                    }
                    return true;
                } catch (error) {
                    console.error('Error during Google sign-in:', error);
                    return false;
                }
            }
            return true;
        },

        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || 'user';
            }

            // Get role from database for Google users
            if (account?.provider === 'google' && token.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                    select: { id: true, role: true },
                });
                if (dbUser) {
                    token.id = dbUser.id;
                    token.role = dbUser.role === 'ADMIN' ? 'admin' : 'user';
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },

    session: {
        strategy: 'jwt',
        maxAge: 8 * 60 * 60, // 8 hours
    },

    secret: process.env.NEXTAUTH_SECRET,

    // Trust host for Docker/development environment
    trustHost: true,
});
