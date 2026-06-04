# JR Admin

Standalone product-listing service for JR Interiors.

## What it does

- Separate registration and login flow
- Standalone dashboard for add / update / delete product listings
- Registration onboarding with direct UPI payment options
- Separate Prisma schema from storefront ecommerce app

## Run locally

```bash
cd jr-admin
npm install
copy .env.example .env
npx prisma db push
npm run dev
```

App runs on [http://localhost:3001](http://localhost:3001).

## Environment

- `DATABASE_URL`: Postgres database for this service
- `AUTH_SECRET`: cookie signing secret
- `UPI_PAYEE_VPA`: merchant UPI ID that should receive registration payments
- `UPI_PAYEE_NAME`: merchant name shown in UPI apps
- `REGISTRATION_FEE_INR`: onboarding amount in whole rupees
