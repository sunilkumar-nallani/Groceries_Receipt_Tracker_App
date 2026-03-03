# 📱 Grocery Receipt Tracker App — Technical Knowledge Report

> A clear, simple, and complete guide to everything built in this app.
> Perfect for interviews, personal learning, or sharing with others.

---

## 🏠 What Does This App Actually Do?

This is an **AI-powered Grocery Receipt Scanner** — a web app that lets you:
1.  **Take a photo or upload a picture** of any grocery receipt.
2.  The **AI automatically reads it** and extracts: store name, date, all items, quantities, prices, and the total.
3.  **Save the receipt** to your phone/browser.
4.  **Browse your full History** — all past receipts in one place.
5.  **View Insights** — charts that show you how much you spent per month and which store you visit most.
6.  **Export to a CSV file** (a spreadsheet you can open in Excel or Google Sheets).

---

## 🧱 The Tech Stack (Tools & Technologies Used)

Think of a "tech stack" as the building blocks used to construct the app. Here's each one explained simply:

---

### 1. 🖼️ Next.js (The Main Framework)

**What it is:** Next.js is like the "engine" of the car. Everything else plugs into it.

**In simple words:** It's a tool built on top of React (which is built on top of JavaScript) that makes building web apps much easier. It handles:
- **Routing**: When you click "History," it takes you to `/history` page automatically.
- **Server-Side Code**: Parts of the app (like the AI API route) run on a server, not in your browser. This keeps your API keys secret.
- **Performance**: Next.js automatically optimizes images, fonts, and page loads.

**Version used:** Next.js 14 with the **App Router** (the modern way to structure pages using folders inside `/src/app`).

**Interview Talking Point:** *"I used Next.js 14 with the App Router pattern, which gave me both server-side API routes to protect my API key and client-side components for a snappy user experience."*

---

### 2. ⚛️ React (The UI Library)

**What it is:** React is the tool that builds the visual pieces (buttons, cards, forms).

**In simple words:** Instead of writing plain HTML once and being done, React lets you create **"Components"** — reusable building blocks. For example:
- `<ReceiptScanner />` is a component. You write it once and can use it anywhere.
- When data changes (like a new receipt is added), React **automatically updates** the screen without refreshing the page.

**Key React concepts used:**
- **useState**: Like a "memory variable" inside a component. For example, `loading = true` while the AI is reading the receipt, then `loading = false` when it's done.
- **useEffect**: Runs code automatically when a page loads. Used to fetch stats from the database when the Dashboard opens.
- **Client Components**: Components marked with `"use client"` at the top, which run in the user's browser.

---

### 3. 🎨 Tailwind CSS (The Styling Tool)

**What it is:** A way to write CSS (styles/design) faster using pre-built utility classes.

**In simple words:** Instead of writing a separate CSS file with `.my-button { background: green; padding: 10px; }`, Tailwind lets you write it directly on the element: `className="bg-green-500 p-3"`.

**How we used it:**
- `rounded-2xl` → Big rounded corners on cards (Duolingo style).
- `border-2` → Thick 2px borders on all components.
- `font-black` → Extra bold "heavy" text.
- `btn-3d` → A custom utility class we defined in `globals.css` that makes buttons look "3D" with a thick bottom border that collapses when pressed.
- `dark:bg-[#131F24]` → Uses Duolingo's deep navy background when dark mode is enabled.

**Interview Talking Point:** *"I used Tailwind CSS with a custom design system defined in CSS variables so I could switch between Duolingo's light green and deep navy dark mode by just toggling a single class on the root HTML element."*

---

### 4. 🤖 Gemini Vision API (The AI Brain)

**What it is:** Google's AI that can "see" images and understand what's in them.

**In simple words:** You give it a photo of a grocery receipt (as a coded string of characters called Base64), and it sends back a structured JSON answer like:
```json
{
  "storeName": "Tesco",
  "date": "2026-03-01",
  "items": [
    { "name": "Milk", "quantity": 2, "unitPrice": 0.99, "totalPrice": 1.98 }
  ],
  "total": 1.98
}
```

**How it flows in the app:**
1. User picks a photo on their phone.
2. The image is **compressed** to save data.
3. The compressed image is converted to a **Base64 string** (a text representation of the image).
4. The string is sent to our **Next.js API route** (`/api/parse-receipt`).
5. The API route sends the image to **Google's Gemini AI** with a prompt asking it to extract the receipt data.
6. Gemini sends back a JSON answer.
7. The app shows the user the extracted data to review and edit before saving.

**Why we use a server-side API route:**  We do NOT call Gemini directly from the browser. If we did, anyone could open "Inspect Element" and steal your API key. By routing through Next.js server code, the key is hidden.

**Interview Talking Point:** *"I integrated the Gemini Vision API through a secure Next.js server-side API route. This ensures the Gemini API key is never exposed in the browser's JavaScript bundle."*

---

### 5. 🗄️ Dexie.js + IndexedDB (The Local Database)

