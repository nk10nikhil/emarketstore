import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET a single order product
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // This endpoint should only be accessible by admin users
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: "You must be an admin to access this resource" },
                { status: 403 }
            );
        }

        const { id } = params;

        const orderProduct = await prisma.customer_order_product.findUnique({
            where: { id },
            include: {
                product: true,
                customerOrder: true
            }
        });

        if (!orderProduct) {
            return NextResponse.json(
                { error: "Order product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(orderProduct);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch order product", message: error.message },
            { status: 500 }
        );
    }
}

// Update order product
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // This endpoint should only be accessible by admin users
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: "You must be an admin to update order products" },
                { status: 403 }
            );
        }

        const { id } = params;
        const { quantity } = await req.json();

        if (quantity === undefined) {
            return NextResponse.json(
                { error: "Quantity is required" },
                { status: 400 }
            );
        }

        const updatedOrderProduct = await prisma.customer_order_product.update({
            where: { id },
            data: { quantity },
            include: {
                product: true,
                customerOrder: true
            }
        });

        return NextResponse.json(updatedOrderProduct);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to update order product", message: error.message },
            { status: 500 }
        );
    }
}

// Delete order product
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // This endpoint should only be accessible by admin users
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: "You must be an admin to delete order products" },
                { status: 403 }
            );
        }

        const { id } = params;

        const deletedOrderProduct = await prisma.customer_order_product.delete({
            where: { id }
        });

        return NextResponse.json(deletedOrderProduct);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to delete order product", message: error.message },
            { status: 500 }
        );
    }
}