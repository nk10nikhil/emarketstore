import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// DELETE item from wishlist
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "You must be logged in to remove items from your wishlist" },
                { status: 401 }
            );
        }

        const userEmail = session.user.email;
        const { id } = params;

        // Get the user
        const user = await prisma.user.findUnique({
            where: { email: userEmail as string }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if wishlist item exists and belongs to user
        const wishlistItem = await prisma.wishlist.findFirst({
            where: {
                id: id,
                userId: user.id
            }
        });

        if (!wishlistItem) {
            return NextResponse.json(
                { error: "Wishlist item not found or doesn't belong to user" },
                { status: 404 }
            );
        }

        // Delete the wishlist item
        await prisma.wishlist.delete({
            where: { id: id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to remove item from wishlist", message: error.message },
            { status: 500 }
        );
    }
}