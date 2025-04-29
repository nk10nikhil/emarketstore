import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

// GET all products
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const categoryId = searchParams.get('categoryId');

        const skip = (page - 1) * limit;

        // Build query based on filters
        const where: any = {};

        // Add category filter if provided
        if (categoryId) {
            where.categoryId = categoryId;
        }

        // Get total count for pagination
        const totalProducts = await prisma.product.count({ where });

        // Get products with pagination
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
                total: totalProducts,
                page,
                limit,
                pages: Math.ceil(totalProducts / limit),
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch products", message: error.message },
            { status: 500 }
        );
    }
}

// POST new product
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const product = await prisma.product.create({
            data: {
                slug: data.slug,
                title: data.title,
                mainImage: data.mainImage,
                price: data.price,
                rating: data.rating || 0,
                description: data.description,
                manufacturer: data.manufacturer,
                inStock: data.inStock || 1,
                categoryId: data.categoryId,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to create product", message: error.message },
            { status: 500 }
        );
    }
}