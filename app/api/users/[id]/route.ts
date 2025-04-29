import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import bcrypt from "bcryptjs";

// GET a single user by ID
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Only allow admin users or the user themselves to access user details
        if (!session?.user) {
            return NextResponse.json(
                { error: "You must be logged in to access user information" },
                { status: 401 }
            );
        }

        const { id } = params;
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email as string }
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if the user is requesting their own info or is an admin
        if (currentUser.id !== id && currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: "You don't have permission to access this user's information" },
                { status: 403 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id },
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

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch user", message: error.message },
            { status: 500 }
        );
    }
}

// Update user
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Only allow admin users or the user themselves to update user details
        if (!session?.user) {
            return NextResponse.json(
                { error: "You must be logged in to update user information" },
                { status: 401 }
            );
        }

        const { id } = params;
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email as string }
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if the user is updating their own info or is an admin
        if (currentUser.id !== id && currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: "You don't have permission to update this user's information" },
                { status: 403 }
            );
        }

        const { email, password, role } = await req.json();

        // Build update data
        const updateData: any = {};

        if (email) {
            // Check if email is already in use by another user
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser && existingUser.id !== id) {
                return NextResponse.json(
                    { error: "Email is already in use by another user" },
                    { status: 400 }
                );
            }

            updateData.email = email;
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Only admin can update roles
        if (role && currentUser.role === 'admin') {
            updateData.role = role;
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                role: true
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to update user", message: error.message },
            { status: 500 }
        );
    }
}

// Delete user
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Only allow admin users to delete users
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: "You must be an admin to delete users" },
                { status: 403 }
            );
        }

        const { id } = params;

        // Delete wishlist items first
        await prisma.wishlist.deleteMany({
            where: { userId: id }
        });

        // Delete the user
        const deletedUser = await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json(deletedUser);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to delete user", message: error.message },
            { status: 500 }
        );
    }
}