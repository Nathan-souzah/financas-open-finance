const PLUGGY_API_URL = "https://api.pluggy.ai";

type PluggyAuthResponse = { apiKey?: string };

type PluggyAccount = {
  id: string;
  name?: string;
  type?: string;
  balance?: number;
  currencyCode?: string;
  institution?: { name?: string };
};

type PluggyTransaction = {
  id: string;
  accountId: string;
  amount: number;
  description?: string;
  date?: string;
  type?: string;
  category?: string;
};

const requireCredentials = () => {
  const clientId = process.env.PLUGGY_CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Credenciais Pluggy não configuradas no backend");
  return { clientId, clientSecret };
};

const parseJson = async <T>(response: Response) => {
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) throw new Error(payload.message || `Pluggy respondeu com HTTP ${response.status}`);
  return payload;
};

export async function createPluggyApiKey() {
  const credentials = requireCredentials();
  const response = await fetch(`${PLUGGY_API_URL}/auth`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const payload = await parseJson<PluggyAuthResponse>(response);
  if (!payload.apiKey) throw new Error("Pluggy não retornou uma API Key");
  return payload.apiKey;
}

export async function createPluggyConnectToken(input: { clientUserId: string; oauthRedirectUri?: string }) {
  const apiKey = await createPluggyApiKey();
  const response = await fetch(`${PLUGGY_API_URL}/connect_token`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      options: {
        clientUserId: input.clientUserId,
        ...(input.oauthRedirectUri ? { oauthRedirectUri: input.oauthRedirectUri } : {}),
        avoidDuplicates: true,
      },
    }),
  });
  return parseJson<{ accessToken?: string; connectToken?: string }>(response);
}

export async function fetchPluggyAccounts(itemId: string) {
  const apiKey = await createPluggyApiKey();
  const response = await fetch(`${PLUGGY_API_URL}/accounts?itemId=${encodeURIComponent(itemId)}`, {
    headers: { "x-api-key": apiKey },
  });
  return parseJson<{ results?: PluggyAccount[] }>(response);
}

export async function fetchPluggyTransactions(accountId: string) {
  const apiKey = await createPluggyApiKey();
  const response = await fetch(`${PLUGGY_API_URL}/transactions?accountId=${encodeURIComponent(accountId)}`, {
    headers: { "x-api-key": apiKey },
  });
  return parseJson<{ results?: PluggyTransaction[] }>(response);
}

export const normalizePluggyAccount = (account: PluggyAccount) => ({
  externalId: account.id,
  institutionName: account.institution?.name || "Instituição conectada",
  accountName: account.name || account.type || "Conta conectada",
  balanceCents: Math.round((account.balance || 0) * 100),
});

export const normalizePluggyTransaction = (transaction: PluggyTransaction) => ({
  externalId: transaction.id,
  accountExternalId: transaction.accountId,
  amountCents: Math.round(Math.abs(transaction.amount || 0) * 100),
  type: transaction.amount >= 0 ? ("income" as const) : ("expense" as const),
  description: transaction.description || transaction.category || "Movimentação importada",
  occurredOn: transaction.date || new Date().toISOString().slice(0, 10),
});
