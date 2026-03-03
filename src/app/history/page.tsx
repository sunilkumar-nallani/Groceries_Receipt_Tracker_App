"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Trash2, Download, Search, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { exportToCsv } from "@/lib/csv";
import { Input } from "@/components/ui/input";

export default function HistoryPage() {
    const receipts = useLiveQuery(() => db.receipts.orderBy("date").reverse().toArray());
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this receipt?")) {
            await db.receipts.delete(id);
        }
    };

    const filtered = receipts?.filter(r =>
        r.storeName.toLowerCase().includes(search.toLowerCase()) ||
        r.date.includes(search)
    ) || [];

    return (
        <div className="container max-w-lg mx-auto py-10 px-5 space-y-8 pb-32">
            <div className="flex justify-between items-center px-1">
                <h1 className="text-3xl font-black tracking-tight text-foreground">History</h1>
                <Button variant="secondary" className="rounded-xl border-2 border-border btn-3d font-bold tracking-wide h-10 px-4" size="sm" onClick={() => receipts && exportToCsv(receipts)} disabled={!receipts?.length}>
                    <Download className="w-4 h-4 mr-2" strokeWidth={2.5} />
                    CSV
                </Button>
            </div>

            <div className="relative border-2 border-border shadow-sm rounded-2xl bg-card">
                <Search className="absolute left-4 top-3.5 h-6 w-6 text-muted-foreground" strokeWidth={2.5} />
                <Input
                    placeholder="Search by store or date (YYYY-MM-DD)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-14 rounded-2xl border-0 bg-transparent text-base font-bold w-full focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:font-bold"
                />
            </div>

            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10 font-bold">No receipts found.</p>
                ) : (
                    filtered.map((r) => (
                        <Card
                            key={r.id}
                            className="cursor-pointer border-2 border-b-4 border-border shadow-sm bg-card rounded-2xl transition-transform active:translate-y-1 active:border-b-2"
                            onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                        >
                            <CardHeader className="p-5 pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl font-bold tracking-tight">{r.storeName}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1 font-medium">{format(new Date(r.date), "MMM d, yyyy")}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">€{r.total.toFixed(2)}</p>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive -mr-2" onClick={(e) => handleDelete(r.id, e)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            {expandedId === r.id && (
                                <CardContent className="p-4 pt-0 border-t mt-2">
                                    <div className="mt-4 space-y-2">
                                        <h4 className="text-sm font-semibold text-muted-foreground">Items</h4>
                                        <div className="space-y-1">
                                            {r.items.map((item, i) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <span className="truncate pr-4 flex-1">{item.quantity}x {item.name}</span>
                                                    <span>€{item.totalPrice.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {r.imageBase64 && (
                                        <div className="mt-6">
                                            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                                                <ImageIcon className="w-4 h-4 mr-1" /> Original Image
                                            </h4>
                                            <div className="rounded-md overflow-hidden border">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={r.imageBase64.startsWith("data:") ? r.imageBase64 : `data:image/jpeg;base64,${r.imageBase64}`}
                                                    alt={`Receipt from ${r.storeName}`}
                                                    className="w-full object-contain max-h-64 bg-muted"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
