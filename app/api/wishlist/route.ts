import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET user's wishlist
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "You must be logged in to access your wishlist" },
                { status: 401 }
            );
        }

        const userEmail = session.user.email;

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

        // Get the user's wishlist items with product details
        const wishlistItems = await prisma.wishlist.findMany({
            where: { userId: user.id },
            include: {
                product: {
                    include: {
                        category: true
                    }
                }
            }
        });

        return NextResponse.json(wishlistItems);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch wishlist", message: error.message },
            { status: 500 }
        );
    }
}

// ADD item to wishlist
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "You must be logged in to add items to your wishlist" },
                { status: 401 }
            );
        }

        const userEmail = session.user.email;
        const { productId } = await req.json();

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

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Check if item is already in wishlist
        const existingItem = await prisma.wishlist.findFirst({
            where: {
                userId: user.id,
                productId: productId
            }
        });

        if (existingItem) {
            return NextResponse.json(
                { error: "Item already in wishlist" },
                { status: 400 }
            );
        }

        // Add item to wishlist
        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId: user.id,
                productId: productId
            },
            include: {
                product: true
            }
        });

        return NextResponse.json(wishlistItem, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to add item to wishlist", message: error.message },
            { status: 500 }
        );
    }
}