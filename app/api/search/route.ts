import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get('q') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const skip = (page - 1) * limit;

        // Search products by title, slug, description, or manufacturer
        const where = {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { slug: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { manufacturer: { contains: query, mode: 'insensitive' } },
            ]
        };

        // Get total count for pagination
        const total = await prisma.product.count({ where });

        // Get products matching the search query
        const products = await prisma.product.findMany({
            where,
            include: {
                category: true,
            },
            skip,
            take: limit,
        });

        return NextResponse.json({
            products,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Search failed", message: error.message },
            { status: 500 }
        );
    }
}