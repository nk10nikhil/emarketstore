import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET all images for a product
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        const images = await prisma.image.findMany({
            where: {
                productID: productId
            }
        });

        return NextResponse.json(images);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch images", message: error.message },
            { status: 500 }
        );
    }
}

// POST a new image - requires multipart form data handling
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Only allow admin users to upload images
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: "You must be an admin to upload images" },
                { status: 403 }
            );
        }

        // In a real implementation, you'd use a service like AWS S3 or Cloudinary
        // For this example, we'll assume the image is uploaded somewhere and we get a URL
        const { productID, imageUrl } = await req.json();

        const newImage = await prisma.image.create({
            data: {
                productID,
                image: imageUrl
            }
        });

        return NextResponse.json(newImage, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to upload image", message: error.message },
            { status: 500 }
        );
    }
}