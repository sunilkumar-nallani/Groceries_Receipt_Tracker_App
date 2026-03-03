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
Use this exact schema:
{
  "storeName": "string — store/supermarket name",
  "date": "YYYY-MM-DD — date on the receipt",
  "items": [
    {
      "name": "string — product name",
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
