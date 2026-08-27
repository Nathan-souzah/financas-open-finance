import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { formatCurrency, formatDate, transactionSign } from "@/lib/finance/format";
import { useFinance } from "@/lib/finance/finance-provider";
import { categoryFor, type Transaction, type TransactionType } from "@/lib/finance/types";
import type { ThemeColorPalette } from "@/constants/theme";

type Filter = "all" | TransactionType;

export default function TransactionsScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { data } = useFinance();
  const [filter, setFilter] = useState<Filter>("all");
  const transactions = [...data.transactions]
    .filter((transaction) => filter === "all" || transaction.type === filter)
    .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn));

  return (
    <ScreenContainer>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.headingLine}>
              <View>
                <Text style={styles.title}>Movimentações</Text>
                <Text style={styles.subtitle}>Organize cada entrada e saída do seu dia.</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Adicionar movimentação"
                onPress={() => router.push("/transaction-form")}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
              >
                <IconSymbol name="plus.circle.fill" size={27} color="#FFFFFF" />
              </Pressable>
            </View>
            <View style={styles.filters}>
              <FilterChip active={filter === "all"} label="Todas" onPress={() => setFilter("all")} styles={styles} />
              <FilterChip active={filter === "income"} label="Receitas" onPress={() => setFilter("income")} styles={styles} />
              <FilterChip active={filter === "expense"} label="Despesas" onPress={() => setFilter("expense")} styles={styles} />
            </View>
          </View>
        }
        renderItem={({ item }) => <TransactionRow item={item} styles={styles} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="arrow.left.arrow.right" size={32} color={colors.primary} />
            <Text style={styles.emptyTitle}>{filter === "all" ? "Nenhuma movimentação registrada" : "Nada neste filtro"}</Text>
            <Text style={styles.emptyText}>Inclua um lançamento para acompanhar suas decisões financeiras com mais clareza.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

function FilterChip({ active, label, onPress, styles }: { active: boolean; label: string; onPress: () => void; styles: ReturnType<typeof createStyles> }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.filterChip, active && styles.filterChipActive, pressed && styles.pressed]}>
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </Pressable>
  );
}

function TransactionRow({ item, styles }: { item: Transaction; styles: ReturnType<typeof createStyles> }) {
  const category = categoryFor(item.categoryId);
  const isIncome = item.type === "income";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Editar ${item.description}`}
      onPress={() => router.push({ pathname: "/transaction-form", params: { transactionId: item.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${category.color}22` }]}>
        <View style={[styles.iconDot, { backgroundColor: category.color }]} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.rowMeta}>{category.name} · {formatDate(item.occurredOn)}</Text>
      </View>
      <Text style={[styles.rowAmount, isIncome ? styles.income : styles.expense]}>{transactionSign(item.type)} {formatCurrency(item.amountCents)}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColorPalette) => StyleSheet.create({
  listContent: { padding: 20, paddingBottom: 34, flexGrow: 1 },
  headingLine: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20 },
  title: { color: colors.foreground, fontSize: 27, fontWeight: "800", letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4, maxWidth: 260 },
  addButton: { backgroundColor: colors.primary, width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  filters: { flexDirection: "row", gap: 8, marginBottom: 20 },
  filterChip: { minHeight: 35, paddingHorizontal: 13, justifyContent: "center", borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.muted, fontWeight: "700", fontSize: 12 },
  filterTextActive: { color: "#FFFFFF" },
  row: { flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: colors.surface, padding: 13, borderRadius: 17, marginBottom: 9 },
  iconCircle: { width: 39, height: 39, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  iconDot: { width: 10, height: 10, borderRadius: 5 },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.foreground, fontSize: 14, fontWeight: "800" },
  rowMeta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  rowAmount: { fontSize: 14, fontWeight: "800" },
  income: { color: colors.success },
  expense: { color: colors.error },
  emptyState: { backgroundColor: colors.surface, borderRadius: 20, padding: 24, alignItems: "center", marginTop: 12 },
  emptyTitle: { color: colors.foreground, fontSize: 16, fontWeight: "800", textAlign: "center", marginTop: 12 },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 6 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
