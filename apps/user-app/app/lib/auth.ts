import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { prisma } from "@repo/db/prisma";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',

            credentials: {
                phone: { label: "Phone number", type: "text", placeholder: "1234567890" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {

                if (!credentials || !credentials.phone || !credentials.password) {
                    return null;
                }

                const hashedPassword = await bcrypt.hash(credentials.password, 10);
                const existingUser = await prisma.user.findFirst({
                    where: {
                        number: credentials.phone
                    }
                })

                if (existingUser) {
                    const passwordValid = await bcrypt.compare(credentials.password, existingUser.password);
                    if (passwordValid) {
                        return {
                            id: existingUser.id,
                            email: existingUser.email,
                            number: existingUser.number,
                            name: existingUser.name
                        }
                    }
                    return null;
                }

                try {
                    const user = await prisma.user.create({
                        data: {
                            number: credentials.phone,
                            password: hashedPassword
                        }
                    })

                    return {
                        id: user.id,
                        number: user.number,
                        name: user.name,
                        email: user.email
                    }
                } catch (e) {
                    console.log(e);
                }

                return null;
            }
        })
    ],
    secret: process.env.JWT_SECRET || "secret",
    callbacks: {
        async session({ session, token, user }: any) {
            session.user.id = token.sub

            return session
        }
    }
}
