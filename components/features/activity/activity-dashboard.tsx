"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  LabelList,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ActivityDashboardDataDto } from "@/app/lib/activity.types";

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compactMoneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const monthLabelFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const chartPalette = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

type ScopeFilter = "all" | "personal" | "family";
type TransactionTypeFilter = "all" | "expense" | "income";
type NecessityScore = 1 | 2 | 3 | 4 | 5;

const necessityLabels: Record<NecessityScore, string> = {
  1: "Optional",
  2: "Nice to Have",
  3: "Moderate",
  4: "Important",
  5: "Essential",
};

const necessityOrder: NecessityScore[] = [5, 4, 3, 2, 1];

function formatMoney(amount: number) {
  return moneyFormatter.format(amount);
}

function formatCompactMoney(amount: number) {
  return compactMoneyFormatter.format(amount);
}

function getMonthKey(dateString: string) {
  return dateString.slice(0, 7);
}

function getMonthLabel(monthKey: string) {
  return monthLabelFormatter.format(new Date(`${monthKey}-01T00:00:00Z`));
}

function monthKeyToDate(monthKey: string) {
  return new Date(`${monthKey}-01T00:00:00Z`);
}

function buildMonthRange(startMonth: string, endMonth: string) {
  const startDate = monthKeyToDate(startMonth);
  const endDate = monthKeyToDate(endMonth);
  const safeStart = startDate <= endDate ? startDate : endDate;
  const safeEnd = startDate <= endDate ? endDate : startDate;
  const months: string[] = [];
  const cursor = new Date(safeStart);

  while (cursor <= safeEnd) {
    months.push(cursor.toISOString().slice(0, 7));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return months;
}

function formatDateLabel(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${dateString}T00:00:00Z`));
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getDateRange(startDate: Date, endDate: Date) {
  const days: string[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

function FilterChip({
  active,
  children,
  onClick,
  className,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-muted",
        className
      )}
    >
      {children}
    </button>
  );
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-500/20 bg-emerald-500/5"
      : tone === "warning"
        ? "border-amber-500/20 bg-amber-500/5"
        : tone === "danger"
          ? "border-destructive/20 bg-destructive/5"
          : "bg-muted/20";

  return (
    <div className={cn("rounded-xl border p-4", toneClass)}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
      <p className="max-w-4xl text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function MultiChipFilter({
  label,
  options,
  selectedValues,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (nextValues: string[]) => void;
}) {
  const isAllSelected = selectedValues.length === 0;

  function toggleValue(value: string) {
    if (value === "all") {
      onChange([]);
      return;
    }

    const nextValues = selectedValues.includes(value)
      ? selectedValues.filter((currentValue) => currentValue !== value)
      : [...selectedValues, value];

    onChange(nextValues);
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        <FilterChip active={isAllSelected} onClick={() => toggleValue("all")}>
          All
        </FilterChip>
        {options.map((option) => (
          <FilterChip
            key={option.value}
            active={selectedValues.includes(option.value)}
            onClick={() => toggleValue(option.value)}
          >
            {option.label}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}

function SingleChipFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (nextValue: string) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        <FilterChip active={value === "all"} onClick={() => onChange("all")}>
          All
        </FilterChip>
        {options.map((option) => (
          <FilterChip
            key={option.value}
            active={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}

function ExpenseActivityChart({
  expenses,
  categories,
  members,
}: Pick<ActivityDashboardDataDto, "expenses" | "categories" | "members">) {
  const allMonthKeys = useMemo(() => {
    const monthKeys = expenses.map((expense) => getMonthKey(expense.occurredAt));
    return monthKeys.length ? Array.from(new Set(monthKeys)).sort() : [];
  }, [expenses]);

  const minMonth = allMonthKeys[0] ?? getMonthKey(new Date().toISOString());
  const maxMonth = allMonthKeys[allMonthKeys.length - 1] ?? minMonth;

  const [startMonth, setStartMonth] = useState(minMonth);
  const [endMonth, setEndMonth] = useState(maxMonth);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: String(category.id), label: category.name })),
    [categories]
  );
  const memberOptions = useMemo(
    () => members.map((member) => ({ value: member.id, label: member.name })),
    [members]
  );

  const chartData = useMemo(() => {
    const selectedCategories = new Set(selectedCategoryIds);
    const selectedMembers = new Set(selectedMemberIds);
    const months = buildMonthRange(startMonth, endMonth);
    const filtered = expenses.filter((expense) => {
      const expenseMonth = getMonthKey(expense.occurredAt);
      if (expenseMonth < startMonth || expenseMonth > endMonth) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(String(expense.categoryId))) return false;
      if (selectedMembers.size > 0 && !selectedMembers.has(expense.userId)) return false;
      if (scopeFilter !== "all" && expense.scope !== scopeFilter) return false;
      return true;
    });

    return months.map((monthKey) => {
      const monthExpenses = filtered.filter((expense) => getMonthKey(expense.occurredAt) === monthKey);
      const income = monthExpenses
        .filter((expense) => expense.type === "income")
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
      const expense = monthExpenses
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + Number(item.amount), 0);

      return {
        month: monthKey,
        label: getMonthLabel(monthKey),
        income,
        expense,
        isOverspent: expense > income,
      };
    });
  }, [expenses, startMonth, endMonth, selectedCategoryIds, selectedMemberIds, scopeFilter]);

  const totals = useMemo(() => {
    const income = chartData.reduce((sum, item) => sum + item.income, 0);
    const expense = chartData.reduce((sum, item) => sum + item.expense, 0);
    const netSavings = income - expense;
    const overspentMonths = chartData.filter((item) => item.isOverspent).map((item) => item.label);

    return { income, expense, netSavings, overspentMonths };
  }, [chartData]);

  const monthBoundsMissing = !allMonthKeys.length;

  return (
    <Card className="py-2">
      <CardHeader className="space-y-4 px-8 pt-8">
        <SectionHeader
          title="Income vs Expense"
          description="Track cash flow over time, compare income and spending by month, and spot when expenses overtake income."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Label>Month range</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="month"
                value={startMonth}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setStartMonth(nextValue);
                  if (nextValue > endMonth) {
                    setEndMonth(nextValue);
                  }
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
              <input
                type="month"
                value={endMonth}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setEndMonth(nextValue);
                  if (nextValue < startMonth) {
                    setStartMonth(nextValue);
                  }
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          <SingleChipFilter
            label="Family / personal scope"
            value={scopeFilter}
            onChange={(nextValue) => setScopeFilter(nextValue as ScopeFilter)}
            options={[
              { value: "personal", label: "Personal" },
              { value: "family", label: "Family" },
            ]}
          />
        </div>

        <MultiChipFilter
          label="Categories"
          options={categoryOptions}
          selectedValues={selectedCategoryIds}
          onChange={setSelectedCategoryIds}
        />

        <MultiChipFilter
          label="Users"
          options={memberOptions}
          selectedValues={selectedMemberIds}
          onChange={setSelectedMemberIds}
        />
      </CardHeader>

      <CardContent className="space-y-6 px-8 pb-8">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Total income" value={formatMoney(totals.income)} tone="success" />
          <MetricCard label="Total expense" value={formatMoney(totals.expense)} tone="danger" />
          <MetricCard
            label="Net savings"
            value={formatMoney(totals.netSavings)}
            tone={totals.netSavings >= 0 ? "success" : "warning"}
          />
        </div>

        {monthBoundsMissing ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            No expense records yet. Add income or expenses to see the activity chart.
          </div>
        ) : (
          <div className="rounded-2xl border bg-muted/10 p-4">
            <div className="h-[360px] w-full min-w-0 min-h-0">
              <BarChart
                responsive
                data={chartData}
                margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
                style={{ width: "100%", height: "100%" }}
              >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickMargin={10} />
                  <YAxis tickFormatter={(value) => formatCompactMoney(Number(value))} width={80} />
                  <Tooltip
                    formatter={(value, name) => [formatMoney(Number(value ?? 0)), String(name)]}
                    labelFormatter={(label) => String(label)}
                    cursor={{ fill: "var(--color-muted)" }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={`income-${entry.month}`} fill="var(--color-chart-2)" />
                    ))}
                  </Bar>
                  <Bar dataKey="expense" name="Expense" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={`expense-${entry.month}`}
                        fill={entry.isOverspent ? "var(--color-destructive)" : "var(--color-chart-1)"}
                      />
                    ))}
                  </Bar>
              </BarChart>
            </div>
          </div>
        )}

        {totals.overspentMonths.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Expenses exceed income in:</span>
            {totals.overspentMonths.map((month) => (
              <Badge key={month} variant="outline" className="border-destructive/30 text-destructive">
                {month}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-400">
            Income stays ahead of expenses for the selected range.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BudgetVsActualChart({
  budgets,
  expenses,
  categories,
  members,
}: Pick<ActivityDashboardDataDto, "budgets" | "expenses" | "categories" | "members">) {
  const budgetMonths = useMemo(() => {
    const months = budgets.map((budget) => budget.month);
    return months.length ? Array.from(new Set(months)).sort() : [];
  }, [budgets]);

  const defaultMonth = budgetMonths[budgetMonths.length - 1] ?? getMonthKey(new Date().toISOString());
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedMemberId, setSelectedMemberId] = useState("all");

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: String(category.id), label: category.name })),
    [categories]
  );
  const memberOptions = useMemo(
    () => members.map((member) => ({ value: member.id, label: member.name })),
    [members]
  );

  const chartData = useMemo(() => {
    const selectedBudgets = budgets.filter((budget) => {
      if (budget.month !== selectedMonth) return false;
      if (selectedCategoryId !== "all" && String(budget.categoryId) !== selectedCategoryId) return false;
      if (selectedMemberId !== "all" && budget.userId !== selectedMemberId && budget.userId !== null) return false;
      return true;
    });

    const selectedExpenses = expenses.filter((expense) => {
      if (getMonthKey(expense.occurredAt) !== selectedMonth) return false;
      if (selectedCategoryId !== "all" && String(expense.categoryId) !== selectedCategoryId) return false;
      if (selectedMemberId !== "all" && expense.userId !== selectedMemberId) return false;
      return true;
    });

    const categoryMap = new Map<number, {
      categoryId: number;
      categoryName: string;
      budget: number;
      actual: number;
      color: string;
    }>();

    const getCategoryColor = (categoryId: number) =>
      chartPalette[(categoryId - 1) % chartPalette.length] ?? "var(--color-chart-4)";

    for (const budget of selectedBudgets) {
      const existing = categoryMap.get(budget.categoryId);
      const nextBudget = (existing?.budget ?? 0) + Number(budget.amount);
      categoryMap.set(budget.categoryId, {
        categoryId: budget.categoryId,
        categoryName: budget.categoryName,
        budget: nextBudget,
        actual: existing?.actual ?? 0,
        color: existing?.color ?? getCategoryColor(budget.categoryId),
      });
    }

    for (const expense of selectedExpenses) {
      const existing = categoryMap.get(expense.categoryId);
      const nextActual = (existing?.actual ?? 0) + Number(expense.amount);
      categoryMap.set(expense.categoryId, {
        categoryId: expense.categoryId,
        categoryName: expense.categoryName,
        budget: existing?.budget ?? 0,
        actual: nextActual,
        color: existing?.color ?? getCategoryColor(expense.categoryId),
      });
    }

    return Array.from(categoryMap.values())
      .sort((left, right) => left.categoryName.localeCompare(right.categoryName))
      .map((item) => ({
        ...item,
        remaining: Math.max(item.budget - item.actual, 0),
        overBudget: Math.max(item.actual - item.budget, 0),
        isOverBudget: item.actual > item.budget,
      }));
  }, [budgets, expenses, selectedMonth, selectedCategoryId, selectedMemberId]);

  const totals = useMemo(() => {
    const budget = chartData.reduce((sum, item) => sum + item.budget, 0);
    const actual = chartData.reduce((sum, item) => sum + item.actual, 0);
    const remaining = chartData.reduce((sum, item) => sum + item.remaining, 0);
    const overBudget = chartData.reduce((sum, item) => sum + item.overBudget, 0);

    return { budget, actual, remaining, overBudget };
  }, [chartData]);

  return (
    <Card className="py-2">
      <CardHeader className="space-y-4 px-8 pt-8">
        <SectionHeader
          title="Budget vs Actual Spending"
          description="Compare budgeted amounts with real spending by category, then identify remaining amounts and overspend quickly."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-3">
            <Label>Month</Label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <SingleChipFilter
            label="User"
            value={selectedMemberId}
            onChange={setSelectedMemberId}
            options={memberOptions}
          />
          <SingleChipFilter
            label="Category"
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
            options={categoryOptions}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-8 pb-8">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Total budget" value={formatMoney(totals.budget)} tone="success" />
          <MetricCard label="Total actual" value={formatMoney(totals.actual)} tone="warning" />
          <MetricCard label="Remaining amount" value={formatMoney(totals.remaining)} tone="default" />
          <MetricCard label="Over budget amount" value={formatMoney(totals.overBudget)} tone="danger" />
        </div>

        {!budgetMonths.length ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            No budgets are available yet. Create a budget to compare planned vs actual spending.
          </div>
        ) : chartData.length ? (
          <div className="rounded-2xl border bg-muted/10 p-4">
            <div className="h-[360px] w-full min-w-0 min-h-0">
              <BarChart
                responsive
                data={chartData}
                margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
                style={{ width: "100%", height: "100%" }}
              >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoryName" tickMargin={10} interval={0} />
                  <YAxis tickFormatter={(value) => formatCompactMoney(Number(value))} width={80} />
                  <Tooltip
                    formatter={(value, name) => [formatMoney(Number(value ?? 0)), String(name)]}
                    labelFormatter={(label) => String(label)}
                    cursor={{ fill: "var(--color-muted)" }}
                  />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={`budget-${entry.categoryId}`} fill="var(--color-chart-4)" />
                    ))}
                  </Bar>
                  <Bar dataKey="actual" name="Actual" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={`actual-${entry.categoryId}`}
                        fill={entry.isOverBudget ? "var(--color-destructive)" : entry.color}
                      />
                    ))}
                  </Bar>
              </BarChart>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            No budget or expense data matches the selected filters.
          </div>
        )}

        {chartData.some((item) => item.isOverBudget) ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Over budget categories:</span>
            {chartData
              .filter((item) => item.isOverBudget)
              .map((item) => (
                <Badge
                  key={item.categoryId}
                  variant="outline"
                  className="border-destructive/30 text-destructive"
                >
                  {item.categoryName} +{formatMoney(item.overBudget)}
                </Badge>
              ))}
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-400">
            All visible categories are within budget for the selected month.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CategorySpendChart({
  expenses,
  categories,
  members,
}: Pick<ActivityDashboardDataDto, "expenses" | "categories" | "members">) {
  const monthOptions = useMemo(() => {
    return Array.from(new Set(expenses.map((expense) => getMonthKey(expense.occurredAt)))).sort();
  }, [expenses]);

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<TransactionTypeFilter>("expense");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: String(category.id), label: category.name })),
    [categories]
  );
  const memberOptions = useMemo(
    () => members.map((member) => ({ value: member.id, label: member.name })),
    [members]
  );

  const chartData = useMemo(() => {
    const selectedCategories = new Set(selectedCategoryIds);
    const selectedMembers = new Set(selectedMemberIds);

    const filtered = expenses.filter((expense) => {
      if (selectedMonth !== "all" && getMonthKey(expense.occurredAt) !== selectedMonth) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(String(expense.categoryId))) return false;
      if (selectedMembers.size > 0 && !selectedMembers.has(expense.userId)) return false;
      if (transactionTypeFilter !== "all" && expense.type !== transactionTypeFilter) return false;
      if (scopeFilter !== "all" && expense.scope !== scopeFilter) return false;
      return true;
    });

    const totalsByCategory = new Map<number, {
      categoryId: number;
      categoryName: string;
      amount: number;
      color: string;
    }>();

    const colorByIndex = (index: number) => chartPalette[index % chartPalette.length] ?? "var(--color-chart-1)";

    for (const expense of filtered) {
      const existing = totalsByCategory.get(expense.categoryId);
      const categoryColor =
        existing?.color ??
        colorByIndex(categories.findIndex((category) => category.id === expense.categoryId));

      totalsByCategory.set(expense.categoryId, {
        categoryId: expense.categoryId,
        categoryName: expense.categoryName,
        amount: (existing?.amount ?? 0) + Number(expense.amount),
        color: categoryColor,
      });
    }

    const sorted = Array.from(totalsByCategory.values()).sort((left, right) => right.amount - left.amount);
    const totalAmount = sorted.reduce((sum, item) => sum + item.amount, 0);

    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
      percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
      isTopThree: index < 3,
    }));
  }, [expenses, categories, selectedMonth, selectedCategoryIds, selectedMemberIds, transactionTypeFilter, scopeFilter]);

  const totals = useMemo(() => {
    const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);
    return {
      totalAmount,
      topCategories: chartData.slice(0, 3),
    };
  }, [chartData]);

  const hasData = chartData.length > 0;

  return (
    <Card className="py-2">
      <CardHeader className="space-y-4 px-8 pt-8">
        <SectionHeader
          title="Spending by Category"
          description="See which categories consume the most spending, with longer names kept readable through a horizontal layout."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-3">
            <Label>Month</Label>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All months</option>
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {getMonthLabel(month)}
                </option>
              ))}
            </select>
          </div>

          <SingleChipFilter
            label="Transaction type"
            value={transactionTypeFilter}
            onChange={(nextValue) => setTransactionTypeFilter(nextValue as TransactionTypeFilter)}
            options={[
              { value: "expense", label: "Expense" },
              { value: "income", label: "Income" },
            ]}
          />

          <SingleChipFilter
            label="Scope"
            value={scopeFilter}
            onChange={(nextValue) => setScopeFilter(nextValue as ScopeFilter)}
            options={[
              { value: "personal", label: "Personal" },
              { value: "family", label: "Family" },
            ]}
          />

          <div className="space-y-3">
            <Label>Category</Label>
            <div className="max-h-28 overflow-auto rounded-md border bg-background p-2">
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={selectedCategoryIds.length === 0}
                  onClick={() => setSelectedCategoryIds([])}
                >
                  All
                </FilterChip>
                {categoryOptions.map((option) => (
                  <FilterChip
                    key={option.value}
                    active={selectedCategoryIds.includes(option.value)}
                    onClick={() =>
                      setSelectedCategoryIds((current) =>
                        current.includes(option.value)
                          ? current.filter((value) => value !== option.value)
                          : [...current, option.value]
                      )
                    }
                  >
                    {option.label}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>
        </div>

        <MultiChipFilter
          label="Users"
          options={memberOptions}
          selectedValues={selectedMemberIds}
          onChange={setSelectedMemberIds}
        />
      </CardHeader>

      <CardContent className="space-y-6 px-8 pb-8">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Total spending"
            value={formatMoney(totals.totalAmount)}
            tone={totals.totalAmount > 0 ? "warning" : "default"}
          />
          <MetricCard label="Top category" value={totals.topCategories[0]?.categoryName ?? "—"} />
          <MetricCard
            label="Top 3 share"
            value={
              totals.totalAmount > 0
                ? `${(
                    (totals.topCategories.reduce((sum, item) => sum + item.amount, 0) /
                      totals.totalAmount) *
                    100
                  ).toFixed(0)}%`
                : "—"
            }
            tone="success"
          />
        </div>

        {!hasData ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            No matching spending found for the selected filters.
          </div>
        ) : (
          <div className="rounded-2xl border bg-muted/10 p-4">
            <div className="h-[420px] w-full min-w-0 min-h-0">
              <BarChart
                responsive
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 16, right: 32, left: 8, bottom: 0 }}
                  style={{ width: "100%", height: "100%" }}
              >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => formatCompactMoney(Number(value))}
                  />
                  <YAxis
                    type="category"
                    dataKey="categoryName"
                    width={180}
                    tickMargin={12}
                  />
                  <Tooltip
                    formatter={(value, name, payload) => {
                      const row = payload?.payload as (typeof chartData)[number] | undefined;
                      const amount = Number(value ?? 0);
                      const percent = row ? row.percentage.toFixed(1) : "0.0";
                      return [`${formatMoney(amount)} (${percent}%)`, String(name)];
                    }}
                    labelFormatter={(label) => String(label)}
                    cursor={{ fill: "var(--color-muted)" }}
                  />
                  <Legend />
                  <Bar dataKey="amount" name="Total amount" radius={[0, 8, 8, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.categoryId}
                        fill={entry.isTopThree ? entry.color : "var(--color-chart-5)"}
                        fillOpacity={entry.isTopThree ? 1 : 0.45}
                      />
                    ))}
                    <LabelList
                      dataKey="amount"
                      position="right"
                      content={(props) => {
                        const labelProps = props as
                          | {
                              payload?: (typeof chartData)[number];
                              x?: number;
                              y?: number;
                              width?: number;
                              height?: number;
                              value?: number | string;
                            }
                          | undefined;
                        const row = labelProps?.payload;
                        if (
                          !labelProps ||
                          typeof labelProps.x !== "number" ||
                          typeof labelProps.y !== "number" ||
                          typeof labelProps.width !== "number" ||
                          typeof labelProps.height !== "number" ||
                          row == null
                        ) {
                          return null;
                        }

                        return (
                          <text
                            x={labelProps.x + labelProps.width + 12}
                            y={labelProps.y + labelProps.height / 2 + 4}
                            fill="currentColor"
                            className="fill-foreground text-xs font-medium"
                          >
                            {formatMoney(Number(labelProps.value ?? 0))} • {row.percentage.toFixed(0)}%
                          </text>
                        );
                      }}
                    />
                  </Bar>
              </BarChart>
            </div>
          </div>
        )}

        {chartData.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Top 3 spending categories:</span>
            {chartData.slice(0, 3).map((item, index) => (
              <Badge
                key={item.categoryId}
                variant="outline"
                className={cn(
                  index === 0 && "border-primary/40 bg-primary/5",
                  index === 1 && "border-chart-2/40 bg-chart-2/5",
                  index === 2 && "border-chart-3/40 bg-chart-3/5"
                )}
              >
                {item.categoryName} • {item.percentage.toFixed(1)}%
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function NecessitySpendChart({
  expenses,
  categories,
  members,
}: Pick<ActivityDashboardDataDto, "expenses" | "categories" | "members">) {
  const monthOptions = useMemo(
    () => Array.from(new Set(expenses.map((expense) => getMonthKey(expense.occurredAt)))).sort(),
    [expenses]
  );
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: String(category.id), label: category.name })),
    [categories]
  );
  const memberOptions = useMemo(
    () => members.map((member) => ({ value: member.id, label: member.name })),
    [members]
  );

  const chartData = useMemo(() => {
    const selectedCategories = new Set(selectedCategoryIds);
    const selectedMembers = new Set(selectedMemberIds);

    const filtered = expenses.filter((expense) => {
      if (expense.type !== "expense") return false;
      if (selectedMonth !== "all" && getMonthKey(expense.occurredAt) !== selectedMonth) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(String(expense.categoryId))) return false;
      if (selectedMembers.size > 0 && !selectedMembers.has(expense.userId)) return false;
      return true;
    });

    const groupedByMonth = new Map<
      string,
      Record<NecessityScore, number>
    >();

    for (const expense of filtered) {
      const monthKey = getMonthKey(expense.occurredAt);
      const existing = groupedByMonth.get(monthKey) ?? {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      existing[expense.necessityScore as NecessityScore] += Number(expense.amount);
      groupedByMonth.set(monthKey, existing);
    }

    const monthKeys =
      selectedMonth === "all"
        ? Array.from(groupedByMonth.keys()).sort()
        : [selectedMonth];

    return monthKeys.map((monthKey) => {
      const levels = groupedByMonth.get(monthKey) ?? {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      return {
        month: monthKey,
        label: getMonthLabel(monthKey),
        optional: levels[1],
        niceToHave: levels[2],
        moderate: levels[3],
        important: levels[4],
        essential: levels[5],
        total: necessityOrder.reduce((sum, score) => sum + levels[score], 0),
      };
    });
  }, [expenses, selectedMonth, selectedCategoryIds, selectedMemberIds]);

  const totals = useMemo(() => {
    const totalExpense = chartData.reduce((sum, item) => sum + item.total, 0);
    return {
      totalExpense,
      essential: chartData.reduce((sum, item) => sum + item.essential, 0),
      important: chartData.reduce((sum, item) => sum + item.important, 0),
      moderate: chartData.reduce((sum, item) => sum + item.moderate, 0),
      niceToHave: chartData.reduce((sum, item) => sum + item.niceToHave, 0),
      optional: chartData.reduce((sum, item) => sum + item.optional, 0),
    };
  }, [chartData]);

  const hasData = chartData.some((item) => item.total > 0);

  return (
    <Card className="py-2">
      <CardHeader className="space-y-4 px-8 pt-8">
        <SectionHeader
          title="Spending by Necessity Level"
          description="Break spending down by necessity level each month to see how essential and optional expenses stack up over time."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-3">
            <Label>Month</Label>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All months</option>
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {getMonthLabel(month)}
                </option>
              ))}
            </select>
          </div>

          <MultiChipFilter
            label="Users"
            options={memberOptions}
            selectedValues={selectedMemberIds}
            onChange={setSelectedMemberIds}
          />

          <MultiChipFilter
            label="Categories"
            options={categoryOptions}
            selectedValues={selectedCategoryIds}
            onChange={setSelectedCategoryIds}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-8 pb-8">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <MetricCard label="Total expense" value={formatMoney(totals.totalExpense)} tone="danger" />
          <MetricCard label="Essential" value={formatMoney(totals.essential)} tone="success" />
          <MetricCard label="Important" value={formatMoney(totals.important)} tone="warning" />
          <MetricCard label="Moderate" value={formatMoney(totals.moderate)} tone="default" />
          <MetricCard label="Nice to have" value={formatMoney(totals.niceToHave)} tone="default" />
          <MetricCard label="Optional" value={formatMoney(totals.optional)} tone="default" />
        </div>

        {!hasData ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            No spending found for the selected necessity filters.
          </div>
        ) : (
          <div className="rounded-2xl border bg-muted/10 p-4">
            <div className="h-[380px] w-full min-w-0 min-h-0">
              <BarChart
                responsive
                data={chartData}
                margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
                style={{ width: "100%", height: "100%" }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickMargin={10} />
                <YAxis tickFormatter={(value) => formatCompactMoney(Number(value))} width={80} />
                <Tooltip
                  formatter={(value, name) => [formatMoney(Number(value ?? 0)), String(name)]}
                  labelFormatter={(label) => String(label)}
                  cursor={{ fill: "var(--color-muted)" }}
                />
                <Legend />
                {[
                  { key: "essential", label: necessityLabels[5], color: "var(--color-chart-1)" },
                  { key: "important", label: necessityLabels[4], color: "var(--color-chart-2)" },
                  { key: "moderate", label: necessityLabels[3], color: "var(--color-chart-3)" },
                  { key: "niceToHave", label: necessityLabels[2], color: "var(--color-chart-4)" },
                  { key: "optional", label: necessityLabels[1], color: "var(--color-chart-5)" },
                ].map((series) => (
                  <Bar key={series.key} dataKey={series.key} name={series.label} stackId="necessity" radius={[0, 0, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={`${series.key}-${entry.month}`}
                        fill={series.color}
                        fillOpacity={series.key === "essential" ? 1 : 0.9}
                      />
                    ))}
                  </Bar>
                ))}
              </BarChart>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Levels:</span>
          {necessityOrder.map((score) => (
            <Badge
              key={score}
              variant="outline"
              className={cn(
                score === 5 && "border-chart-1/40 bg-chart-1/5",
                score === 4 && "border-chart-2/40 bg-chart-2/5",
                score === 3 && "border-chart-3/40 bg-chart-3/5",
                score === 2 && "border-chart-4/40 bg-chart-4/5",
                score === 1 && "border-chart-5/40 bg-chart-5/5"
              )}
            >
              {necessityLabels[score]}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ExpenseTrendChart({
  expenses,
  categories,
  members,
}: Pick<ActivityDashboardDataDto, "expenses" | "categories" | "members">) {
  const allMonthKeys = useMemo(
    () => Array.from(new Set(expenses.map((expense) => getMonthKey(expense.occurredAt)))).sort(),
    [expenses]
  );

  const minMonth = allMonthKeys[0] ?? getMonthKey(new Date().toISOString());
  const maxMonth = allMonthKeys[allMonthKeys.length - 1] ?? minMonth;

  const [startMonth, setStartMonth] = useState(minMonth);
  const [endMonth, setEndMonth] = useState(maxMonth);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: String(category.id), label: category.name })),
    [categories]
  );
  const memberOptions = useMemo(
    () => members.map((member) => ({ value: member.id, label: member.name })),
    [members]
  );

  const chartData = useMemo(() => {
    const selectedCategories = new Set(selectedCategoryIds);
    const selectedMembers = new Set(selectedMemberIds);
    const currentStart = monthKeyToDate(startMonth);
    const currentEnd = new Date(monthKeyToDate(endMonth));
    currentEnd.setUTCDate(1);
    currentEnd.setUTCMonth(currentEnd.getUTCMonth() + 1);
    currentEnd.setUTCDate(0);

    const dayCount = Math.max(
      1,
      Math.round((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );

    const previousEnd = addUtcDays(currentStart, -1);
    const previousStart = addUtcDays(currentStart, -dayCount);

    const filtered = expenses.filter((expense) => {
      if (selectedCategories.size > 0 && !selectedCategories.has(String(expense.categoryId))) return false;
      if (selectedMembers.size > 0 && !selectedMembers.has(expense.userId)) return false;
      return true;
    });

    const currentLookup = new Map<string, number>();
    const previousLookup = new Map<string, number>();

    for (const expense of filtered) {
      const expenseDate = new Date(expense.occurredAt);
      const amount = Number(expense.amount);

      if (expenseDate >= currentStart && expenseDate <= currentEnd) {
        const key = expense.occurredAt.slice(0, 10);
        currentLookup.set(key, (currentLookup.get(key) ?? 0) + amount);
      }

      if (expenseDate >= previousStart && expenseDate <= previousEnd) {
        const key = expense.occurredAt.slice(0, 10);
        previousLookup.set(key, (previousLookup.get(key) ?? 0) + amount);
      }
    }

    const currentDays = getDateRange(currentStart, currentEnd);

    return currentDays.map((dateString, index) => {
      const currentAmount = currentLookup.get(dateString) ?? 0;
      const previousDate = addUtcDays(previousStart, index);
      const previousDateKey = previousDate.toISOString().slice(0, 10);
      const previousAmount = previousLookup.get(previousDateKey) ?? 0;

      return {
        date: dateString,
        label: formatDateLabel(dateString),
        current: currentAmount,
        previous: previousAmount,
      };
    });
  }, [expenses, startMonth, endMonth, selectedCategoryIds, selectedMemberIds]);

  const totals = useMemo(() => {
    const currentTotal = chartData.reduce((sum, item) => sum + item.current, 0);
    const previousTotal = chartData.reduce((sum, item) => sum + item.previous, 0);
    const delta = currentTotal - previousTotal;
    const percentageChange = previousTotal > 0 ? (delta / previousTotal) * 100 : null;

    return { currentTotal, previousTotal, delta, percentageChange };
  }, [chartData]);

  const trendLabel =
    totals.delta > 0 ? "up" : totals.delta < 0 ? "down" : "flat";

  return (
    <Card className="py-2">
      <CardHeader className="space-y-4 px-8 pt-8">
        <SectionHeader
          title="Expense Trends Over Time"
          description="Compare the current period against the previous period to understand whether spend is accelerating or slowing down."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Label>Month range</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="month"
                value={startMonth}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setStartMonth(nextValue);
                  if (nextValue > endMonth) {
                    setEndMonth(nextValue);
                  }
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
              <input
                type="month"
                value={endMonth}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setEndMonth(nextValue);
                  if (nextValue < startMonth) {
                    setStartMonth(nextValue);
                  }
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          <MultiChipFilter
            label="Users"
            options={memberOptions}
            selectedValues={selectedMemberIds}
            onChange={setSelectedMemberIds}
          />
        </div>

        <MultiChipFilter
          label="Categories"
          options={categoryOptions}
          selectedValues={selectedCategoryIds}
          onChange={setSelectedCategoryIds}
        />
      </CardHeader>

      <CardContent className="space-y-6 px-8 pb-8">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Current period" value={formatMoney(totals.currentTotal)} tone="warning" />
          <MetricCard label="Previous period" value={formatMoney(totals.previousTotal)} tone="default" />
          <MetricCard
            label="Trend change"
            value={`${totals.delta >= 0 ? "+" : ""}${formatMoney(totals.delta)}`}
            tone={trendLabel === "up" ? "danger" : trendLabel === "down" ? "success" : "default"}
          />
          <MetricCard
            label="Percent change"
            value={totals.percentageChange === null ? "—" : `${totals.percentageChange >= 0 ? "+" : ""}${totals.percentageChange.toFixed(1)}%`}
            tone={trendLabel === "up" ? "danger" : trendLabel === "down" ? "success" : "default"}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Trend:</span>
          <Badge
            variant="outline"
            className={cn(
              trendLabel === "up" && "border-destructive/30 text-destructive",
              trendLabel === "down" && "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            )}
          >
            {trendLabel === "up" ? "Spending increased" : trendLabel === "down" ? "Spending decreased" : "No change"}
          </Badge>
          {totals.percentageChange !== null ? (
            <Badge variant="secondary">
              {totals.percentageChange >= 0 ? "↑" : "↓"} {Math.abs(totals.percentageChange).toFixed(1)}%
            </Badge>
          ) : null}
        </div>

        <div className="rounded-2xl border bg-muted/10 p-4">
          <div className="h-[380px] w-full min-w-0 min-h-0">
            <LineChart
              responsive
              data={chartData}
              margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
              style={{ width: "100%", height: "100%" }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tickMargin={10} minTickGap={24} />
              <YAxis tickFormatter={(value) => formatCompactMoney(Number(value))} width={80} />
              <Tooltip
                formatter={(value, name) => [formatMoney(Number(value ?? 0)), String(name)]}
                labelFormatter={(label) => String(label)}
                cursor={{ stroke: "var(--color-muted)" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="current"
                name="Current period"
                stroke="var(--color-chart-2)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="previous"
                name="Previous period"
                stroke="var(--color-chart-4)"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityDashboard({
  data,
}: {
  data: ActivityDashboardDataDto;
}) {
  const pageMonthRange = useMemo(() => {
    const monthKeys = Array.from(
      new Set(data.expenses.map((expense) => getMonthKey(expense.occurredAt)))
    ).sort();
    return monthKeys.length
      ? `${monthKeys[0]} → ${monthKeys[monthKeys.length - 1]}`
      : "No expense history yet";
  }, [data.expenses]);

  return (
    <section className="space-y-6">
      <Card className="py-2">
        <CardHeader className="space-y-3 px-8 pt-8">
          <Badge variant="secondary" className="w-fit">
            Activity
          </Badge>
          <CardTitle className="text-3xl tracking-tight">Organization activity</CardTitle>
          <p className="max-w-4xl text-sm text-muted-foreground">
            Visualize spending, income, and budget health across the whole organization.
            {data.organization ? ` Current workspace: ${data.organization.name}.` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Members {data.members.length}</Badge>
            <Badge variant="outline">Categories {data.categories.length}</Badge>
            <Badge variant="outline">Budget months {new Set(data.budgets.map((budget) => budget.month)).size}</Badge>
            <Badge variant="outline">Expense span {pageMonthRange}</Badge>
          </div>
        </CardHeader>
      </Card>

      <ExpenseActivityChart
        expenses={data.expenses}
        categories={data.categories}
        members={data.members}
      />

      <BudgetVsActualChart
        budgets={data.budgets}
        expenses={data.expenses}
        categories={data.categories}
        members={data.members}
      />

      <CategorySpendChart
        expenses={data.expenses}
        categories={data.categories}
        members={data.members}
      />

      <NecessitySpendChart
        expenses={data.expenses}
        categories={data.categories}
        members={data.members}
      />

      <ExpenseTrendChart
        expenses={data.expenses}
        categories={data.categories}
        members={data.members}
      />
    </section>
  );
}
