import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { consolidatedBalance, formatCurrency, formatMonth, monthTotals, transactionSign } from "@/lib/finance/format";
import { useFinance } from "@/lib/finance/finance-provider";
import { categoryFor, type Transaction } from "@/lib/finance/types";
import type { ThemeColorPalette } from "@/constants/theme";

function TransactionPreview({ transaction }: { transaction: Transaction }) {
  const colors = useColors();
  const styles = createStyles(colors);
  const category = categoryFor(transaction.categoryId);
  const isIncome = transaction.type === "income";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Editar ${transaction.description}`}
      onPress={() => router.push({ pathname: "/transaction-form", params: { transactionId: transaction.id } })}
      style={({ pressed }) => [styles.transactionRow, pressed && styles.pressed]}
    >
      <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
      <View style={styles.transactionText}>
        <Text numberOfLines={1} style={styles.transactionTitle}>{transaction.description}</Text>
        <Text style={styles.transactionMeta}>{category.name}</Text>
      </View>
      <Text style={[styles.transactionAmount, isIncome ? styles.income : styles.expense]}>
        {transactionSign(transaction.type)} {formatCurrency(transaction.amountCents)}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { data, ready } = useFinance();
  const totals = monthTotals(data.transactions);
  const balance = consolidatedBalance(data);
  const recentTransactions = [...data.transactions]
    .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn))
    .slice(0, 4);
  const budgetUsed = data.monthlyBudgetCents ? Math.min((totals.expenseCents / data.monthlyBudgetCents) * 100, 100) : 0;

  if (!ready) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Organizando suas informações…</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={recentTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionPreview transaction={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.topline}>
              <View>
                <Text style={styles.eyebrow}>VISÃO GERAL</Text>
                <Text style={styles.greeting}>Seu dinheiro, com clareza.</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Adicionar movimentação"
                onPress={() => router.push("/transaction-form")}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
              >
                <IconSymbol name="plus.circle.fill" size={28} color={colors.surface} />
              </Pressable>
            </View>

            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Saldo consolidado</Text>
              <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
              <Text style={styles.balanceNote}>Inclui contas manuais e lançamentos sem conta vinculada.</Text>
              <View style={styles.periodLine}>
                <View style={styles.periodItem}>
                  <IconSymbol name="arrow.up.right" size={18} color={colors.success} />
                  <Text style={styles.periodText}>Entrou {formatCurrency(totals.incomeCents)}</Text>
                </View>
                <View style={styles.periodItem}>
                  <IconSymbol name="arrow.down.right" size={18} color={colors.error} />
                  <Text style={styles.periodText}>Saiu {formatCurrency(totals.expenseCents)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Orçamento de {formatMonth()}</Text>
                <Text style={styles.sectionSubtitle}>
                  {data.monthlyBudgetCents === null
                    ? "Defina um limite para acompanhar suas despesas."
                    : `${formatCurrency(totals.expenseCents)} de ${formatCurrency(data.monthlyBudgetCents)} utilizados.`}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/(tabs)/budget")}
                style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
              >
                <Text style={styles.linkText}>{data.monthlyBudgetCents === null ? "Definir" : "Ver"}</Text>
                <IconSymbol name="chevron.right" size={18} color={colors.primary} />
              </Pressable>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${budgetUsed}%` }]} />
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Movimentações recentes</Text>
                <Text style={styles.sectionSubtitle}>Tudo o que você registra aparece aqui.</Text>
              </View>
              {data.transactions.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/(tabs)/transactions")}
                  style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
                >
                  <Text style={styles.linkText}>Ver todas</Text>
                  <IconSymbol name="chevron.right" size={18} color={colors.primary} />
                </Pressable>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <IconSymbol name="arrow.left.arrow.right" size={28} color={colors.primary} />
            <Text style={styles.emptyTitle}>Comece pelo primeiro lançamento</Text>
            <Text style={styles.emptyText}>Registre uma receita ou despesa para acompanhar sua vida financeira por aqui.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/transaction-form")}
              style={({ pressed }) => [styles.emptyAction, pressed && styles.pressed]}
            >
              <Text style={styles.emptyActionText}>Adicionar movimentação</Text>
            </Pressable>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColorPalette) => StyleSheet.create({
  listContent: { padding: 20, paddingBottom: 36 },
  loadingText: { color: colors.muted, fontSize: 15, marginTop: 14 },
  topline: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.4, marginBottom: 5 },
  greeting: { color: colors.foreground, fontSize: 25, fontWeight: "700", letterSpacing: -0.5 },
  addButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", shadowColor: colors.primary, shadowOpacity: 0.23, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  balanceCard: { backgroundColor: colors.primary, borderRadius: 24, padding: 22, marginBottom: 28 },
  balanceLabel: { color: "#D7F0EB", fontSize: 14, fontWeight: "600" },
  balanceValue: { color: "#FFFFFF", fontSize: 34, fontWeight: "800", letterSpacing: -1.2, marginTop: 5 },
  balanceNote: { color: "#C4E4DF", fontSize: 12, lineHeight: 17, marginTop: 6 },
  periodLine: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 22, paddingTop: 15, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.17)" },
  periodItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  periodText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 },
  sectionTitle: { color: colors.foreground, fontSize: 17, fontWeight: "700", letterSpacing: -0.2 },
  sectionSubtitle: { color: colors.muted, fontSize: 12, marginTop: 3, lineHeight: 17, maxWidth: 245 },
  linkButton: { flexDirection: "row", alignItems: "center", gap: 2, paddingVertical: 6, paddingLeft: 8 },
  linkText: { color: colors.primary, fontSize: 13, fontWeight: "700" },
  progressTrack: { height: 8, backgroundColor: colors.border, borderRadius: 999, overflow: "hidden", marginBottom: 28 },
  progressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 999 },
  transactionRow: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, paddingHorizontal: 14, borderRadius: 17, marginBottom: 8 },
  categoryDot: { width: 11, height: 11, borderRadius: 6 },
  transactionText: { flex: 1 },
  transactionTitle: { color: colors.foreground, fontSize: 14, fontWeight: "700" },
  transactionMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  transactionAmount: { fontSize: 14, fontWeight: "800" },
  income: { color: colors.success },
  expense: { color: colors.error },
  emptyCard: { backgroundColor: colors.surface, borderRadius: 20, alignItems: "flex-start", padding: 20, gap: 9 },
  emptyTitle: { color: colors.foreground, fontSize: 16, fontWeight: "800", marginTop: 2 },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  emptyAction: { marginTop: 7, paddingVertical: 10, paddingHorizontal: 13, borderRadius: 12, backgroundColor: colors.primary },
  emptyActionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.74, transform: [{ scale: 0.98 }] },
});
