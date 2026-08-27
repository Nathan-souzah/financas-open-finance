import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { formatEditableCurrency, parseCurrencyText } from "@/lib/finance/format";
import { useFinance } from "@/lib/finance/finance-provider";
import { categoriesFor, type TransactionType } from "@/lib/finance/types";
import type { ThemeColorPalette } from "@/constants/theme";

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionFormScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { transactionId } = useLocalSearchParams<{ transactionId?: string }>();
  const { data, addTransaction, updateTransaction, removeTransaction } = useFinance();
  const existing = data.transactions.find((transaction) => transaction.id === transactionId);
  const [type, setType] = useState<TransactionType>(existing?.type ?? "expense");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [amountText, setAmountText] = useState(formatEditableCurrency(existing?.amountCents ?? null));
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "alimentacao");
  const [accountId, setAccountId] = useState(existing?.accountId ?? "");
  const [occurredOn, setOccurredOn] = useState(existing?.occurredOn ?? today());
  const visibleCategories = useMemo(() => categoriesFor(type), [type]);
  const accountChoices = useMemo(() => [{ id: "", name: "Sem conta" }, ...data.accounts.map((account) => ({ id: account.id, name: account.name }))], [data.accounts]);

  useEffect(() => {
    if (!existing) return;
    setType(existing.type);
    setDescription(existing.description);
    setAmountText(formatEditableCurrency(existing.amountCents));
    setCategoryId(existing.categoryId);
    setAccountId(existing.accountId ?? "");
    setOccurredOn(existing.occurredOn);
  }, [existing]);

  const selectType = (nextType: TransactionType) => {
    setType(nextType);
    const firstCategory = categoriesFor(nextType)[0];
    if (!visibleCategories.some((category) => category.id === categoryId)) setCategoryId(firstCategory.id);
  };

  const save = () => {
    const amountCents = parseCurrencyText(amountText);
    const normalizedDate = occurredOn.trim();
    if (!description.trim()) {
      Alert.alert("Adicione uma descrição", "Dê um nome para identificar esta movimentação depois.");
      return;
    }
    if (amountCents === null || amountCents <= 0) {
      Alert.alert("Informe um valor", "Use um valor maior que zero para salvar a movimentação.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
      Alert.alert("Data inválida", "Use o formato AAAA-MM-DD, por exemplo 2026-08-26.");
      return;
    }
    const draft = { amountCents, type, description: description.trim(), categoryId, accountId: accountId || undefined, occurredOn: normalizedDate };
    if (existing) updateTransaction(existing.id, draft);
    else addTransaction(draft);
    router.back();
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert("Excluir movimentação?", "Esta ação não pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => { removeTransaction(existing.id); router.back(); } },
    ]);
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{existing ? "Editar movimentação" : "Nova movimentação"}</Text>
        <Text style={styles.subtitle}>Registre o que entrou ou saiu. Você pode ajustar tudo depois.</Text>

        <View style={styles.typeToggle}>
          <Pressable accessibilityRole="button" accessibilityState={{ selected: type === "expense" }} onPress={() => selectType("expense")} style={({ pressed }) => [styles.typeOption, type === "expense" && styles.typeOptionExpense, pressed && styles.pressed]}>
            <Text style={[styles.typeText, type === "expense" && styles.typeTextSelected]}>Despesa</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityState={{ selected: type === "income" }} onPress={() => selectType("income")} style={({ pressed }) => [styles.typeOption, type === "income" && styles.typeOptionIncome, pressed && styles.pressed]}>
            <Text style={[styles.typeText, type === "income" && styles.typeTextSelected]}>Receita</Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>Valor</Text>
        <TextInput accessibilityLabel="Valor" value={amountText} onChangeText={setAmountText} placeholder="0,00" placeholderTextColor={colors.muted} keyboardType="decimal-pad" returnKeyType="next" style={styles.amountInput} />

        <Text style={styles.fieldLabel}>Descrição</Text>
        <TextInput accessibilityLabel="Descrição" value={description} onChangeText={setDescription} placeholder={type === "income" ? "Ex.: pagamento recebido" : "Ex.: mercado"} placeholderTextColor={colors.muted} returnKeyType="next" style={styles.textInput} />

        <Text style={styles.fieldLabel}>Categoria</Text>
        <FlatList
          data={visibleCategories}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
          renderItem={({ item }) => {
            const selected = categoryId === item.id;
            return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setCategoryId(item.id)} style={({ pressed }) => [styles.chip, selected && { borderColor: item.color, backgroundColor: `${item.color}18` }, pressed && styles.pressed]}><View style={[styles.chipDot, { backgroundColor: item.color }]} /><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item.name}</Text></Pressable>;
          }}
        />

        <Text style={styles.fieldLabel}>Conta</Text>
        <FlatList
          data={accountChoices}
          horizontal
          keyExtractor={(item) => item.id || "unassigned"}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
          renderItem={({ item }) => {
            const selected = accountId === item.id;
            return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setAccountId(item.id)} style={({ pressed }) => [styles.accountChip, selected && styles.accountChipSelected, pressed && styles.pressed]}><Text style={[styles.chipText, selected && styles.accountChipTextSelected]}>{item.name}</Text></Pressable>;
          }}
        />

        <Text style={styles.fieldLabel}>Data</Text>
        <TextInput accessibilityLabel="Data" value={occurredOn} onChangeText={setOccurredOn} placeholder="AAAA-MM-DD" placeholderTextColor={colors.muted} autoCapitalize="none" keyboardType="numbers-and-punctuation" returnKeyType="done" onSubmitEditing={save} style={styles.textInput} />

        <Pressable accessibilityRole="button" onPress={save} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
          <Text style={styles.saveButtonText}>{existing ? "Salvar alterações" : "Salvar movimentação"}</Text>
        </Pressable>
        {existing && <Pressable accessibilityRole="button" onPress={confirmDelete} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}><Text style={styles.deleteText}>Excluir movimentação</Text></Pressable>}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColorPalette) => StyleSheet.create({
  content: { padding: 20, paddingBottom: 38 },
  title: { color: colors.foreground, fontSize: 25, fontWeight: "800", letterSpacing: -0.7 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 21 },
  typeToggle: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 15, padding: 4, marginBottom: 22 },
  typeOption: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: 11 },
  typeOptionExpense: { backgroundColor: colors.error },
  typeOptionIncome: { backgroundColor: colors.success },
  typeText: { color: colors.muted, fontSize: 14, fontWeight: "800" },
  typeTextSelected: { color: "#FFFFFF" },
  fieldLabel: { color: colors.foreground, fontSize: 13, fontWeight: "800", marginBottom: 7, marginTop: 2 },
  amountInput: { minHeight: 59, color: colors.foreground, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 15, paddingHorizontal: 15, fontSize: 25, fontWeight: "800", marginBottom: 17 },
  textInput: { minHeight: 50, color: colors.foreground, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, fontSize: 14, marginBottom: 17 },
  chipsContent: { gap: 8, paddingBottom: 18 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 38, paddingHorizontal: 11, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  chipTextSelected: { color: colors.foreground },
  accountChip: { minHeight: 38, justifyContent: "center", paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  accountChipSelected: { borderColor: colors.primary, backgroundColor: "#DCEFEA" },
  accountChipTextSelected: { color: colors.primary },
  saveButton: { minHeight: 52, borderRadius: 15, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center", marginTop: 4 },
  saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  deleteButton: { alignItems: "center", padding: 16, marginTop: 4 },
  deleteText: { color: colors.error, fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.74, transform: [{ scale: 0.98 }] },
});
