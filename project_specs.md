# Project Specs — AI Grocery Spending Tracker

---

## What We Are Building

A personal web application that lets the user scan physical grocery receipts using their phone or computer camera, automatically extract all spending data using AI, and see clear monthly summaries of how much they spend on groceries — broken down by store, month, and week.

This solves the problem of accumulating months of physical grocery bills without ever knowing total monthly spending.

---

## Core User Problem

- User collects physical grocery bills but never calculates monthly totals
- Manually adding up 10 months of receipts is tedious and time-consuming
- User needs an easy scan-and-forget solution that tracks everything automatically

---

## Pages and Features

### Page 1: Dashboard (Home)
- Shows total spending this month (large, prominent number)
- Shows spending vs. last month (up/down indicator)
- Shows number of receipts scanned this month
- Quick "Scan New Receipt" button (primary CTA)
- Mini chart: last 6 months of spending

### Page 2: Scan Receipt
- Camera capture button (opens device camera)
- File upload button (for saved receipt photos)
- Live OCR progress indicator ("Reading your receipt...")
- Extracted data preview (store name, date, items list, total)
- User can correct any wrong field before saving
- "Save Receipt" button
- Explains to user what was extracted

### Page 3: Receipt History
- List of all scanned receipts sorted by date (newest first)
- Each receipt shows: store name, date, total amount
- Click to expand and see full item list
- Delete button per receipt
- Filter by month or store name

### Page 4: Insights
- Monthly spending bar chart (all months with data)
- Store-wise spending pie chart
- Weekly average spending
- Most expensive single receipt
- Most frequently visited store
- Month-over-month comparison table

---

## Data Model

Each saved receipt must store:

```typescript
type Receipt = {
  id: string;               // unique ID (UUID)
  storeName: string;        // e.g. "REWE", "Aldi", "Lidl"
  date: string;             // ISO date string "YYYY-MM-DD"
  items: ReceiptItem[];     // list of purchased items
  subtotal: number;         // before tax
  total: number;            // final amount paid
  currency: string;         // "EUR" default
  rawText: string;          // original OCR text (for debugging)
  createdAt: string;        // when the receipt was scanned
};

type ReceiptItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};
```

---

## AI Pipeline (Step by Step)

### Step 1 — OCR (Tesseract.js)
- User uploads or photographs a receipt
- Tesseract.js runs in the browser (no API call, completely free)
- Returns raw text string from the image
- Show progress bar during OCR (it takes 3–10 seconds)

### Step 2 — Gemini Parsing (Free API)
- Send raw OCR text to `/api/parse-receipt` Next.js API route
- API route calls Gemini 2.0 Flash with this exact prompt structure:
```
You are a receipt parser. Extract structured data from this grocery receipt text.
Return ONLY valid JSON matching this schema exactly:
{
  "storeName": string,
  "date": "YYYY-MM-DD",
  "items": [{ "name": string, "quantity": number, "unitPrice": number, "totalPrice": number }],
  "subtotal": number,
  "total": number,
  "currency": string
}
If a field cannot be determined, use null.
Receipt text:
[RAW OCR TEXT HERE]
```
- Parse JSON response
- Return to frontend

### Step 3 — User Review
- Show extracted data to user before saving
- Allow editing of any field (especially store name and date)
- Confirm and save to IndexedDB

### Step 4 — Storage
- Save Receipt object to IndexedDB using `idb` library
- Data persists across browser sessions
- Works offline after first load

---

## Free Services — Setup Instructions for User

The agent must tell the user to complete these steps manually:

### 1. Get Free Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Create a file called `.env.local` in the project root
6. Add this line: `GEMINI_API_KEY=your_key_here`

### 2. Deploy to Vercel (Free)
1. Go to https://vercel.com and sign up with GitHub (free)
2. Push project to a GitHub repository
3. Import repository in Vercel dashboard
4. Add environment variable: `GEMINI_API_KEY` = your key
5. Click Deploy

---

## Constraints

- Zero cost: every service used must have a permanently free tier
- No backend server: all data stored in browser IndexedDB
- No login/auth required
- Must work on mobile browser (responsive design)
- Must handle German receipt formats (Rewe, Aldi, Lidl, Edeka, Penny)
- Default currency: EUR (€)
- Language: English UI, but receipt text can be German

---

## Definition of Done

The app is complete and working when ALL of the following are true:

- [ ] Receipt image can be uploaded from file or camera
- [ ] OCR extracts text from receipt image correctly
- [ ] Gemini correctly parses store name, date, items, and total from German receipts
- [ ] Parsed data is shown to user for review before saving
- [ ] Receipt is saved to browser storage and survives page refresh
- [ ] Dashboard correctly shows this month's total
- [ ] Monthly bar chart shows correct spending across all saved months
- [ ] Store breakdown chart shows correct per-store spending
- [ ] Receipt history shows all saved receipts
- [ ] Receipts can be deleted
- [ ] App is deployed on Vercel and accessible via URL
- [ ] No API key or secret is visible in the browser or frontend code
- [ ] Tested with at least one real receipt image

---

## Error Handling Requirements

- If OCR fails or returns empty text: show "Could not read receipt. Please try a clearer photo."
- If Gemini parsing fails: show raw OCR text and let user enter data manually
- If GEMINI_API_KEY is missing: show clear setup instructions to user
- If storage is full: warn user and suggest exporting data

---

## Build Order (Mandatory Sequence)

1. Project setup (Next.js + Tailwind + shadcn + dependencies)
2. Type definitions (`lib/types.ts`)
3. Storage layer (`lib/db.ts` — IndexedDB with idb)
4. OCR integration (`lib/ocr.ts` — Tesseract.js)
5. Gemini API route (`app/api/parse-receipt/route.ts`)
6. Receipt Scanner component (`components/ReceiptScanner.tsx`)
7. Scan page (`app/scan/page.tsx`) — test full pipeline here
8. Storage confirmed working — save and retrieve a receipt
9. Dashboard page (`app/page.tsx`)
10. Receipt history page (`app/history/page.tsx`)
11. Insights/charts page (`app/insights/page.tsx`)
12. Final styling pass (mobile responsive)
13. Deploy to Vercel
14. End-to-end test with a real receipt image
