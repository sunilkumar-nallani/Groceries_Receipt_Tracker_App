import { Receipt } from "./types";

export function exportToCsv(receipts: Receipt[]) {
    if (!receipts.length) return;

    const headers = ["ID", "Store Name", "Date", "Subtotal", "Total", "Currency", "Created At"];
    const rows = receipts.map(r => [
        r.id,
        `"${r.storeName.replace(/"/g, '""')}"`,
        r.date,
        r.subtotal.toString(),
        r.total.toString(),
        r.currency,
        r.createdAt
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `grocery_receipts_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
