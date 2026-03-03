"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Camera, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { db } from "@/lib/db";
import { startOfMonth, subMonths, isSameMonth } from "date-fns";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  const [receiptCount, setReceiptCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const now = new Date();
        const startOfLast = startOfMonth(subMonths(now, 1));

        const receipts = await db.receipts.toArray();

        let currentTotal = 0;
        let lastTotal = 0;
        let currentCount = 0;

        receipts.forEach((r) => {
          const rDate = new Date(r.date);
          if (isSameMonth(rDate, now)) {
            currentTotal += r.total;
            currentCount++;
          } else if (isSameMonth(rDate, startOfLast)) {
            lastTotal += r.total;
          }
        });

        setThisMonthTotal(currentTotal);
        setLastMonthTotal(lastTotal);
        setReceiptCount(currentCount);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const diff = thisMonthTotal - lastMonthTotal;
  const percentChange = lastMonthTotal > 0 ? (diff / lastMonthTotal) * 100 : 0;

  return (
    <div className="container max-w-lg mx-auto py-10 px-5 space-y-8 pb-32">
      <div className="flex justify-between items-center px-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Overview</h1>
      </div>

      <Card className="border-2 border-border shadow-sm rounded-2xl bg-card overflow-hidden">
        <CardHeader className="pb-2 pt-6 px-6">
          <CardTitle className="text-xs font-bold tracking-widest text-muted-foreground uppercase">This Month&apos;s Spending</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="text-4xl font-black tracking-tight text-foreground">
            {loading ? "..." : `€${thisMonthTotal.toFixed(2)}`}
          </div>

          {!loading && (
            <div className="flex items-center mt-3 text-sm font-bold">
              {diff > 0 ? (
                <span className="text-destructive flex items-center bg-destructive/10 px-3 py-1.5 rounded-xl">
                  <TrendingUp className="w-4 h-4 mr-1.5" strokeWidth={3} />
                  +€{diff.toFixed(2)} ({percentChange.toFixed(1)}%)
                </span>
              ) : diff < 0 ? (
                <span className="text-primary flex items-center bg-primary/10 px-3 py-1.5 rounded-xl">
                  <TrendingDown className="w-4 h-4 mr-1.5" strokeWidth={3} />
                  -€{Math.abs(diff).toFixed(2)} ({Math.abs(percentChange).toFixed(1)}%)
                </span>
              ) : (
                <span className="text-muted-foreground flex items-center bg-muted/50 px-3 py-1.5 rounded-xl border-2 border-transparent">
                  <Minus className="w-4 h-4 mr-1.5" strokeWidth={3} />
                  No change
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-2 border-border shadow-sm rounded-2xl bg-card">
          <CardHeader className="pb-2 pt-5 px-5">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Receipts Scanned</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-black tracking-tight text-foreground">{loading ? "-" : receiptCount}</div>
            <p className="text-sm text-muted-foreground mt-0.5 font-bold">This month</p>
          </CardContent>
        </Card>
      </div>

      <Button size="lg" className="w-full text-lg h-14 rounded-2xl btn-3d font-extrabold uppercase tracking-wide" onClick={() => router.push("/scan")}>
        <Camera className="w-6 h-6 mr-2" strokeWidth={2.5} />
        Scan New Receipt
      </Button>
    </div>
  );
}
