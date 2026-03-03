# Project Plan — AI Grocery Spending Tracker
## Status: APPROVED — Execution in progress.

---

## What I Read

I have fully read both `web_app_instructions.md` and `project_specs.md`.
I understand the full scope, the free-only constraint, the build order, and the definition of done.

---

## Final Tech Stack & Improvements

Based on our agreement, we are using the original specs with the following 9 improvements:

1. **Gemini Vision Directly**: Direct image parsing without Tesseract.
2. **Dexie.js**: For easier and more robust IndexedDB storage.
3. **PWA (Serwist)**: Installable on a phone with offline support.
4. **Gemini 2.5 Flash**: Use the latest and most capable free model.
5. **CSV Export**: Allow exporting all receipts to CSV.
6. **Native Camera Input**: Use `<input type="file" capture="environment">` for better native camera handling.
7. **Client-Side Image Compression**: Shrink photos strictly to ~1MB or lower using `browser-image-compression` to speed up cellular uploads.
8. **Preserve Compressed Image**: Save the ~1MB image in Dexie.js as a base64 string or Blob.
9. **Dark Mode**: Add `next-themes` to support system dark/light modes out of the box.

| Layer             | Tool                          | Cost  | Why                                      |
|-------------------|-------------------------------|-------|------------------------------------------|
| Framework         | Next.js 14 (App Router) + TS  | Free  | Modern, fast, Vercel-native              |
| Styling           | Tailwind CSS + shadcn/ui      | Free  | Clean UI components out of the box       |
| Light/Dark Mode   | next-themes                   | Free  | Premium PWA feel                         |
| Receipt AI        | Gemini 2.5 Flash (Vision API) | Free  | Reads image directly                     |
| Image Compression | browser-image-compression     | Free  | Faster API calls on cellular data        |
| Storage           | Dexie.js (IndexedDB)          | Free  | Fast, offline, browser-native            |
| Charts            | Recharts                      | Free  | Built into shadcn ecosystem              |
| PWA               | Serwist                       | Free  | Installable, offline-capable             |
| Deployment        | Vercel (Hobby tier)           | Free  | One-click deploy from GitHub             |

---

## Pages to Build

### Page 1: Dashboard (/)
- Large card: "This Month: €XX.XX"
- Comparison badge vs last month (e.g. "↑ €12 more than February")
- Total receipts scanned this month
- Mini bar chart: last 6 months
- Prominent "Scan Receipt" button

### Page 2: Scan Receipt (/scan)
- One native button: `<input type="file" capture="environment" accept="image/*">`
- Client-side image compression step
- Loading state: "Gemini is reading your receipt..." with spinner
- Result preview: store name, date, all items, total
- Every field is editable before saving
- "Save Receipt" button + "Scan Another" link

### Page 3: Receipt History (/history)
- All receipts, newest first
- Each row: store icon, store name, date, total
- Click to expand → full item list and receipt image thumbnail
- Filter dropdown: by month, by store
- Delete button per receipt (with confirmation)
- "Export CSV" button at top

### Page 4: Insights (/insights)
- Monthly spending bar chart (all months with data)
- Store-wise spending pie/donut chart
- Stats cards: weekly average, most expensive receipt, top store, total all-time
- Month-over-month comparison table

---

## Data Model

```typescript
// lib/types.ts

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
```

---

## Build Order (14 Steps — Mandatory Sequence)

| Step | Task                                    | Test Criteria                                         |
|------|-----------------------------------------|-------------------------------------------------------|
| 1    | Project setup + all dependencies        | `npm run dev` runs without errors                     |
| 2    | TypeScript types (`lib/types.ts`)        | No type errors                                        |
| 3    | Dexie.js database (`lib/db.ts`)          | Can save and retrieve a mock receipt                  |
| 4    | Gemini API route (`/api/parse-receipt`) | Returns valid JSON for a test receipt image           |
| 5    | ReceiptScanner component                | Image capture & compression works                     |
| 6    | ReceiptPreview component                | Parsed data displayed, all fields editable            |
| 7    | Scan page — full pipeline test          | Upload image → see parsed data → save → no errors     |
| 8    | Verify storage                          | Saved receipt & image appear after page refresh       |
| 9    | Dashboard page                          | Correct monthly total shown from saved receipts       |
| 10   | Navigation component                    | All pages reachable, active state correct             |
| 11   | History page + CSV export               | All receipts listed, CSV downloads correctly          |
| 12   | Insights page + charts                  | Charts render correctly with real saved data          |
| 13   | PWA + Dark Mode setup                   | Install prompt, offline support, dark mode toggle     |
| 14   | Deploy to Vercel                        | Live URL works end-to-end with a real receipt image   |

---

## Waiting for Your Approval

Approved by user. Execution started.
