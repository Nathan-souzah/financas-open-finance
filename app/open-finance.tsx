import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { openFinanceReadiness } from "@/lib/open-finance/provider";
import type { ThemeColorPalette } from "@/constants/theme";

export default function OpenFinanceScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const showReadiness = () => {
    Alert.alert("Conexão em preparação", "Quando um provedor for escolhido, esta etapa abrirá uma jornada de consentimento segura e retornará ao aplicativo após a autorização.");
  };
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={styles.content}>
        <View style={styles.heroIcon}><IconSymbol name="building.columns.fill" size={34} color="#FFFFFF" /></View>
        <Text style={styles.title}>Conecte com confiança</Text>
        <Text style={styles.subtitle}>O Open Finance permitirá trazer contas e movimentações autorizadas para uma visão única, sem solicitar sua senha bancária no aplicativo.</Text>

        <View style={styles.statusCard}>
          <View style={styles.statusDot} />
          <View style={styles.statusCopy}>
            <Text style={styles.statusLabel}>STATUS DA INTEGRAÇÃO</Text>
            <Text style={styles.statusTitle}>Preparação em andamento</Text>
            <Text style={styles.statusText}>{openFinanceReadiness.message}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Como funcionará</Text>
          <Text style={styles.infoText}>Você escolherá a instituição, revisará o escopo dos dados e fará a autorização no ambiente seguro indicado pelo provedor. Após o retorno, as informações serão normalizadas para o seu painel.</Text>
        </View>

        <View style={styles.bottomArea}>
          <Pressable accessibilityRole="button" onPress={showReadiness} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>Entender a próxima etapa</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Voltar para contas</Text>
          </Pressable>
        </View>
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
  statusCopy: { flex: 1 },
  statusLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  statusTitle: { color: colors.foreground, fontSize: 15, fontWeight: "800", marginTop: 3 },
  statusText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  infoCard: { padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 19, marginTop: 12 },
  infoTitle: { color: colors.foreground, fontSize: 15, fontWeight: "800" },
  infoText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  bottomArea: { marginTop: 25, gap: 8 },
  primaryButton: { minHeight: 52, borderRadius: 15, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  secondaryButton: { minHeight: 46, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.74, transform: [{ scale: 0.98 }] },
});
