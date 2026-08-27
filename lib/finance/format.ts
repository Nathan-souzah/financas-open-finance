import type { Account, FinanceData, Transaction, TransactionType } from "./types";

export const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(cents / 100);

export const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
    .format(new Date(`${isoDate}T12:00:00`))
    .replace(".", "");

export const formatMonth = (date = new Date()) =>
  new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);

export const parseCurrencyText = (text: string): number | null => {
  const normalized = text.trim().replace(/R\$\s?/g, "").replace(/\./g, "").replace(",", ".");
  if (!normalized) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
};

export const formatEditableCurrency = (cents: number | null) =>
  cents === null ? "" : (cents / 100).toFixed(2).replace(".", ",");

export const isInMonth = (isoDate: string, referenceDate = new Date()) => {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.getMonth() === referenceDate.getMonth() && date.getFullYear() === referenceDate.getFullYear();
};

export const signedAmount = (transaction: Transaction) =>
  transaction.type === "income" ? transaction.amountCents : -transaction.amountCents;

export const monthTotals = (transactions: Transaction[], referenceDate = new Date()) =>
  transactions.filter((transaction) => isInMonth(transaction.occurredOn, referenceDate)).reduce(
    (totals, transaction) => {
      if (transaction.type === "income") totals.incomeCents += transaction.amountCents;
      else totals.expenseCents += transaction.amountCents;
      return totals;
    },
    { incomeCents: 0, expenseCents: 0 },
  );

export const accountBalance = (data: FinanceData, account: Account) =>
  account.openingBalanceCents +
  data.transactions
    .filter((transaction) => transaction.accountId === account.id)
    .reduce((total, transaction) => total + signedAmount(transaction), 0);

export const consolidatedBalance = (data: FinanceData) => {
  const accountTotal = data.accounts.reduce((total, account) => total + accountBalance(data, account), 0);
  const unassignedTotal = data.transactions
    .filter((transaction) => !transaction.accountId)
    .reduce((total, transaction) => total + signedAmount(transaction), 0);
  return accountTotal + unassignedTotal;
};

export const categoryExpenses = (transactions: Transaction[], referenceDate = new Date()) => {
  const values = new Map<string, number>();
  transactions
    .filter((transaction) => transaction.type === "expense" && isInMonth(transaction.occurredOn, referenceDate))
    .forEach((transaction) => {
      values.set(transaction.categoryId, (values.get(transaction.categoryId) ?? 0) + transaction.amountCents);
    });
  return values;
};

export const transactionSign = (type: TransactionType) => (type === "income" ? "+" : "−");
