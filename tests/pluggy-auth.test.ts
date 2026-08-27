import { describe, expect, it } from "vitest";

describe("autenticação do Pluggy", () => {
  it("aceita as credenciais de homologação configuradas no ambiente", async () => {
    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    expect(clientId).toBeTruthy();
    expect(clientSecret).toBeTruthy();

    const response = await fetch("https://api.pluggy.ai/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    expect(response.ok).toBe(true);
    const payload = (await response.json()) as { apiKey?: string };
    expect(typeof payload.apiKey).toBe("string");
    expect(payload.apiKey).toBeTruthy();
  }, 15000);
});
