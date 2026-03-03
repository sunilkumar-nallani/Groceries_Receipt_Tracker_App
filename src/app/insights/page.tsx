"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, parseISO } from "date-fns";

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#14b8a6', '#f97316'];

export default function InsightsPage() {
    const receipts = useLiveQuery(() => db.receipts.toArray());

    if (!receipts) return <div className="p-8 text-center text-muted-foreground">Loading insights...</div>;
    if (receipts.length === 0) return <div className="p-8 text-center text-muted-foreground mt-8">No data available for insights yet. Scan some receipts first!</div>;

    // Monthly Data Aggregation
    const monthlyData: Record<string, number> = {};
    let totalSpentAllTime = 0;
    let maxReceipt = receipts[0];

    const storeData: Record<string, number> = {};

    receipts.forEach(r => {
        // Monthly
        const month = format(parseISO(r.date), "MMM yyyy");
        monthlyData[month] = (monthlyData[month] || 0) + r.total;

        // Store
        storeData[r.storeName] = (storeData[r.storeName] || 0) + r.total;

        // All Time
        totalSpentAllTime += r.total;

        // Max
        if (r.total > maxReceipt.total) maxReceipt = r;
    });

    const chartData = Object.entries(monthlyData).map(([name, total]) => ({ name, total }));
    const pieData = Object.entries(storeData)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));

    const topStore = pieData[0]?.name || "N/A";

    // Weekly Average (Total / weeks since first receipt)
    const firstDate = Math.min(...receipts.map(r => new Date(r.date).getTime()));
    const msElapsed = Date.now() - firstDate;
    const weeksElapsed = Math.max(1, msElapsed / (1000 * 60 * 60 * 24 * 7));
    const weeklyAverage = totalSpentAllTime / weeksElapsed;

    return (
        <div className="container max-w-lg mx-auto py-10 px-5 space-y-8 pb-32">
            <h1 className="text-3xl font-black tracking-tight text-foreground px-1">Insights</h1>

            <div className="grid grid-cols-2 gap-4">
                <Card className="border-2 border-border shadow-sm bg-card rounded-2xl">
                    <CardHeader className="pb-2 pt-5 px-5">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Weekly Average</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <div className="text-3xl font-black tracking-tight text-foreground">€{weeklyAverage.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-border shadow-sm bg-card rounded-2xl">
                    <CardHeader className="pb-2 pt-5 px-5">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Top Store</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <div className="text-2xl font-black tracking-tight truncate flex items-center h-9" title={topStore}>{topStore}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-2 border-border shadow-sm bg-card rounded-2xl overflow-hidden">
                <CardHeader className="bg-muted/40 pb-4 border-b-2 border-border">
                    <CardTitle className="text-base font-black tracking-widest uppercase text-foreground">Monthly Spending</CardTitle>
                </CardHeader>
                <CardContent className="h-[280px] w-full pt-6 px-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} fontWeight="bold" />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} fontWeight="bold" />
                            <Tooltip formatter={(value: number | string | undefined) => {
                                if (typeof value === 'number') return [`€${value.toFixed(2)}`, "Total"];
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                return [value as any, "Total"];
                            }} cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '1rem', border: '2px solid var(--border)', fontWeight: 'bold' }} />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="border-2 border-border shadow-sm bg-card rounded-2xl overflow-hidden">
                <CardHeader className="bg-muted/40 pb-4 border-b-2 border-border">
                    <CardTitle className="text-base font-black tracking-widest uppercase text-foreground">Spending by Store</CardTitle>
                </CardHeader>
                <CardContent className="h-[280px] w-full flex justify-center pb-8 pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number | string | undefined) => {
                                if (typeof value === 'number') return [`€${value.toFixed(2)}`, "Spent"];
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                return [value as any, "Spent"];
                            }} contentStyle={{ borderRadius: '1rem', border: '2px solid var(--border)', fontWeight: 'bold' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="border-2 border-border shadow-sm bg-card rounded-2xl">
                <CardHeader className="pb-2 pt-6 px-6">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Most Expensive Receipt</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <div className="flex justify-between items-center mt-2">
                        <div>
                            <p className="font-bold text-lg">{maxReceipt.storeName}</p>
                            <p className="text-sm text-muted-foreground font-medium">{format(new Date(maxReceipt.date), "MMM d, yyyy")}</p>
                        </div>
                        <div className="text-3xl font-black tracking-tighter text-primary">€{maxReceipt.total.toFixed(2)}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
