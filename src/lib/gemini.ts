import { GoogleGenerativeAI } from "@google/generative-ai";
import { Receipt } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function parseReceiptImage(base64Image: string, mimeType: string): Promise<Partial<Receipt>> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY environment variable. Please add it to .env.local");
    }

    const prompt = `
You are a grocery receipt parser. Analyze this receipt image and extract all data.
Return ONLY a valid JSON object. No explanation, no markdown formatting like \`\`\`json, just raw JSON.

STRICT DATE RULES:
1. Look for the date in formats like DD.MM.YYYY, DD.MM.YY, or YYYY-MM-DD.
2. If only 2 digits are provided for the year (e.g., 26), assume 2026.
3. Today's date is ${new Date().toISOString().split('T')[0]}. If the receipt year seems to be in the past (like 2024) but the day/month match today, favor the current year unless clearly otherwise.
4. If you see a date like "03.02.26" on a German receipt, it is likely March 2nd 2026 (DD.MM.YY).

STRICT STORE RULES:
1. Extract the commercial name of the store (e.g., "Rewe", "Aldi", "Lidl", "Edeka").
2. Do not include branch numbers or street addresses in the storeName.

Use this exact schema:
{
  "storeName": "string",
  "date": "YYYY-MM-DD",
  "items": [
    {
      "name": "string",
      "quantity": number,
      "unitPrice": number,
      "totalPrice": number
    }
  ],
  "subtotal": number,
  "total": number,
  "currency": "EUR"
}
If the receipt is in German, translate item names to English.
If any field cannot be determined, use null.
`;

    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType
        },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    try {
        // Strip possible markdown formatting if the model still outputs it
        const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleanText) as Partial<Receipt>;
    } catch {
        console.error("Failed to parse Gemini JSON output:", text);
        throw new Error("Failed to parse receipt data.");
    }
}
