import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { PluggyConnect } from "react-native-pluggy-connect";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-provider";
import { trpc } from "@/lib/trpc";
import type { ThemeColorPalette } from "@/constants/theme";

export default function OpenFinanceScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { data, syncOpenFinanceData } = useFinance();
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "creating" | "connecting" | "syncing" | "connected" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("Pronto para iniciar uma conexão segura.");
  const clientUserId = useMemo(() => `device-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, []);

  const tokenMutation = trpc.pluggy.createConnectToken.useMutation({
    onSuccess: (payload) => {
      const token = payload.accessToken ?? payload.connectToken;
      if (!token) {
        setStatus("error");
        setStatusMessage("O servidor não retornou um Connect Token válido.");
        return;
      }
      setConnectToken(token);
      setStatus("connecting");
      setStatusMessage("Escolha sua instituição e autorize o compartilhamento de dados.");
    },
    onError: (error) => {
      setStatus("error");
      setStatusMessage(error.message || "Não foi possível iniciar a conexão.");
    },
  });

  const syncQuery = trpc.pluggy.syncItem.useQuery(
    { itemId: itemId || "pending" },
    { enabled: Boolean(itemId), retry: false },
  );

  useEffect(() => {
    if (!syncQuery.data || !itemId) return;
    const institutionName = syncQuery.data.accounts[0]?.institutionName ?? "Instituição conectada";
    syncOpenFinanceData({
      connection: {
        id: `pluggy-${itemId}`,
        providerId: "pluggy",
        institutionName,
        itemId,
        status: "connected",
        connectedAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
      },
      accounts: syncQuery.data.accounts,
      transactions: syncQuery.data.transactions,
    });
    setStatus("connected");
    setStatusMessage(`${syncQuery.data.accounts.length} conta(s) sincronizada(s) com sucesso.`);
    setConnectToken(null);
  }, [itemId, syncOpenFinanceData, syncQuery.data]);

  useEffect(() => {
    if (!syncQuery.error) return;
    setStatus("error");
    setStatusMessage("A conexão foi criada, mas não foi possível sincronizar as contas.");
  }, [syncQuery.error]);

  const startConnection = () => {
    setStatus("creating");
    setStatusMessage("Preparando uma sessão segura com o Pluggy...");
    tokenMutation.mutate({ clientUserId });
  };

  const handleSuccess = (payload: { item: { id?: string } }) => {
    const createdItemId = payload.item?.id;
    if (!createdItemId) {
      setStatus("error");
      setStatusMessage("O Pluggy não informou o identificador da conexão.");
      return;
    }
    setItemId(createdItemId);
    setStatus("syncing");
    setStatusMessage("Conexão autorizada. Buscando suas contas e movimentações...");
  };

  const handleError = (error: { message: string }) => {
    setConnectToken(null);
    setStatus("error");
    setStatusMessage(error.message || "A conexão não foi concluída.");
  };

  const statusTitle = status === "connected" ? "Conexão ativa" : status === "error" ? "Não foi possível conectar" : status === "syncing" ? "Sincronizando dados" : "Conexão segura";

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={styles.content}>
        <View style={styles.heroIcon}><IconSymbol name="building.columns.fill" size={34} color="#FFFFFF" /></View>
        <Text style={styles.title}>Conecte com confiança</Text>
        <Text style={styles.subtitle}>Escolha sua instituição no Pluggy Connect. A autenticação acontece no ambiente seguro do banco, sem que o app receba sua senha.</Text>

        <View style={styles.statusCard}>
          <View style={[styles.statusDot, status === "connected" && styles.successDot, status === "error" && styles.errorDot]} />
          <View style={styles.statusCopy}>
            <Text style={styles.statusLabel}>OPEN FINANCE · PLUGGY</Text>
            <Text style={styles.statusTitle}>{statusTitle}</Text>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>O que será sincronizado</Text>
          <Text style={styles.infoText}>Contas autorizadas, saldos e movimentações disponíveis no item conectado. Você pode revogar o consentimento diretamente com a instituição financeira.</Text>
        </View>

        <View style={styles.bottomArea}>
          {status !== "connected" && (
            <Pressable accessibilityRole="button" disabled={status === "creating" || status === "syncing"} onPress={startConnection} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, (status === "creating" || status === "syncing") && styles.disabledButton]}>
              <Text style={styles.primaryButtonText}>{status === "creating" ? "Preparando conexão..." : status === "syncing" ? "Sincronizando..." : status === "error" ? "Tentar novamente" : "Conectar uma instituição"}</Text>
            </Pressable>
          )}
          {status === "connected" && <Text style={styles.connectedHint}>{data.accounts.filter((account) => account.source === "open_finance").length} conta(s) do Open Finance estão disponíveis na aba Contas.</Text>}
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Voltar para contas</Text>
          </Pressable>
        </View>

        {connectToken && (
          <PluggyConnect
            connectToken={connectToken}
            language="pt"
            theme="light"
            includeSandbox={false}
            forceOauthInBrowser
            onOpen={() => setStatusMessage("Pluggy Connect aberto. Siga as instruções da instituição.")}
            onClose={() => setConnectToken(null)}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColorPalette) => StyleSheet.create({
  content: { flex: 1, padding: 22, justifyContent: "center" },
  heroIcon: { width: 68, height: 68, borderRadius: 22, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { color: colors.foreground, fontSize: 28, fontWeight: "800", letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  statusCard: { flexDirection: "row", gap: 11, backgroundColor: colors.surface, padding: 16, borderRadius: 19, marginTop: 25 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.warning, marginTop: 5 },
  successDot: { backgroundColor: colors.success },
  errorDot: { backgroundColor: colors.error },
  statusCopy: { flex: 1 },
  statusLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  statusTitle: { color: colors.foreground, fontSize: 15, fontWeight: "800", marginTop: 3 },
  statusText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  infoCard: { padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 19, marginTop: 12 },
  infoTitle: { color: colors.foreground, fontSize: 15, fontWeight: "800" },
  infoText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  bottomArea: { marginTop: 25, gap: 8 },
  primaryButton: { minHeight: 52, borderRadius: 15, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  disabledButton: { opacity: 0.55 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", textAlign: "center" },
  secondaryButton: { minHeight: 46, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  connectedHint: { color: colors.success, fontSize: 13, lineHeight: 19, textAlign: "center", fontWeight: "700" },
  pressed: { opacity: 0.74, transform: [{ scale: 0.98 }] },
});
