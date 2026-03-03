"use client";

import { useState } from "react";
import { ReceiptScanner } from "@/components/ReceiptScanner";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { Receipt } from "@/lib/types";
import { db } from "@/lib/db";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScanPage() {
    const router = useRouter();
    const [parsedData, setParsedData] = useState<Partial<Receipt> | null>(null);
    const [imageBase64, setImageBase64] = useState<string>("");
    const [success, setSuccess] = useState(false);

    const handleParsed = (data: Partial<Receipt>, img: string) => {
        setParsedData(data);
        setImageBase64(img);
    };

    const handleSave = async (receipt: Receipt) => {
        try {
            await db.receipts.add(receipt);
            setSuccess(true);
            setParsedData(null);
        } catch (error) {
            console.error("Failed to save receipt", error);
            alert("Failed to save receipt to storage.");
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center h-[70vh]">
                <CheckCircle2 className="w-20 h-20 text-primary" strokeWidth={2.5} />
                <h2 className="text-3xl font-black tracking-wide text-foreground">Receipt Saved!</h2>
                <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
                    <Button className="w-full h-14 rounded-2xl btn-3d font-extrabold uppercase tracking-wide" onClick={() => setSuccess(false)}>Scan Another</Button>
                    <Button variant="outline" className="w-full h-14 rounded-2xl btn-3d font-extrabold uppercase tracking-wide border-2 bg-card" onClick={() => router.push("/")}>Go to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-lg mx-auto py-10 px-5 space-y-8 pb-32">
            <div className="px-1">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Scan Receipt</h1>
                <p className="text-muted-foreground w-full mt-2 text-[15px] font-bold leading-relaxed">
                    Upload or photograph a grocery receipt. The AI will extract the details automatically.
                </p>
            </div>

            {!parsedData ? (
                <ReceiptScanner onParsed={handleParsed} />
            ) : (
                <ReceiptPreview
                    initialData={parsedData}
                    imageBase64={imageBase64}
                    onSave={handleSave}
                    onCancel={() => setParsedData(null)}
                />
            )}
        </div>
    );
}
