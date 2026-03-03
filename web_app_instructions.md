# Agent Operating Guide

This system converts human intent into a shippable, fully functional web app.

AI can guess. This system is designed to behave.

---

# How This Project Works

There are two important files:

- `web_app_instructions.md` → Defines how the agent must behave at all times.
- `project_specs.md` → Defines exactly what we are building.

The agent must read BOTH files completely before doing anything else.

---

# Rule #1: Always Read First

Before writing a single line of code, read both `web_app_instructions.md` and `project_specs.md` in full.
Do not proceed until both are fully read and understood.

---

# Rule #2: Reply Structure

Every single reply must follow this exact format:

- **Plan** (3–7 bullet points of what you are about to do)
- **What I need from you** (list any manual steps the user must perform — API keys, installs, approvals — be specific with exact instructions)
- **What I just did** (plain English explanation of every file created or modified)
- **Next action** (one clear sentence: what happens next)
- **Errors** (if any — plain English, no jargon, with exact fix instructions for the user)

Never skip any section. If a section is empty, write "None."

---

# Rule #3: Step 1 — Define the Project First

Before writing any code:

1. Read `project_specs.md`
2. Create a `project_plan.md` file listing:
   - All pages/screens to be built
   - All components needed
   - All API integrations required
   - All free tools and why each was chosen
   - Build order (what gets built first, second, third)
3. Show the plan to the user
4. Wait for approval before writing any code

No code is written before the plan is approved.

---

# Rule #4: Test Before and After Everything

- Before building each feature, write what the expected behavior is
- After building each feature, test it works correctly
- If a test fails: fix the issue, explain what broke and why, then test again
- Never mark a feature as complete until it is tested and working
- Errors are signals. Each failure must make the system stronger, not more fragile.

---

# Rule #5: Stop and Ask If

- A required API key or credential is missing
- A free tool has a rate limit that could affect functionality
- A new dependency materially changes the scope or cost
- You cannot meet a requirement with the free tools available
- Deployment fails for any reason

When stopping to ask, clearly tell the user:
1. What is blocking you
2. What the user needs to do (exact steps)
3. What you will do once they confirm

---

# Rule #6: One Change at a Time

- Change one thing, then test it
- Reuse existing patterns before creating new ones
- Never add complexity unless it is required
- Never use a paid service when a free one exists
- Never hardcode secrets — always use `.env.local`

---

# Rule #7: Explain Everything to the User

The user must always understand what was built and why. After completing each major feature:

- Explain what it does in plain English
- Explain where the data goes (localStorage, API, etc.)
- Explain what the user will see in the browser
- Explain any limitations of the free tools used

---

# Tech Stack (Mandatory — Do Not Change)

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **OCR**: Tesseract.js (runs entirely in the browser — completely free, no API key needed)
- **AI Parsing**: Google Gemini 2.0 Flash API (free tier via Google AI Studio — user must provide key)
- **Storage**: Browser localStorage + IndexedDB via `idb` library (completely free, no backend needed)
- **Charts**: Recharts (free, built into shadcn)
- **Deployment**: Vercel (free hobby tier)
- **Secrets**: `.env.local` only — never hardcoded

---

# File Structure (Mandatory)

```
grocery-tracker/
├── app/
│   ├── page.tsx                  # Dashboard / home page
│   ├── scan/page.tsx             # Receipt scanning page
│   ├── history/page.tsx          # All receipts history
│   ├── insights/page.tsx         # Spending insights & charts
│   └── api/
│       └── parse-receipt/route.ts  # Gemini API call (server-side)
├── components/
│   ├── ReceiptScanner.tsx        # Camera + file upload + OCR
│   ├── ReceiptCard.tsx           # Single receipt display
│   ├── SpendingChart.tsx         # Monthly bar chart
│   ├── StoreBreakdown.tsx        # Store-wise pie chart
│   └── BudgetSummary.tsx         # Monthly summary card
├── lib/
│   ├── db.ts                     # IndexedDB storage logic
│   ├── ocr.ts                    # Tesseract.js OCR logic
│   ├── gemini.ts                 # Gemini parsing logic
│   └── types.ts                  # TypeScript types
├── .env.local                    # GEMINI_API_KEY only
└── project_specs.md
```

---

# Definition of Done

The app is complete when:

1. User can upload or photograph a grocery receipt
2. OCR extracts text from the receipt automatically
3. Gemini parses the text into store name, date, items, and total
4. Data is saved to the browser and persists after page refresh
5. Dashboard shows total spending for current month
6. Monthly chart shows spending trend across all months
7. Store breakdown shows spending per grocery store
8. All receipts can be viewed, edited, and deleted
9. App is deployed and accessible on Vercel
10. No payment or credit card was required at any step

---

# What We Are NOT Building

- User authentication or login
- Payment processing
- A mobile native app (web app only — works on mobile browser)
- A backend database (all data stored in browser)
- Any paid API or service

---

# When Something Breaks

1. Identify the exact error message
2. Fix the root cause (not just the symptom)
3. Explain what broke and why in plain English
4. Test the fix
5. Continue only if the fix is confirmed working
