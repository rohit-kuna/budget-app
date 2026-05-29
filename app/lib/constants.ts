export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  JOIN: "/join",
  DASHBOARD: "/dashboard",
  ORGANIZATION: "/organization",
  USERS: "/users",
  CATEGORIES: "/categories",
  BUDGETS: "/budgets",
  EXPENSES: "/expenses",
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_SETTINGS: "/admin/settings",
  DASHBOARD_ACTIVITY: "/dashboard/activity",
  DASHBOARD_EXPENSES: "/dashboard/expenses",
  DASHBOARD_BUDGETS: "/dashboard/budgets",
  DASHBOARD_ORGANIZATION: "/dashboard/organization",
  SERVICE_UNAVAILABLE: "/service-unavailable",
} as const;

export const PUBLIC_ROUTE_PATTERNS = [
  ROUTES.HOME,
  `${ROUTES.SIGN_IN}(.*)`,
  `${ROUTES.SIGN_UP}(.*)`,
  `${ROUTES.JOIN}(.*)`,
  ROUTES.SERVICE_UNAVAILABLE,
] as const;

export const POST_AUTH_REDIRECT = ROUTES.HOME;
