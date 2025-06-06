import { Directus } from '@directus/sdk';

const directus = new Directus(
  process.env.DIRECTUS_URL || 'http://localhost:8055',
);

/**
 * Валидация авторизации. Авторизуемся по переменным окружения,
 * если токен ещё не получен.
 */
async function loginIfNeeded() {
  if (!directus.auth.token) {
    await directus.auth.login({
      email:    process.env.DIRECTUS_ADMIN_EMAIL    || 'admin@example.com',
      password: process.env.DIRECTUS_ADMIN_PASSWORD || 'admin',
    });
  }
}

/**
 * Вспомогательный тип ошибки Directus. Нужен, чтобы не использовать `any`.
 */
type DirectusError = {
  errors?: { extensions?: { code?: string } }[];
};

/**
 * Создаёт пользователя (если его ещё нет).
 */
export async function createDirectusUser(id: string): Promise<void> {
  await loginIfNeeded();

  try {
    await directus.items('users').createOne({ id, status: 'active' });
  } catch (error: unknown) {
    const err = error as DirectusError;

    // Пропускаем ошибку, если запись уже существует
    if (err?.errors?.[0]?.extensions?.code !== 'RECORD_EXISTS') {
      console.error('Failed to create Directus user', err);
    }
  }
}

/**
 * Обновляет данные пользователя.
 */
export async function updateDirectusUser(
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await loginIfNeeded();

  try {
    await directus.items('users').updateOne(id, data);
  } catch (error) {
    console.error('Failed to update Directus user', error);
  }
}