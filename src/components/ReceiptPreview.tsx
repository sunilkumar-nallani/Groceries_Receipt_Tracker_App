"use client";

import { useState } from "react";
import { Receipt, ReceiptItem } from "@/lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Trash2, Plus, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { v4 as uuidv4 } from "uuid";

interface ReceiptPreviewProps {
    initialData: Partial<Receipt>;
    imageBase64: string;
    onSave: (receipt: Receipt) => Promise<void>;
    onCancel: () => void;
}

export function ReceiptPreview({ initialData, imageBase64, onSave, onCancel }: ReceiptPreviewProps) {
    const [storeName, setStoreName] = useState(initialData.storeName || "");
    const [date, setDate] = useState(initialData.date || new Date().toISOString().split("T")[0]);
    const [subtotal, setSubtotal] = useState(initialData.subtotal?.toString() || "");
    const [total, setTotal] = useState(initialData.total?.toString() || "");
    const [items, setItems] = useState<ReceiptItem[]>(initialData.items || []);
    const [saving, setSaving] = useState(false);

    const handleItemChange = (index: number, field: keyof ReceiptItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto calculate totalPrice if unitPrice and quantity are present
        if (field === 'quantity' || field === 'unitPrice') {
            const q = Number(newItems[index].quantity) || 1;
            const p = Number(newItems[index].unitPrice) || 0;
            newItems[index].totalPrice = Number((q * p).toFixed(2));
        }

        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const addItem = () => {
        setItems([...items, { name: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]);
    };

    const handleSave = async () => {
        setSaving(true);
        const receipt: Receipt = {
            id: uuidv4(),
            storeName,
            date,
            items,
            subtotal: Number(subtotal) || 0,
            total: Number(total) || 0,
            currency: initialData.currency || "EUR",
            imageBase64,
            createdAt: new Date().toISOString(),
        };
        await onSave(receipt);
        setSaving(false);
    };

    return (
        <Card className="w-full border-2 border-border shadow-sm bg-card rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/40 pb-5 border-b-2 border-border">
                <CardTitle className="text-2xl font-black tracking-tight text-foreground">Verify Receipt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6">

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Store Name</Label>
                        <Input className="border-2 border-border rounded-xl h-12 font-bold" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Date</Label>
                        <Input className="border-2 border-border rounded-xl h-12 font-bold" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label className="text-base font-black">Items</Label>
                        <Button variant="outline" size="sm" className="btn-3d border-2 rounded-xl font-bold" onClick={addItem}>
                            <Plus className="w-4 h-4 mr-1" strokeWidth={3} /> Add
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {items.map((item, i) => (
                            <div key={i} className="flex gap-2 items-start relative border-2 p-2 rounded-xl bg-muted/30">
                                <div className="flex-1 space-y-2">
                                    <Input
                                        placeholder="Item name"
                                        value={item.name}
                                        onChange={(e) => handleItemChange(i, "name", e.target.value)}
                                        className="h-10 border-2 rounded-lg font-bold"
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(i, "quantity", Number(e.target.value))}
                                            className="h-10 w-20 border-2 rounded-lg font-bold"
                                        />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Price"
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(i, "unitPrice", Number(e.target.value))}
                                            className="h-10 flex-1 border-2 rounded-lg font-bold"
                                        />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Total"
                                            value={item.totalPrice}
                                            onChange={(e) => handleItemChange(i, "totalPrice", Number(e.target.value))}
                                            className="h-10 flex-1 border-2 rounded-lg font-bold"
                                        />
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-destructive hover:bg-destructive/10">
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        ))}
                        {items.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-2 font-bold">No items found.</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-5 border-t-2">
                    <div className="space-y-2">
                        <Label className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Subtotal</Label>
                        <Input className="border-2 border-border rounded-xl h-12 font-bold" type="number" step="0.01" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-black uppercase text-[10px] tracking-wider text-primary">Total</Label>
                        <Input className="border-2 border-primary/50 bg-primary/5 rounded-xl h-12 font-black text-lg text-primary" type="number" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button variant="outline" className="flex-1 h-12 rounded-2xl btn-3d font-extrabold uppercase tracking-wide border-2 bg-card" onClick={onCancel} disabled={saving}>Cancel</Button>
                    <Button className="flex-1 h-12 rounded-2xl btn-3d font-extrabold uppercase tracking-wide border-b-[4px] border-b-green-700 active:border-b-2" onClick={handleSave} disabled={saving}>
                        <Save className="w-5 h-5 mr-2" strokeWidth={2.5} />
                        {saving ? "Saving..." : "Save Receipt"}
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}
