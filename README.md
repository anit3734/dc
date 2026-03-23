<div align="center">
  <img src="https://img.icons8.com/color/96/000000/protect.png" alt="ZaubaInsights Logo" width="80"/>
  
  # ZaubaInsights
  **Industrial-Grade Corporate Intelligence Platform**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
  [![Playwright](https://img.shields.io/badge/Playwright-Stealth-2EAD33?style=for-the-badge&logo=playwright)](https://playwright.dev/)
</div>

---

## ⚡ Overview

**ZaubaInsights** is an enterprise-class SaaS protocol designed for high-precision, automated corporate data extraction and architectural analysis. Utilizing a stealth-enabled Playwright engine, it actively indexes exhaustive company demographics, financial health, and directorial matrices from public corporate registries (RoCs) across India. 

The application utilizes a multi-tenant backend built on Next.js 14, ensuring data isolation, real-time telemetry, and military-grade JWT authentication mechanisms.

---

## 🚀 Key Features

* **Neural Extraction Engine:** Fully automated background scraper designed to bypass headless detection using `puppeteer-extra-plugin-stealth`.
* **Multi-Tenant Architecture:** Strict data isolation; users only have access to the corporate entities they have personally triggered for extraction.
* **Live Telemetry & Dashboard:** Real-time visual interface with debounced filtering, pagination, and multi-select mechanics using ShadCN UI.
* **Automated Data Validation:** Deep-profile scraping with multi-strategy fallback parsing (Regex, JSON-LD, Tables) ensuring 100% data integrity for Contact Information, Addresses, and Capital structure.
* **Instant Export Protocols:** Direct browser-side conversion of massive queried datasets to clean `.csv` or `.xlsx` formats.
* **Luminous Slate Interface:** A responsive, aesthetically premium UI featuring intelligent glassmorphism and real-time light/dark mode toggling.

---

## 🛠️ The Tech Stack

* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS v4, Framer Motion (Animations), ShadCN UI, Lucide React (Icons).
* **Backend:** Next.js Serverless Functions, NextAuth.js (v4), Next.js Middleware.
* **Database:** MySQL, Prisma ORM.
* **Data Extraction:** Playwright Extra, Puppeteer Stealth.
* **Authentication:** Bcrypt (Password Hashing), JSON Web Tokens (JWT).

---

## ⚙️ Local Deployment & Configuration

### Prerequisites
* Node.js v18.0.0 or higher.
* A running MySQL instance.

### 1. Installation
Clone the repository and install the NPM dependencies:
```bash
git clone https://github.com/anit37344/dc.git
cd dc
npm install
```

### 2. Environment Variables
Create a `.env` file at the root of the project with the following configuration:
```env
# Database configuration
DATABASE_URL="mysql://username:password@localhost:3306/zaubacorp_db"

# Authentication secrets
NEXTAUTH_SECRET="your_very_secure_randomly_generated_string_here"
NEXTAUTH_URL="http://localhost:3000" # Change to your local IP for mobile testing (e.g. http://192.168.1.99:3000)
```

### 3. Database Initialization
Update your Prisma schema with your database and generate the client:
```bash
npx prisma db push
npx prisma generate
```

### 4. Headless Browser Setup
For the extraction engine to operate smoothly on your local machine, install the Playwright binaries:
```bash
npx playwright install chromium
```

### 5. Initialize the Platform
Start the local Next.js development server:
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to access the landing page and authentication portal.

---

## 📂 Project Architecture

```text
/
├── app/                  # Next.js App Router root
│   ├── api/              # Secure backend API endpoints (auth, scraper, queries)
│   ├── dashboard/        # Main analytical interface and profile tools
│   ├── login/            # Authentication UI
│   ├── register/         # User Onboarding UI
│   └── page.tsx          # Public-facing Landing Page
├── components/           # Reusable UI architecture (Sidebar, ThemeToggle, ShadCN)
├── lib/                  # Server-side libraries, auth configurations, and Prisma client
├── prisma/               # Database definitions and schema migrations
├── targeted_scraper.js   # The core Playwright extraction worker script
└── fix_db_status.js      # Utility script for database normalization
```

---

## 🛡️ Best Practices & Disclaimer

**ZaubaInsights** is built strictly for structural and architectural demonstration. When utilizing the automated extraction engine, please ensure compliance with local scraping regulations, terms of service of the target websites, and general data privacy laws. Limit scraper concurrency to avoid overwhelming target servers.

---
<div align="center">
  <sub>Developed & Maintained with precision.</sub>
</div>
