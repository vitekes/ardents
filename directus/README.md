# Directus CMS

This directory contains a minimal setup for running the [Directus](https://directus.io) headless CMS alongside the existing Next.js application.

## Setup

1. Install dependencies:

```bash
cd directus
npm install
```

2. Copy the example environment file and adjust credentials as needed:

```bash
cp .env.example .env
```

3. Start the CMS together with the Next.js app from the project root:

```bash
npm run dev
```

You can also run Directus only using `npm start` inside this folder. The CMS will create a `data.db` SQLite database on first run, using the credentials from `.env`.

