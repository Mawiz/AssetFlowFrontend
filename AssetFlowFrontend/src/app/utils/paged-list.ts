/** Normalizes API filter results (X.PagedList or plain arrays). */
export function readPagedList<T>(page: unknown): { rows: T[]; total: number } {
  if (page == null) {
    return { rows: [], total: 0 };
  }
  if (Array.isArray(page)) {
    const arr = page as T[] & { totalItemCount?: number; totalCount?: number };
    const total = arr.totalItemCount ?? arr.totalCount ?? arr.length;
    return { rows: [...arr], total };
  }
  if (typeof page === 'object') {
    const p = page as Record<string, unknown>;
    const raw = p['items'] ?? p['data'] ?? p['results'] ?? p['rows'];
    const rows = Array.isArray(raw) ? (raw as T[]) : [];
    const total = Number(p['totalItemCount'] ?? p['totalCount'] ?? p['recordCount'] ?? rows.length);
    return { rows, total };
  }
  return { rows: [], total: 0 };
}
