import { Directus } from '@directus/sdk';

const directus = new Directus(process.env.DIRECTUS_URL || 'http://localhost:8055');

async function loginIfNeeded() {
  if (!directus.auth.token) {
    await directus.auth.login({
      email: process.env.DIRECTUS_ADMIN_EMAIL || 'admin@example.com',
      password: process.env.DIRECTUS_ADMIN_PASSWORD || 'admin',
    });
  }
}

export async function createDirectusUser(id: string) {
  await loginIfNeeded();
  try {
    await directus.items('users').createOne({ id, status: 'active' });
  } catch (error: any) {
    if (error?.errors?.[0]?.extensions?.code !== 'RECORD_EXISTS') {
      console.error('Failed to create Directus user', error);
    }
  }
}

export async function updateDirectusUser(id: string, data: Record<string, any>) {
  await loginIfNeeded();
  try {
    await directus.items('users').updateOne(id, data);
  } catch (error) {
    console.error('Failed to update Directus user', error);
  }
}
