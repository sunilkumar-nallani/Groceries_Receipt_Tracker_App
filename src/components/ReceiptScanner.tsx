"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { Receipt } from "@/lib/types";
import { Input } from "./ui/input";
import { Loader2, Camera, Upload } from "lucide-react";

export function ReceiptScanner({ onParsed }: { onParsed: (data: Partial<Receipt>, imageBase64: string) => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            setError(null);

            // 1. Compress Image
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);

            // 2. Convert to Base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];

                // 3. Send to Gemini API
                try {
                    const res = await fetch("/api/parse-receipt", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            image: base64String,
                            mimeType: compressedFile.type,
                        }),
                    });

                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Failed to parse receipt");

                    // Generate full data url for local display/saving
                    const fullBase64Url = `data:${compressedFile.type};base64,${base64String}`;
                    onParsed(data, fullBase64Url);

                } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : "An error occurred while parsing the receipt.");
                } finally {
                    setLoading(false);
                }
            };

            reader.readAsDataURL(compressedFile);

        } catch (err) {
            console.error(err);
            setError("Failed to process the image.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            <div className="flex gap-4">
                {/* Camera Input */}
                <div className="relative flex-1 group">
                    <Input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        disabled={loading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full flex flex-col items-center justify-center gap-3 h-36 rounded-2xl border-2 border-primary/20 bg-primary text-primary-foreground btn-3d border-b-[6px] border-b-green-700 active:border-b-2">
                        <Camera className="w-10 h-10" strokeWidth={2.5} />
                        <span className="font-extrabold text-lg tracking-wide uppercase">Take Photo</span>
                    </div>
                </div>

                {/* Gallery Input */}
                <div className="relative flex-1 group">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={loading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full flex flex-col items-center justify-center gap-3 h-36 rounded-2xl border-2 border-border bg-card text-foreground btn-3d border-b-[6px] active:border-b-2 hover:bg-muted/50">
                        <Upload className="w-10 h-10 text-muted-foreground" strokeWidth={2.5} />
                        <span className="font-extrabold text-lg tracking-wide uppercase text-muted-foreground">Upload Image</span>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center p-8 space-x-2 text-muted-foreground animate-pulse">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <p>Gemini is reading your receipt...</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}
