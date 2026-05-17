const PUBLIC_PATHS = new Set(["/", "/login", "/signup"]);
const PROTECTED_PREFIXES = ["/dashboard", "/contracts", "/compare", "/settings"];

export function isProtectedPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) {
    return false;
  }
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function getLoginRedirect(pathname: string) {
  return `/login?redirect=${encodeURIComponent(pathname)}`;
}
