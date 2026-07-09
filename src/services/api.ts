const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  ?.trim()
  .replace(/\/$/, "");

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return configuredBase ? `${configuredBase}${normalizedPath}` : normalizedPath;
}
