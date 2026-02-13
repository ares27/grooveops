# GrooveOps: DJ Lineup & Admin Manager

**GrooveOps** is a mobile-first Progressive Web App (PWA) designed for event coordinators to eliminate "admin fatigue" in the nightlife industry. It transforms a chaotic manual process into a streamlined workflow—from managing a DJ vault to generating social media posters and payout breakdowns.

## 🚀 Key Features

- **Smart DJ Vault:** A centralized "management layer" for storing artist contact info, genres, and payment details.
- **Dynamic Lineup Builder:** Drag-and-drop style scheduling with real-time fee summation to prevent budget overruns.
- **The "Suggestor":** A smart recommendation engine that suggests DJs based on the genre and energy of your current lineup.
- **One-Click Poster Gen:** Uses the HTML5 Canvas API to generate high-quality Instagram Story-ready posters instantly.
- **Admin Automation:** Generates a complete text breakdown of set times, fees, and bank details to simplify payments.
- **Offline Ready:** Built as a PWA with service workers to ensure functionality in basement clubs with poor signal.

## 🛠️ Tech Stack

- **Frontend:** React (Vite) + TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** LocalStorage (POC phase)
- **PWA Logic:** `vite-plugin-pwa`
- **Routing:** `react-router-dom`

## 🏗️ Technical Implementation (POC)

This project serves as a transition from simple CRUD applications to complex, system-oriented management layers.

- **Data Architecture:** Implements a relational structure between the "DJ Vault" and "Active Lineups".
- **Automation Logic:** Bridges the gap between UI state and automated communication (email/payout breakdowns).
- **Intelligence Layer:** Uses a genre-affinity algorithm to suggest roster placements.

## 📦 Deployment on Render

1.  **Build Command:** `npm run build`
2.  **Publish Directory:** `dist`
3.  **Environment:** Static Site
4.  **Rewrite Rule:** _ Source: `/_`
    - Destination: `/index.html`
    - Action: `Rewrite` (This ensures client-side routing works on refresh).

## 🔮 Future Roadmap

- **Cloud Sync:** Transition from LocalStorage to Supabase/PostgreSQL for multi-user coordination.
- **Payment Intermediary:** Integration with Stripe or PayPal APIs for direct payout processing.
