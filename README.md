# EstechScoutier 📨
> Mobile-First, Responsive Bulk Email Outreach Helper with 1-Tap Client Dispatch.

EstechScoutier is a client-side productivity tool designed for outbound sales professionals, founders, recruiters, and marketers. It transforms recipient lists into numbered, personalized, ready-to-send emails that launch directly into your authenticated email client (Gmail app, Gmail web, Outlook web, or default system mail app).

---

## ⚡ Architectural Highlights

- **100% Client-Side Sending (Zero Server Dispatch):** Never routes emails through third-party mass SMTP servers or unverified shared IP pools. You send directly from your personal, DKIM/SPF-authenticated email client with 0% spam folder penalties.
- **Dedicated Web Worker:** Heavy list deduplication, regex validation, and `{name}` personalization for up to 10,000 emails happen in a background Web Worker, keeping the main UI silky-smooth at 60 FPS.
- **Virtualized Rendering:** Smooth scrolling across thousands of recipients with dynamic memory management.
- **Progressive Web App (PWA):** Offline-ready with Service Worker caching and home screen installability on Android, iOS, Windows, and macOS.
- **Privacy & Responsible Use First:** Persistent local storage (IndexedDB + localStorage), Do-Not-Contact list suppression, opt-out footers, and complete data export/backup in a single JSON file.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested on Node.js 22+)
- npm or pnpm

### Installation & Local Development

```bash
# 1. Clone or navigate to the directory
cd estech-scoutier

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
# Type check and bundle for production
npm run build

# Preview the production build locally
npm run preview
```

---

## 🌐 Deployment Instructions

EstechScoutier contains no backend code or environment secrets, making it deployable on any static hosting platform.

### Deploying to Vercel
1. Install the Vercel CLI: `npm i -g vercel` (or link via GitHub on [vercel.com](https://vercel.com)).
2. Run `vercel` in the project root.
3. Accept default Vite project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Deploying to Netlify
1. Connect repository on [netlify.com](https://netlify.com).
2. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Click **Deploy Site**.

### Deploying to GitHub Pages
1. In `vite.config.ts`, set the base path to your repository name:
   ```ts
   export default defineConfig({
     base: '/<repo-name>/',
     // ...
   });
   ```
2. Build the project: `npm run build`
3. Push the `dist` directory to your `gh-pages` branch.

---

## 🧪 Testing with Sample Data

EstechScoutier includes two sample test files in `public/`:
1. **`sample-leads.csv`**: Contains named contacts across several organizations with `First Name` columns for demonstrating instant real-name extraction.
2. **`sample-emails.txt`**: Plain text email list containing duplicates, messy formatting, and invalid lines for testing automatic deduplication and validation.

---

## 📱 Navigation & Features Overview

| Tab | Description |
|---|---|
| **Home** | The core tool: Search & Filter, Bulk Mail Form, CSV/TXT Uploader, Template Library, Schedule Picker, Campaign Stats, Numbered Virtualized List, and Delivery Analytics. |
| **About** | Step-by-step operating guide, architectural rationale, and interactive FAQ. |
| **Blog** | Local deliverability guides, outreach copywriting secrets, and CAN-SPAM compliance tips. |
| **Shop** | Pro outreach packs, template vaults, and corporate consulting plans. |
| **Videos** | Curated video masterclasses and mobile workflow walkthroughs. |

---

## 🔒 Responsible Use & Legal Compliance

EstechScoutier is built for ethical, targeted professional outreach.
- Always message contacts where legitimate business relevance or prior opt-in exists.
- Clearly identify your name, business entity, and address.
- EstechScoutier appends an opt-out footer (`Reply STOP if you'd rather not hear from me`) by default.
- Addresses added to the local **Do Not Contact** suppression list are permanently excluded from generation.

---

© 2026 EstechScoutier. Developed with pride by Estech Scoutier Engineering.

