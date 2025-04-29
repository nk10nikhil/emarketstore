import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// Update product main image
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Only allow admin users to update main images
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: "You must be an admin to update product images" },
                { status: 403 }
            );
        }

        const { productId, imageUrl } = await req.json();

        if (!productId || !imageUrl) {
            return NextResponse.json(
                { error: "Product ID and image URL are required" },
                { status: 400 }
            );
        }

        // Update the product with new main image
        const product = await prisma.product.update({
            where: { id: productId },
            data: { mainImage: imageUrl }
        });

        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to update product main image", message: error.message },
            { status: 500 }
        );
    }
}