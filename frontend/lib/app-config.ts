const withoutTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const API_BASE_URL = withoutTrailingSlash(
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
);

export const LANDING_PAGE_URL = withoutTrailingSlash(
  process.env.NEXT_PUBLIC_LANDING_PAGE_URL || "https://landing-page-pms-system.vercel.app",
);
