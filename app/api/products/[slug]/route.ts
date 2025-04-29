import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;

        const product = await prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch product", message: error.message },
            { status: 500 }
        );
    }
}

// Update product
export async function PUT(
    req: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;
        const data = await req.json();

        const updatedProduct = await prisma.product.update({
            where: { slug },
            data: {
                title: data.title,
                mainImage: data.mainImage,
                price: data.price,
                rating: data.rating,
                description: data.description,
                manufacturer: data.manufacturer,
                inStock: data.inStock,
                categoryId: data.categoryId,
            },
        });

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to update product", message: error.message },
            { status: 500 }
        );
    }
}

// Delete product
export async function DELETE(
    req: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;

        const deletedProduct = await prisma.product.delete({
            where: { slug },
        });

        return NextResponse.json(deletedProduct);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to delete product", message: error.message },
            { status: 500 }
        );
    }
}