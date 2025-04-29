import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import bcrypt from "bcryptjs";

// GET all users (admin only)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Only allow admin users to access the list of users
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: "You must be an admin to access this resource" },
                { status: 403 }
            );
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                _count: {
                    select: {
                        Wishlist: true
                    }
                }
            }
        });

        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch users", message: error.message },
            { status: 500 }
        );
    }
}

// Create a new user
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Only allow admin users to create new users
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: "You must be an admin to create new users" },
                { status: 403 }
            );
        }

        const { email, password, role } = await req.json();

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email is already in use" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role || 'user'
            },
            select: {
                id: true,
                email: true,
                role: true
            }
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to create user", message: error.message },
            { status: 500 }
        );
    }
}