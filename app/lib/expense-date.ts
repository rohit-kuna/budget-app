const expenseDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function toExpenseDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getTodayExpenseDateInputValue() {
  return toExpenseDateInputValue(new Date());
}

export function parseExpenseDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

export function formatExpenseDate(value: string) {
  return expenseDateFormatter.format(new Date(value));
}
