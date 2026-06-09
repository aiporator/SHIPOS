// Parse FastAPI/Pydantic error responses into a single user-friendly string.
// Pydantic v2 returns `detail: [{loc, msg, type, ...}]` for 422 validation errors.
// Plain HTTPException returns `detail: "string"`.
export const parseAuthError = (err, fallback = 'An error occurred') => {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    // Pydantic validation errors → join user-readable messages
    return detail
      .map(e => {
        const field = Array.isArray(e?.loc) ? e.loc[e.loc.length - 1] : '';
        const msg = (e?.msg || '').replace(/^Value error,\s*/i, '');
        return field ? `${field}: ${msg}` : msg;
      })
      .filter(Boolean)
      .join(' · ');
  }
  return fallback;
};
