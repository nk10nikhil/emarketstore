import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

// GET all categories
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch categories", message: error.message },
            { status: 500 }
        );
    }
}

// POST new category
export async function POST(req: NextRequest) {
    try {
        const { name } = await req.json();

        const category = await prisma.category.create({
            data: { name }
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to create category", message: error.message },
            { status: 500 }
        );
    }
}