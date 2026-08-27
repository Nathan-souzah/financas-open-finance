import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { categoryExpenses, formatCurrency, formatEditableCurrency, formatMonth, monthTotals, parseCurrencyText } from "@/lib/finance/format";
import { useFinance } from "@/lib/finance/finance-provider";
import { categoryFor, DEFAULT_CATEGORIES } from "@/lib/finance/types";
import type { ThemeColorPalette } from "@/constants/theme";

export default function BudgetScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { data, setMonthlyBudgetCents } = useFinance();
  const [budgetText, setBudgetText] = useState(formatEditableCurrency(data.monthlyBudgetCents));
  const totals = monthTotals(data.transactions);
  const expensesByCategory = categoryExpenses(data.transactions);
  const categoryRows = useMemo(
    () => DEFAULT_CATEGORIES.filter((category) => category.type !== "income")
      .map((category) => ({ category, amountCents: expensesByCategory.get(category.id) ?? 0 }))
      .filter((row) => row.amountCents > 0)
      .sort((a, b) => b.amountCents - a.amountCents),
    [expensesByCategory],
  );
  const budget = data.monthlyBudgetCents;
  const usedPercent = budget && budget > 0 ? Math.min((totals.expenseCents / budget) * 100, 100) : 0;
  const remaining = budget === null ? null : budget - totals.expenseCents;

  useEffect(() => {
    setBudgetText(formatEditableCurrency(data.monthlyBudgetCents));
  }, [data.monthlyBudgetCents]);

  const saveBudget = () => {
    const amount = parseCurrencyText(budgetText);
    if (amount === null || amount <= 0) {
      Alert.alert("Informe um limite", "Use um valor maior que zero para definir seu orçamento mensal.");
      return;
    }
    setMonthlyBudgetCents(amount);
    Alert.alert("Orçamento atualizado", "Seu limite mensal já está sendo considerado no painel.");
  };

  const clearBudget = () => {
    setMonthlyBudgetCents(null);
    setBudgetText("");
  };

  return (
    <ScreenContainer>
      <FlatList
        data={categoryRows}
        keyExtractor={(item) => item.category.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Orçamento</Text>
            <Text style={styles.subtitle}>Defina um teto mensal e acompanhe o ritmo das suas despesas.</Text>

            <View style={styles.budgetCard}>
              <Text style={styles.cardLabel}>LIMITE DE {formatMonth().toUpperCase()}</Text>
              <TextInput
                accessibilityLabel="Valor do orçamento mensal"
                value={budgetText}
                onChangeText={setBudgetText}
                placeholder="0,00"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                returnKeyType="done"
                style={styles.budgetInput}
              />
              <View style={styles.buttonLine}>
                <Pressable accessibilityRole="button" onPress={saveBudget} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
                  <Text style={styles.saveButtonText}>Salvar limite</Text>
                </Pressable>
                {budget !== null && (
                  <Pressable accessibilityRole="button" onPress={clearBudget} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
                    <Text style={styles.clearButtonText}>Remover</Text>
                  </Pressable>
                )}
              </View>
            </View>

            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View>
                  <Text style={styles.statusTitle}>Despesas do mês</Text>
                  <Text style={styles.statusValue}>{formatCurrency(totals.expenseCents)}</Text>
                </View>
                <View style={styles.percentBubble}>
                  <Text style={styles.percentText}>{Math.round(usedPercent)}%</Text>
                </View>
              </View>
              <View style={styles.track}><View style={[styles.fill, { width: `${usedPercent}%` }]} /></View>
              <Text style={[styles.statusMessage, remaining !== null && remaining < 0 && styles.statusMessageOver]}>
                {remaining === null
                  ? "Defina um limite para ver quanto ainda pode gastar."
                  : remaining >= 0
                    ? `Restam ${formatCurrency(remaining)} dentro do seu limite.`
                    : `Você ultrapassou o limite em ${formatCurrency(Math.abs(remaining))}.`}
              </Text>
            </View>

            <View style={styles.sectionLine}>
              <Text style={styles.sectionTitle}>Por categoria</Text>
              <Text style={styles.sectionNote}>no mês atual</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const category = categoryFor(item.category.id);
          const share = totals.expenseCents > 0 ? Math.round((item.amountCents / totals.expenseCents) * 100) : 0;
          return (
            <View style={styles.categoryRow}>
              <View style={[styles.categoryMark, { backgroundColor: category.color }]} />
              <View style={styles.categoryCopy}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryShare}>{share}% das despesas</Text>
              </View>
              <Text style={styles.categoryAmount}>{formatCurrency(item.amountCents)}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="chart.pie.fill" size={30} color={colors.primary} />
            <Text style={styles.emptyTitle}>A distribuição aparecerá aqui</Text>
            <Text style={styles.emptyText}>Quando registrar despesas categorizadas, você verá quais áreas consomem mais do seu orçamento.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColorPalette) => StyleSheet.create({
  listContent: { padding: 20, paddingBottom: 34, flexGrow: 1 },
  title: { color: colors.foreground, fontSize: 27, fontWeight: "800", letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 20 },
  budgetCard: { backgroundColor: colors.primary, borderRadius: 22, padding: 20, marginBottom: 14 },
  cardLabel: { color: "#D7F0EB", fontSize: 11, fontWeight: "800", letterSpacing: 1.1 },
  budgetInput: { color: "#FFFFFF", fontSize: 30, lineHeight: 38, fontWeight: "800", paddingVertical: 7, paddingHorizontal: 0, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.35)", marginTop: 5 },
  buttonLine: { flexDirection: "row", gap: 12, alignItems: "center", marginTop: 15 },
  saveButton: { backgroundColor: "#FFFFFF", paddingVertical: 11, paddingHorizontal: 15, borderRadius: 12 },
  saveButtonText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  clearButton: { paddingVertical: 10, paddingHorizontal: 5 },
  clearButtonText: { color: "#D7F0EB", fontSize: 13, fontWeight: "700" },
  statusCard: { backgroundColor: colors.surface, padding: 18, borderRadius: 20, marginBottom: 27 },
  statusHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusTitle: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  statusValue: { color: colors.foreground, fontSize: 23, fontWeight: "800", letterSpacing: -0.5, marginTop: 3 },
  percentBubble: { minWidth: 48, height: 32, borderRadius: 16, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  percentText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  track: { height: 8, borderRadius: 9, overflow: "hidden", backgroundColor: colors.border, marginTop: 16 },
  fill: { height: "100%", borderRadius: 9, backgroundColor: colors.primary },
  statusMessage: { color: colors.muted, fontSize: 12, marginTop: 10, lineHeight: 17 },
  statusMessageOver: { color: colors.error, fontWeight: "700" },
  sectionLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 },
  sectionTitle: { color: colors.foreground, fontSize: 17, fontWeight: "800" },
  sectionNote: { color: colors.muted, fontSize: 12 },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: colors.surface, padding: 14, borderRadius: 17, marginBottom: 8 },
  categoryMark: { width: 10, height: 34, borderRadius: 6 },
  categoryCopy: { flex: 1 },
  categoryName: { color: colors.foreground, fontSize: 14, fontWeight: "800" },
  categoryShare: { color: colors.muted, fontSize: 12, marginTop: 3 },
  categoryAmount: { color: colors.foreground, fontSize: 14, fontWeight: "800" },
  emptyState: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 20, padding: 24, marginTop: 3 },
  emptyTitle: { color: colors.foreground, fontSize: 16, fontWeight: "800", textAlign: "center", marginTop: 11 },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 6 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
