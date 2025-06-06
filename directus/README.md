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

3. Start the CMS:

```bash
npm start
```

The CMS will create a `data.db` SQLite database inside this folder on first run. The default admin credentials are taken from the `.env` file.
