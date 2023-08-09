# Simple Rest API with Prisma

A simple NodeJs (Typescript) Rest API with Prisma ORM with json response. It features login, logout, account creation, session authentication, update, post cretation, user and contents management (admin), etc. <br><br>

## Quick Setup

### 1. Copy env variables

```bash
cp .env.example .env
```

### 2. Install Packages

```bash
npm install
```

### 3. Migrate DB

```bash
npx prisma migrate
```

### 4. Seed db

```bash
npx ts-node src/seed.ts
```

### 5. Start app (dev mode)

```bash
npm run dev
```
<br>

## Note

Error response code is returned in the header
