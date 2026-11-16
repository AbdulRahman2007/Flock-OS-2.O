// Converts between the frontend's camelCase objects and Postgres snake_case rows.
// One generic pair of functions covers all 9 tables.

const toSnakeKey = (k: string) => k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
const toCamelKey = (k: string) => k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

/** camelCase object -> snake_case row. Drops undefined values and any keys in `omit`. */
export function toDb(obj: Record<string, any>, omit: string[] = []): Record<string, any> {
  const row: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || omit.includes(key)) continue;
    row[toSnakeKey(key)] = value;
  }
  return row;
}

/** snake_case row -> camelCase object. null becomes undefined (the UI types use optional fields). */
export function fromDb<T>(row: Record<string, any>): T {
  const obj: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === 'owner_id' || key === 'created_at') continue;
    obj[toCamelKey(key)] = value === null ? undefined : value;
  }
  return obj as T;
}
