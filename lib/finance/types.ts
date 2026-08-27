export type TransactionType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: TransactionType | "both";
  color: string;
};

export type Account = {
  id: string;
  name: string;
  openingBalanceCents: number;
  source: "manual" | "open_finance";
  createdAt: string;
};

export type Transaction = {
  id: string;
  amountCents: number;
  type: TransactionType;
  description: string;
  categoryId: string;
  accountId?: string;
  occurredOn: string;
  createdAt: string;
};

export type FinanceData = {
  accounts: Account[];
  transactions: Transaction[];
  monthlyBudgetCents: number | null;
};

export type TransactionDraft = Omit<Transaction, "id" | "createdAt">;

export type OpenFinanceConnection = {
  id: string;
  providerId: string;
  institutionName: string;
  status: "pending" | "connected" | "expired" | "revoked" | "error";
  connectedAt?: string;
  expiresAt?: string;
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "salario", name: "Salário", type: "income", color: "#16875D" },
  { id: "renda-extra", name: "Renda extra", type: "income", color: "#2D9D78" },
  { id: "reembolso", name: "Reembolso", type: "income", color: "#4AAD8A" },
  { id: "moradia", name: "Moradia", type: "expense", color: "#8477C8" },
  { id: "alimentacao", name: "Alimentação", type: "expense", color: "#E08A49" },
  { id: "transporte", name: "Transporte", type: "expense", color: "#5087B8" },
  { id: "saude", name: "Saúde", type: "expense", color: "#C75146" },
  { id: "lazer", name: "Lazer", type: "expense", color: "#D46E9F" },
  { id: "educacao", name: "Educação", type: "expense", color: "#609B78" },
  { id: "compras", name: "Compras", type: "expense", color: "#B77855" },
  { id: "assinaturas", name: "Assinaturas", type: "expense", color: "#6985A8" },
  { id: "outros", name: "Outros", type: "both", color: "#7C8884" },
];

export const categoryFor = (categoryId: string) =>
  DEFAULT_CATEGORIES.find((category) => category.id === categoryId) ??
  DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];

export const categoriesFor = (type: TransactionType) =>
  DEFAULT_CATEGORIES.filter((category) => category.type === type || category.type === "both");
