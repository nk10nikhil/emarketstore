import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get('q') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const skip = (page - 1) * limit;

        // For MongoDB, we need to use a regex pattern for case-insensitive search
        const regex = { $regex: query, $options: 'i' };

        // Use Prisma's native MongoDB query capabilities
        const where = {
            OR: [
                { title: { contains: query } },
                { slug: { contains: query } },
                { description: { contains: query } },
                { manufacturer: { contains: query } },
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