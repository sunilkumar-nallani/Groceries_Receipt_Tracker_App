export type ReceiptItem = {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
};

export type Receipt = {
    id: string;           // auto-generated UUID
    storeName: string;    // e.g. "REWE", "Aldi Süd", "Lidl"
    date: string;         // "YYYY-MM-DD"
    items: ReceiptItem[];
    subtotal: number;
    total: number;
    currency: string;     // default: "EUR"
    imageBase64?: string; // compressed image
    createdAt: string;    // ISO timestamp of when it was scanned
};
