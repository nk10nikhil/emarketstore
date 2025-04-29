import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

// Check if a slug exists
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json(
                { error: "Slug parameter is required" },
                { status: 400 }
            );
        }

        // Check if the slug exists in the products
        const product = await prisma.product.findUnique({
            where: { slug }
        });

        // Return true if product exists (slug is taken), false if not
        return NextResponse.json({ exists: !!product });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to verify slug", message: error.message },
            { status: 500 }
        );
    }
}