import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET all order products
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // This endpoint should only be accessible by admin users
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: "You must be an admin to access this resource" },
                { status: 403 }
            );
        }

        const searchParams = req.nextUrl.searchParams;
        const orderId = searchParams.get('orderId');
        const productId = searchParams.get('productId');

        const where: any = {};

        if (orderId) {
            where.customerOrderId = orderId;
        }

        if (productId) {
            where.productId = productId;
        }

        const orderProducts = await prisma.customer_order_product.findMany({
            where,
            include: {
                product: true,
                customerOrder: true
            }
        });

        return NextResponse.json(orderProducts);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch order products", message: error.message },
            { status: 500 }
        );
    }
}

// POST a new order product
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // This endpoint should only be accessible by admin users
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: "You must be an admin to add order products" },
                { status: 403 }
            );
        }

        const { customerOrderId, productId, quantity } = await req.json();

        if (!customerOrderId || !productId || !quantity) {
            return NextResponse.json(
                { error: "Customer order ID, product ID, and quantity are required" },
                { status: 400 }
            );
        }

        // Check if the order product already exists
        const existingOrderProduct = await prisma.customer_order_product.findFirst({
            where: {
                customerOrderId,
                productId
            }
        });

        if (existingOrderProduct) {
            // Update quantity instead of creating a new record
            const updatedOrderProduct = await prisma.customer_order_product.update({
                where: { id: existingOrderProduct.id },
                data: { quantity: quantity },
                include: {
                    product: true,
                    customerOrder: true
                }
            });

            return NextResponse.json(updatedOrderProduct);
        }

        // Create a new order product
        const orderProduct = await prisma.customer_order_product.create({
            data: {
                customerOrderId,
                productId,
                quantity
            },
            include: {
                product: true,
                customerOrder: true
            }
        });

        return NextResponse.json(orderProduct, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to create order product", message: error.message },
            { status: 500 }
        );
    }
}