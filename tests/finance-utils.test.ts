import { describe, expect, it } from "vitest";

import { consolidatedBalance, monthTotals, parseCurrencyText } from "../lib/finance/format";
import type { FinanceData, Transaction } from "../lib/finance/types";

const transactions: Transaction[] = [
  { id: "t1", amountCents: 250000, type: "income", description: "Receita", categoryId: "salario", accountId: "a1", occurredOn: "2026-08-10", createdAt: "2026-08-10T12:00:00.000Z" },
  { id: "t2", amountCents: 3590, type: "expense", description: "Despesa", categoryId: "alimentacao", accountId: "a1", occurredOn: "2026-08-11", createdAt: "2026-08-11T12:00:00.000Z" },
  { id: "t3", amountCents: 1200, type: "expense", description: "Outra despesa", categoryId: "outros", occurredOn: "2026-07-10", createdAt: "2026-07-10T12:00:00.000Z" },
];

describe("utilitários financeiros", () => {
  it("converte moeda brasileira para centavos", () => {
    expect(parseCurrencyText("1.234,56")).toBe(123456);
    expect(parseCurrencyText("20")).toBe(2000);
    expect(parseCurrencyText("valor")).toBeNull();
  });

  it("resume receitas e despesas do mês de referência", () => {
    expect(monthTotals(transactions, new Date("2026-08-20T12:00:00"))).toEqual({ incomeCents: 250000, expenseCents: 3590 });
  });

  it("não contabiliza duas vezes lançamentos vinculados a uma conta", () => {
    const data: FinanceData = {
      accounts: [{ id: "a1", name: "Conta", openingBalanceCents: 10000, source: "manual", createdAt: "2026-08-01T00:00:00.000Z" }],
      transactions,
      monthlyBudgetCents: null,
    };
    expect(consolidatedBalance(data)).toBe(255210);
  });
});
