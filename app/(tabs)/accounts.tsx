import { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { accountBalance, formatCurrency, parseCurrencyText } from "@/lib/finance/format";
import { useFinance } from "@/lib/finance/finance-provider";
import type { Account } from "@/lib/finance/types";
import type { ThemeColorPalette } from "@/constants/theme";

export default function AccountsScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { data, addAccount, removeAccount } = useFinance();
  const [accountName, setAccountName] = useState("");
  const [openingBalanceText, setOpeningBalanceText] = useState("");

  const createAccount = () => {
    const name = accountName.trim();
    const openingBalanceCents = parseCurrencyText(openingBalanceText) ?? 0;
    if (!name) {
      Alert.alert("Dê um nome à conta", "Por exemplo: conta do dia a dia ou reserva de emergência.");
      return;
    }
    addAccount({ name, openingBalanceCents });
    setAccountName("");
    setOpeningBalanceText("");
  };

  const confirmDelete = (account: Account) => {
    Alert.alert(
      "Excluir conta?",
      `A conta “${account.name}” será removida. Seus lançamentos serão preservados, mas ficarão sem uma conta vinculada.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => removeAccount(account.id) },
      ],
    );
  };

  return (
    <ScreenContainer>
      <FlatList
        data={data.accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Contas</Text>
            <Text style={styles.subtitle}>Gerencie contas manuais ou conecte uma instituição para sincronizar seus dados autorizados.</Text>

            <Pressable accessibilityRole="button" onPress={() => router.push("/open-finance")} style={({ pressed }) => [styles.openFinanceCard, pressed && styles.pressed]}>
              <View style={styles.openFinanceIcon}><IconSymbol name="building.columns.fill" size={24} color="#FFFFFF" /></View>
              <View style={styles.openFinanceCopy}>
                <Text style={styles.openFinanceLabel}>OPEN FINANCE</Text>
                <Text style={styles.openFinanceTitle}>Conecte suas instituições</Text>
                <Text style={styles.openFinanceText}>Use o Pluggy Connect para autorizar uma instituição e trazer suas contas para cá.</Text>
              </View>
              <IconSymbol name="chevron.right" size={21} color="#BDE6DE" />
            </Pressable>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Adicionar conta manual</Text>
              <TextInput
                accessibilityLabel="Nome da conta"
                value={accountName}
                onChangeText={setAccountName}
                placeholder="Ex.: Conta principal"
                placeholderTextColor={colors.muted}
                returnKeyType="next"
                style={styles.input}
              />
              <TextInput
                accessibilityLabel="Saldo inicial da conta"
                value={openingBalanceText}
                onChangeText={setOpeningBalanceText}
                placeholder="Saldo inicial (opcional)"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={createAccount}
                style={styles.input}
              />
              <Pressable accessibilityRole="button" onPress={createAccount} style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}>
                <Text style={styles.createButtonText}>Salvar conta</Text>
              </Pressable>
            </View>

            {data.accounts.length > 0 && <Text style={styles.sectionTitle}>Suas contas</Text>}
          </View>
        }
        renderItem={({ item }) => <AccountRow account={item} balanceCents={accountBalance(data, item)} onDelete={() => confirmDelete(item)} styles={styles} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="creditcard.fill" size={30} color={colors.primary} />
            <Text style={styles.emptyTitle}>Nenhuma conta adicionada</Text>
            <Text style={styles.emptyText}>Adicione uma conta manual para distinguir seus saldos e vincular movimentações.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

function AccountRow({ account, balanceCents, onDelete, styles }: { account: Account; balanceCents: number; onDelete: () => void; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.accountRow}>
      <View style={styles.accountIcon}><IconSymbol name="creditcard.fill" size={21} color={styles.accountIconColor.color} /></View>
      <View style={styles.accountCopy}>
        <Text style={styles.accountName}>{account.name}</Text>
        <Text style={styles.accountMeta}>{account.source === "open_finance" ? account.institutionName ?? "Open Finance" : "Conta manual"}</Text>
      </View>
      <View style={styles.accountRight}>
        <Text style={styles.accountBalance}>{formatCurrency(balanceCents)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Excluir ${account.name}`} onPress={onDelete} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
          <Text style={styles.deleteText}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColorPalette) => StyleSheet.create({
  listContent: { padding: 20, paddingBottom: 34, flexGrow: 1 },
  title: { color: colors.foreground, fontSize: 27, fontWeight: "800", letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 19 },
  openFinanceCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.primary, padding: 16, borderRadius: 21, marginBottom: 15 },
  openFinanceIcon: { backgroundColor: "rgba(255,255,255,0.16)", width: 43, height: 43, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  openFinanceCopy: { flex: 1 },
  openFinanceLabel: { color: "#BDE6DE", fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  openFinanceTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginTop: 2 },
  openFinanceText: { color: "#D7F0EB", fontSize: 11, lineHeight: 15, marginTop: 3 },
  formCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, marginBottom: 24 },
  formTitle: { color: colors.foreground, fontSize: 15, fontWeight: "800", marginBottom: 12 },
  input: { minHeight: 48, color: colors.foreground, fontSize: 14, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 13, marginBottom: 9 },
  createButton: { minHeight: 45, justifyContent: "center", alignItems: "center", backgroundColor: colors.primary, borderRadius: 12, marginTop: 2 },
  createButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  sectionTitle: { color: colors.foreground, fontSize: 17, fontWeight: "800", marginBottom: 10 },
  accountRow: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: colors.surface, padding: 14, borderRadius: 17, marginBottom: 8 },
  accountIcon: { width: 41, height: 41, borderRadius: 14, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  accountIconColor: { color: colors.primary },
  accountCopy: { flex: 1, minWidth: 0 },
  accountName: { color: colors.foreground, fontSize: 14, fontWeight: "800" },
  accountMeta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  accountRight: { alignItems: "flex-end" },
  accountBalance: { color: colors.foreground, fontSize: 14, fontWeight: "800" },
  deleteButton: { marginTop: 4, paddingVertical: 3, paddingLeft: 7 },
  deleteText: { color: colors.error, fontSize: 11, fontWeight: "700" },
  emptyState: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 20, padding: 24, marginTop: 0 },
  emptyTitle: { color: colors.foreground, fontSize: 16, fontWeight: "800", textAlign: "center", marginTop: 11 },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 6 },
  pressed: { opacity: 0.74, transform: [{ scale: 0.98 }] },
});
