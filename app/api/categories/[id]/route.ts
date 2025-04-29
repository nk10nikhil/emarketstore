import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                products: true,
                _count: {
                    select: { products: true }
                }
            }
        });

        if (!category) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch category", message: error.message },
            { status: 500 }
        );
    }
}

// Update category
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { name } = await req.json();

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: { name }
        });

        return NextResponse.json(updatedCategory);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to update category", message: error.message },
            { status: 500 }
        );
    }
}

// Delete category
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const deletedCategory = await prisma.category.delete({
            where: { id }
        });

        return NextResponse.json(deletedCategory);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to delete category", message: error.message },
            { status: 500 }
        );
    }
}