**What it is:** IndexedDB is a built-in database inside **every browser**. Dexie.js is a friendly wrapper that makes it easy to use.

**In simple words:** Think of each browser like a "mini filing cabinet." When you save a receipt, it goes into a file drawer inside your browser. It stays there even when you close the app or turn off your computer.

**Why no cloud database?**
- No cost (IndexedDB is free and always available).
- No login required (your data never leaves your device).
- Works offline.

**How we used Dexie:**
```javascript
// Defining the database table
db.version(1).stores({
  receipts: '++id, storeName, date, total'
});

// Saving a new receipt
await db.receipts.add(receipt);

// Reading all receipts (newest first)
const receipts = await db.receipts.orderBy('date').reverse().toArray();
```

**dexie-react-hooks:** We used `useLiveQuery(() => db.receipts.toArray())` which is like a "live subscription" — whenever you add or delete a receipt, the History page **instantly updates** without any manual refresh.

**Interview Talking Point:** *"I chose IndexedDB via Dexie.js for client-side persistence. This gave us a real database with query capabilities without any backend cost. I used live queries that reactively re-render the UI whenever the data changes."*

---

### 6. 🗜️ browser-image-compression (The Image Optimizer)

**What it is:** A JavaScript library that shrinks photo file sizes before sending them.

**In simple words:** A modern iPhone photo can be 5MB–10MB. Sending that to an AI would be very slow and expensive. This library automatically shrinks it to under 1MB while keeping the image readable. All done in the browser, instantly.

**Settings used:**
```javascript
{ maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true }
```
A "web worker" means the compression runs in the **background** without freezing your screen.

---

### 7. 📱 Serwist (Progressive Web App — PWA)

**What it is:** A PWA (Progressive Web App) is a website that can behave like a native app on your phone.

**In simple words:** When you deploy this app to Vercel, users can open it in Safari or Chrome, tap "Add to Home Screen," and it creates an **icon on their phone** that opens the app full-screen like a real iOS/Android app. Serwist is the tool (built on top of Workbox) that sets that up.

**What it adds:**
- `manifest.json`: Tells the phone the app's name, icon, and colors.
- `sw.ts` (Service Worker): A background script that caches files so the app can load faster and even work offline.

**Interview Talking Point:** *"I added PWA support using Serwist, which auto-generates a service worker that caches static assets. This lets users install the web app like a native app and use it offline for viewing saved receipts."*

---

### 8. 💅 Shadcn/UI (The Component Library)

**What it is:** A set of pre-built, beautifully designed React components.

**In simple words:** Instead of building a `<Card>`, `<Button>`, `<Input>`, and `<Label>` from scratch, Shadcn gives you pre-made, accessible, and styleable versions. It **copies the code** into your project (it doesn't just install a package you can't control), so you fully own and can modify each component.

**Components used:**
- `Card` (the boxes showing spending data)
- `Button` (all the action buttons)
- `Input` / `Label` (the edit form in ReceiptPreview)
- `Toaster` (toast notifications for success/error)

---

### 9. 📊 Recharts (The Charts Library)

**What it is:** A library for drawing beautiful, responsive charts in React.

**Components used:**
- **BarChart**: The "Monthly Spending" chart (shows bars for each month).
- **PieChart**: The "Spending by Store" chart (shows slices for each store).
- **ResponsiveContainer**: Makes the charts automatically resize to fit any screen size.

---

### 10. next-themes (The Dark Mode Manager)

**What it is:** A tiny library that handles switching between Light Mode and Dark Mode.

**In simple words:** It wraps the entire app in a `<ThemeProvider>`. When you click the Dark/Light toggle button, it adds or removes a `.dark` CSS class on the `<html>` tag. All the Tailwind `dark:` classes kick in automatically. The chosen theme is saved in the browser (localStorage) so it remembers your preference next time.

---

### 11. 🔤 Nunito Font (The Typography)

**What it is:** A free Google Font with very round, friendly letterforms.

**Why we chose it:** Duolingo uses a custom typeface called "Feather Bold" which is very bubbly and rounded. `Nunito` is the closest match available from Google Fonts for free. It's loaded via Next.js's built-in `next/font/google` which self-hosts it (no external request to Google at runtime, faster and more private).

---

## 🏗️ How the App is Structured (Folder Layout)

```
/src
  /app
    /api
      /parse-receipt
        route.ts      ← Server-side API: Sends image to Gemini AI
    /history
      page.tsx         ← The History tab
    /insights
      page.tsx         ← The Insights/Charts tab
    /scan
      page.tsx         ← The Scan tab
    page.tsx           ← The Home/Dashboard tab
    layout.tsx         ← The root layout (wraps ALL pages; adds nav bar)
    globals.css        ← All global colors (CSS variables) and utility classes

  /components
    Navigation.tsx     ← The bottom tab bar
    ReceiptScanner.tsx ← The "Take Photo" / "Upload Image" buttons & logic
    ReceiptPreview.tsx ← The form to review and edit before saving

  /lib
    db.ts              ← The Dexie.js database definition
    types.ts           ← TypeScript type definitions (what a "Receipt" looks like)
    csv.ts             ← The function to export receipts to a CSV file
    utils.ts           ← Utility functions (like Tailwind class merging)
```

