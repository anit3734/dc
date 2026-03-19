# ZaubaCorp Data Scraper & Analytics Dashboard

A full-stack SaaS web application built with Next.js 14, Tailwind CSS, Prisma, MySQL, Razorpay, and Playwright.

## Features
- **Authentication**: Email/Password NextAuth implementation
- **Scraper Engine**: Playwright-powered ZaubaCorp company extractor 
- **Analytics Dashboard**: ShadCN UI data table with search, pagination, and multi-select.
- **Payment Gateway**: Seamless Razorpay checkout flow
- **Data Export**: Server-side Excel and CSV generation

## Prerequisites
- Node.js 18+
- MySQL Server (Currently pointing to specified database in `.env`)

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   The `.env` is pre-configured. Run the following to synchronize the Prisma schema:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Install Playwright Browsers**
   Required for the web scraper to run locally:
   ```bash
   npx playwright install chromium
   ```

4. **Environment Variables**
   Ensure `.env` contains:
   ```env
   DATABASE_URL="mysql://root:localdb%40321@182.18.144.42:9036/zauba_saas"
   NEXTAUTH_SECRET="zauba_super_secret_key_123"
   NEXTAUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_mock123"
   RAZORPAY_KEY_SECRET="mock_secret123"
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Directory Structure
```
/app
  /admin               # Scraper trigger interface
  /api                 # Backend API routes (Auth, Companies, Export, Scraper, Webhooks)
  /dashboard           # Main Data Table Dashboard
  /downloads           # Export History logs
  /login               # Authentication UI
  /register            # Registration UI
/components            # ShadCN UI components and layout pieces
/lib                   # Utility files (Prisma singleton, NextAuth config)
/prisma                # Database schema definitions
```
