This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server (this will start both Next.js and Directus):

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Create a `.env` file based on `.env.example` before starting the server. Directus also requires its own environment file:

```bash
cp .env.example .env
cp directus/.env.example directus/.env
```

Set `NEXTAUTH_SECRET` to any random string. If you access the app through a
non-localhost address, set `NEXTAUTH_URL` to that full URL. Otherwise the
current request's host will be used for authentication.

When you start the development server the first time, the Prisma schema will be
applied automatically via `prisma migrate deploy`. This creates the `dev.db`
SQLite database if it does not already exist. If you pull new changes that add
more migrations, run `prisma migrate deploy` again before launching the app so
the database stays up to date.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


## CMS (Directus)
A minimal [Directus](https://directus.io) setup is included in the `directus` directory.
The CMS starts automatically when running `npm run dev` from the project root.
You can still launch it separately with:

```bash
npm run cms
```

This uses a local SQLite database for storage.
## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