---

## 🔄 The Complete Data Flow (What Happens When You Scan a Receipt)

This is the most important thing to understand. Here's the step-by-step:

```
1. USER picks an image (from camera or gallery)
        ↓
2. browser-image-compression shrinks it (e.g., 8MB → 0.8MB)
        ↓
3. FileReader converts it to a Base64 text string
        ↓
4. The string is sent via a POST request to /api/parse-receipt (server)
        ↓
5. Next.js server receives it and calls Google Gemini Vision API
        ↓
6. Gemini reads the receipt image and returns structured JSON data
        ↓
7. JSON data is sent back to the browser
        ↓
8. ReceiptPreview component shows the extracted data for review
        ↓
9. User confirms or edits the information
        ↓
10. db.receipts.add(receipt) → Dexie.js saves it to IndexedDB
        ↓
11. History page INSTANTLY updates via useLiveQuery (no refresh needed)
```

---

## 🎨 The Design System (Duolingo Aesthetic)

The design was built to match the playful, vibrant look of the Duolingo mobile app.

### Color Palette
| Color | Hex Code | Usage |
| :--- | :--- | :--- |
| Primary Green | `#58CC02` | Buttons, active states, highlights |
| Dark Navy (Dark BG) | `#131F24` | Page background in dark mode |
| Card Dark | `#202F36` | Card backgrounds in dark mode |
| Destructive Red | `#FF4B4B` | Delete buttons, error states |
| Sky Blue | `#1CB0F6` | Accent color |

### Key Design Choices
- **3D Buttons**: `border-b-4 active:border-b-0 active:translate-y-1` — gives a real "click" sensation.
- **No Shadows**: All soft drop-shadows were removed and replaced with thick, flat `border-2` lines for a cleaner look.
- **Nunito Font**: Ultra-bold (`font-black`) headings with tight tracking.
- **Bottom Nav Bar**: A solid, full-width navigation bar (like Duolingo) replacing the old "floating pill."

---

## 🔒 Security: Why Is the API Key Safe?

This is a very common interview question. Here's the answer:

The `GEMINI_API_KEY` is a secret key that gives access to Google's AI. If you put it directly in your React/browser code, anyone who opens "Developer Tools" → "Sources" could read it and use it to run up your bill.

**Our solution:** We put all the Gemini code inside `/api/parse-receipt/route.ts` which is a **Next.js Server Route**. This code ONLY runs on the server (Vercel's cloud machines). It never gets sent to the browser. The browser only sends the image and receives the result — it never touches the API key.

The key is stored in `.env.local` locally and in **Vercel's Environment Variables** in production. Both are completely hidden from the browser.

---

## 🚀 Deployment Architecture

| Component | Where It Lives |
| :--- | :--- |
| The Code | GitHub repository |
| The Deployed App | Vercel (auto-deploys on every push to `main`) |
| The API Key | Vercel's encrypted Environment Variables |
| The User's Receipts | **User's own browser** (IndexedDB) |
| Any Backend Server | ❌ None — 100% Serverless |
| Any Paid Database | ❌ None — 100% Free |

---

## 🎤 Interview Cheat Sheet (Quick Answers)

**Q: What did you build?**
> "An AI-powered grocery receipt tracker. You take a photo of a receipt, and Google's Gemini Vision AI automatically extracts all the items, prices, and totals. The data is saved locally in the browser using IndexedDB."

**Q: Why no backend?**
> "I intentionally designed it to be serverless. All data lives in the browser's IndexedDB database via Dexie.js. This means zero cost, zero login required, and the app works offline."

**Q: How is the API key secured?**
> "By routing all Gemini API calls through a Next.js Server API Route. The key is stored as an environment variable and never ships to the browser's JavaScript bundle."

**Q: How does dark mode work?**
> "I used the `next-themes` library which toggles a `.dark` class on the root HTML element. All Tailwind CSS `dark:` prefixed utility classes activate automatically. The preference is persisted in localStorage."

**Q: What is a PWA?**
> "A Progressive Web App is a website that can be installed on your phone like a native app. I added PWA support using Serwist, which generates a Service Worker that caches assets and allows offline use."

**Q: How do the live-updating charts and history work?**
> "I used Dexie.js's `useLiveQuery` hook. It creates a reactive subscription to the IndexedDB database. Any time data changes — like adding or deleting a receipt — React automatically re-renders the affected components without any manual state management."

---

*Report generated for: Groceries Receipt Tracker App*
*Technologies: Next.js 14, React, Tailwind CSS, Gemini AI, Dexie.js (IndexedDB), Serwist (PWA), Recharts, Shadcn/UI, next-themes, browser-image-compression*
