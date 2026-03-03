import { NextResponse } from "next/server";
import { parseReceiptImage } from "@/lib/gemini";

export const maxDuration = 60; // Allow more time for Gemini Vision on Vercel hobby

export async function POST(req: Request) {
    try {
        const { image, mimeType } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const data = await parseReceiptImage(image, mimeType || "image/jpeg");

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("Error parsing receipt:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to parse receipt" },
            { status: 500 }
        );
    }
}
