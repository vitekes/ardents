export function isAdmin(id?: string | null): boolean {
  if (!id) return false;
  const admins = (process.env.ADMIN_IDS || '').split(',').map(a => a.trim().toLowerCase()).filter(Boolean);
  return admins.includes(id.toLowerCase());
}
