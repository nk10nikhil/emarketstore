import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

// GET all orders with pagination and filtering
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const email = searchParams.get('email');
        const status = searchParams.get('status');

        const skip = (page - 1) * limit;

        // Build query based on filters
        const where: any = {};

        if (email) {
            where.email = email;
        }

        if (status) {
            where.status = status;
        }

        // Get total count for pagination
        const totalOrders = await prisma.customer_order.count({ where });

        // Get orders with pagination
        const orders = await prisma.customer_order.findMany({
            where,
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                dateTime: 'desc'
            },
            skip,
            take: limit,
        });

        return NextResponse.json({
            orders,
            pagination: {
                total: totalOrders,
                page,
                limit,
                pages: Math.ceil(totalOrders / limit),
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch orders", message: error.message },
            { status: 500 }
        );
    }
}

// POST new order
export async function POST(req: NextRequest) {
    try {
        const orderData = await req.json();
        const { products, ...orderDetails } = orderData;

        // Create the order and its product relations in a transaction
        const order = await prisma.$transaction(async (prisma) => {
            // Create the order
            const newOrder = await prisma.customer_order.create({
                data: {
                    ...orderDetails,
                    status: orderDetails.status || 'pending',
                },
            });

            // Create order-product relationships
            if (products && products.length > 0) {
                for (const item of products) {
                    await prisma.customer_order_product.create({
                        data: {
                            customerOrderId: newOrder.id,
                            productId: item.productId,
                            quantity: item.quantity,
                        },
                    });
                }
            }

            // Return the created order with products
            return prisma.customer_order.findUnique({
                where: { id: newOrder.id },
                include: {
                    products: {
                        include: {
                            product: true
                        }
                    }
                }
            });
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to create order", message: error.message },
            { status: 500 }
        );
    }
}