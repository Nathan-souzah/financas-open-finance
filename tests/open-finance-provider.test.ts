import { describe, expect, it } from "vitest";

import { openFinanceReadiness } from "../lib/open-finance/provider";

describe("ponto de ativação de Open Finance", () => {
  it("não apresenta uma conexão bancária como ativa antes da configuração do provedor", () => {
    expect(openFinanceReadiness.status).toBe("not-configured");
    expect(openFinanceReadiness.message).toContain("provedor");
  });
});
