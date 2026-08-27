import { describe, expect, it } from "vitest";

import { normalizePluggyAccount, normalizePluggyTransaction } from "../server/pluggy";

describe("normalização Pluggy", () => {
  it("converte conta para o modelo financeiro local", () => {
    expect(normalizePluggyAccount({
      id: "account-1",
      name: "Conta corrente",
      balance: 1234.56,
      institution: { name: "Banco de teste" },
    })).toEqual({
      externalId: "account-1",
      institutionName: "Banco de teste",
      accountName: "Conta corrente",
      balanceCents: 123456,
    });
  });

  it("preserva o sentido da transação e converte o valor para centavos", () => {
    expect(normalizePluggyTransaction({
      id: "transaction-1",
      accountId: "account-1",
      amount: -42.9,
      description: "Mercado",
      date: "2026-08-27",
    })).toEqual({
      externalId: "transaction-1",
      accountExternalId: "account-1",
      amountCents: 4290,
      type: "expense",
      description: "Mercado",
      occurredOn: "2026-08-27",
    });
  });
});
