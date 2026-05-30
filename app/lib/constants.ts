export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  JOIN: "/join",
  DASHBOARD: "/dashboard",
  ACTIVITY: "/activity",
  ORGANIZATION: "/organization",
  USERS: "/users",
  CATEGORIES: "/categories",
  COUNTERPARTIES: "/counterparties",
  BUDGETS: "/budgets",
  EXPENSES: "/expenses",
  TRANSFERS: "/transfers",
  SERVICE_UNAVAILABLE: "/service-unavailable",
} as const;

export const PUBLIC_ROUTE_PATTERNS = [
  ROUTES.HOME,
  `${ROUTES.SIGN_IN}(.*)`,
  `${ROUTES.SIGN_UP}(.*)`,
  `${ROUTES.JOIN}(.*)`,
  ROUTES.SERVICE_UNAVAILABLE,
] as const;

export const POST_AUTH_REDIRECT = ROUTES.DASHBOARD;
