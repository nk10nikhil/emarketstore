import prisma from "@/utils/db";
import { NextResponse } from "next/server";

// Health check endpoint for MongoDB Atlas connection
export async function GET() {
    try {
        // Check MongoDB Atlas connection by running a simple query
        await prisma.user.findFirst({
            select: { id: true }
        });

        return NextResponse.json({
            status: "ok",
            message: "Connection to MongoDB Atlas established successfully",
            database: "MongoDB Atlas",
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: "Failed to connect to MongoDB Atlas",
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}