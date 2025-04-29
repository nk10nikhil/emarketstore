import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

// GET a single order by ID
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const order = await prisma.customer_order.findUnique({
            where: { id },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(order);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch order", message: error.message },
            { status: 500 }
        );
    }
}

// Update order
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const orderData = await req.json();

        const updatedOrder = await prisma.customer_order.update({
            where: { id },
            data: {
                name: orderData.name,
                lastname: orderData.lastname,
                phone: orderData.phone,
                email: orderData.email,
                company: orderData.company,
                adress: orderData.adress,
                apartment: orderData.apartment,
                postalCode: orderData.postalCode,
                status: orderData.status,
                city: orderData.city,
                country: orderData.country,
                orderNotice: orderData.orderNotice,
                total: orderData.total,
            }
        });

        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to update order", message: error.message },
            { status: 500 }
        );
    }
}

// Delete order
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Delete associated order products first (if needed - Cascade should handle this)
        await prisma.customer_order_product.deleteMany({
            where: { customerOrderId: id }
        });

        // Delete the order
        const deletedOrder = await prisma.customer_order.delete({
            where: { id }
        });

        return NextResponse.json(deletedOrder);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to delete order", message: error.message },
            { status: 500 }
        );
    }
}