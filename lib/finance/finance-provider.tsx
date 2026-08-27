import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Account, FinanceData, Transaction, TransactionDraft } from "./types";

const STORAGE_KEY = "@financas-open-finance/finance-data-v1";

const EMPTY_DATA: FinanceData = {
  accounts: [],
  transactions: [],
  monthlyBudgetCents: null,
};

type FinanceContextValue = {
  data: FinanceData;
  ready: boolean;
  addTransaction: (draft: TransactionDraft) => void;
  updateTransaction: (id: string, draft: TransactionDraft) => void;
  removeTransaction: (id: string) => void;
  addAccount: (input: Pick<Account, "name" | "openingBalanceCents">) => void;
  removeAccount: (id: string) => void;
  setMonthlyBudgetCents: (value: number | null) => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const asPersistedData = (candidate: unknown): FinanceData => {
  if (!candidate || typeof candidate !== "object") return EMPTY_DATA;
  const data = candidate as Partial<FinanceData>;
  return {
    accounts: Array.isArray(data.accounts) ? data.accounts : [],
    transactions: Array.isArray(data.transactions) ? data.transactions : [],
    monthlyBudgetCents: typeof data.monthlyBudgetCents === "number" ? data.monthlyBudgetCents : null,
  };
};

export function FinanceProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<FinanceData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && active) setData(asPersistedData(JSON.parse(stored)));
      } catch {
        if (active) setData(EMPTY_DATA);
      } finally {
        if (active) setReady(true);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const updateData = useCallback((recipe: (current: FinanceData) => FinanceData) => {
    setData((current) => {
      const next = recipe(current);
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addTransaction = useCallback(
    (draft: TransactionDraft) => {
      const transaction: Transaction = {
        ...draft,
        id: createId("transaction"),
        createdAt: new Date().toISOString(),
      };
      updateData((current) => ({ ...current, transactions: [transaction, ...current.transactions] }));
    },
    [updateData],
  );

  const updateTransaction = useCallback(
    (id: string, draft: TransactionDraft) => {
      updateData((current) => ({
        ...current,
        transactions: current.transactions.map((transaction) =>
          transaction.id === id ? { ...transaction, ...draft } : transaction,
        ),
      }));
    },
    [updateData],
  );

  const removeTransaction = useCallback(
    (id: string) => {
      updateData((current) => ({
        ...current,
        transactions: current.transactions.filter((transaction) => transaction.id !== id),
      }));
    },
    [updateData],
  );

  const addAccount = useCallback(
    (input: Pick<Account, "name" | "openingBalanceCents">) => {
      const account: Account = {
        ...input,
        id: createId("account"),
        source: "manual",
        createdAt: new Date().toISOString(),
      };
      updateData((current) => ({ ...current, accounts: [account, ...current.accounts] }));
    },
    [updateData],
  );

  const removeAccount = useCallback(
    (id: string) => {
      updateData((current) => ({
        ...current,
        accounts: current.accounts.filter((account) => account.id !== id),
        transactions: current.transactions.map((transaction) =>
          transaction.accountId === id ? { ...transaction, accountId: undefined } : transaction,
        ),
      }));
    },
    [updateData],
  );

  const setMonthlyBudgetCents = useCallback(
    (value: number | null) => {
      updateData((current) => ({ ...current, monthlyBudgetCents: value }));
    },
    [updateData],
  );

  const value = useMemo(
    () => ({
      data,
      ready,
      addTransaction,
      updateTransaction,
      removeTransaction,
      addAccount,
      removeAccount,
      setMonthlyBudgetCents,
    }),
    [addAccount, addTransaction, data, ready, removeAccount, removeTransaction, setMonthlyBudgetCents, updateTransaction],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance deve ser usado dentro de FinanceProvider");
  return context;
};
