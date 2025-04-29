import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET a single image by ID
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const image = await prisma.image.findUnique({
            where: { imageID: id }
        });

        if (!image) {
            return NextResponse.json(
                { error: "Image not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(image);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch image", message: error.message },
            { status: 500 }
        );
    }
}

// Update an image
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Only allow admin users to update images
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: "You must be an admin to update images" },
                { status: 403 }
            );
        }

        const { id } = params;
        const { imageUrl } = await req.json();

        const updatedImage = await prisma.image.update({
            where: { imageID: id },
            data: {
                image: imageUrl
            }
        });

        return NextResponse.json(updatedImage);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to update image", message: error.message },
            { status: 500 }
        );
    }
}

// Delete an image
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Only allow admin users to delete images
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: "You must be an admin to delete images" },
                { status: 403 }
            );
        }

        const { id } = params;

        // In a real implementation, you'd also delete the file from storage
        // (S3, Cloudinary, etc.)

        const deletedImage = await prisma.image.delete({
            where: { imageID: id }
        });

        return NextResponse.json(deletedImage);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to delete image", message: error.message },
            { status: 500 }
        );
    }
}