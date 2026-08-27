import { describe, expect, it } from "vitest";

import { normalizeApiBaseUrl } from "../lib/api-base-url";

describe("normalização da URL base da API", () => {
  it("adiciona https quando o Render fornece somente o domínio", () => {
    expect(normalizeApiBaseUrl("financas-open-finance.onrender.com")).toBe(
      "https://financas-open-finance.onrender.com",
    );
  });

  it("preserva uma URL HTTPS e remove a barra final", () => {
    expect(normalizeApiBaseUrl("https://financas-open-finance.onrender.com/")).toBe(
      "https://financas-open-finance.onrender.com",
    );
  });

  it("retorna vazio quando não há configuração", () => {
    expect(normalizeApiBaseUrl("  ")).toBe("");
  });
});
