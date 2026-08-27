export type OpenFinanceConnectionStatus = "not-configured" | "ready" | "connected" | "error";

export type NormalizedOpenFinanceAccount = {
  externalId: string;
  institutionName: string;
  accountName: string;
  balanceCents: number;
};

export type NormalizedOpenFinanceTransaction = {
  externalId: string;
  accountExternalId: string;
  amountCents: number;
  type: "income" | "expense";
  description: string;
  occurredOn: string;
};

export type OpenFinanceProviderAdapter = {
  id: string;
  name: string;
  status: OpenFinanceConnectionStatus;
  startConsent: () => Promise<{ authorizationUrl: string }>;
  normalizeAccounts: (input: unknown) => NormalizedOpenFinanceAccount[];
  normalizeTransactions: (input: unknown) => NormalizedOpenFinanceTransaction[];
};

/**
 * A implementação real deve viver no servidor. Este marcador impede que a interface
 * mobile trate dados bancários como se uma conexão já estivesse disponível.
 */
export const openFinanceReadiness = {
  status: "not-configured" as const,
  message: "A conexão será ativada depois da escolha de um provedor e da configuração segura do servidor.",
};
