const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function isValidBudgetMonth(month: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

export function getBudgetMonthBounds(month: string) {
  const [yearPart, monthPart] = month.split("-");
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;

  const startDate = new Date(Date.UTC(year, monthIndex, 1));
  const endDate = new Date(Date.UTC(year, monthIndex + 1, 0));

  return {
    month,
    periodFrom: startDate.toISOString().slice(0, 10),
    periodTo: endDate.toISOString().slice(0, 10),
    monthLabel: monthFormatter.format(startDate),
  };
}

export function getBudgetMonthFromDate(dateString: string) {
  return dateString.slice(0, 7);
}

export function formatBudgetMonth(month: string) {
  return getBudgetMonthBounds(month).monthLabel;
}
