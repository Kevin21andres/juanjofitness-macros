// app/pdf/DietPdf.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { SharedDiet } from "@/lib/dietsApi";
import { formatEggAmount } from "@/lib/formatEggAmount";

/* =========================
   COLORES CORPORATIVOS
========================= */
const COLORS = {
  accent: "#1E90FF",
  accentDark: "#1E3A8A",
  protein: "#22C55E",
  carbs: "#F59E0B",
  fat: "#EF4444",
  text: "#020617",
  muted: "#475569",
  background: "#F8FAFC",
  card: "#FFFFFF",
  border: "#E2E8F0",
};

/* =========================
   ESTILOS
========================= */
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },

  hero: {
    backgroundColor: COLORS.accent,
    padding: 24,
    borderRadius: 14,
    marginBottom: 28,
  },

  heroTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },

  heroMeta: {
    fontSize: 10,
    color: "#DBEAFE",
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accentDark,
    marginBottom: 12,
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    border: `1 solid ${COLORS.border}`,
  },

  macroLine: {
    fontSize: 11,
    marginBottom: 6,
  },

  macroLabel: {
    color: COLORS.muted,
  },

  macroValue: {
    fontFamily: "Helvetica-Bold",
  },

  barContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 10,
  },

  barFill: {
    height: "100%",
    borderRadius: 4,
  },

  mealTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: COLORS.accent,
  },

  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottom: `1 solid ${COLORS.border}`,
  },

  foodName: {
    maxWidth: "70%",
  },

  grams: {
    color: COLORS.muted,
  },

  substituteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingLeft: 12,
  },

  substituteLabel: {
    fontSize: 9,
    color: COLORS.muted,
    fontStyle: "italic",
  },

  supplementBlock: {
    marginTop: 8,
    paddingTop: 6,
    borderTop: `1 solid ${COLORS.border}`,
  },

  supplementTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    marginBottom: 4,
  },

  supplementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
    paddingVertical: 2,
  },

  emptyMeal: {
    fontSize: 10,
    color: COLORS.muted,
    fontStyle: "italic",
  },

  notesText: {
    fontSize: 11,
    lineHeight: 1.5,
  },

  footer: {
    marginTop: 32,
    fontSize: 9,
    color: COLORS.muted,
    textAlign: "center",
  },
});

/* =========================
   PROPS
========================= */
type Props = {
  diet: SharedDiet;
};

/* =========================
   BARRA DE MACRO
========================= */
function MacroBar({
  label,
  value,
  color,
  total,
}: {
  label: string;
  value: number;
  color: string;
  total: number;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <View>
      <Text style={styles.macroLine}>
        <Text style={styles.macroLabel}>{label}: </Text>
        <Text style={[styles.macroValue, { color }]}>
          {value} g ({percent}%)
        </Text>
      </Text>

      <View style={styles.barContainer}>
        <View
          style={[
            styles.barFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

/* =========================
   PDF
========================= */
export default function DietPdf({ diet }: Props) {
  const totalMacros =
    diet.totals.protein +
    diet.totals.carbs +
    diet.totals.fat;

  return (
    <Document>
      <Page style={styles.page}>
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Plan Nutricional
          </Text>
          <Text style={styles.heroMeta}>
            Dieta: {diet.name}
          </Text>
        </View>

        {/* RESUMEN */}
        <Text style={styles.sectionTitle}>
          Resumen nutricional diario
        </Text>

        <View style={styles.card}>
          <Text style={styles.macroLine}>
            <Text style={styles.macroLabel}>Energía: </Text>
            <Text style={styles.macroValue}>
              {diet.totals.kcal} kcal
            </Text>
          </Text>

          <MacroBar
            label="Proteína"
            value={diet.totals.protein}
            color={COLORS.protein}
            total={totalMacros}
          />
          <MacroBar
            label="Carbohidratos"
            value={diet.totals.carbs}
            color={COLORS.carbs}
            total={totalMacros}
          />
          <MacroBar
            label="Grasas"
            value={diet.totals.fat}
            color={COLORS.fat}
            total={totalMacros}
          />
        </View>

        {/* NOTAS */}
        {diet.notes?.trim() && (
          <>
            <Text style={styles.sectionTitle}>
              Notas y recomendaciones
            </Text>
            <View style={styles.card}>
              <Text style={styles.notesText}>
                {diet.notes}
              </Text>
            </View>
          </>
        )}

        {/* COMIDAS */}
        <Text style={styles.sectionTitle}>
          Distribución de comidas
        </Text>

        {diet.meals
          .sort((a, b) => a.meal_index - b.meal_index)
          .map((meal) => {
            const mainItems = meal.items.filter(
              (i) => i.role === "main"
            );
            const substitutes = meal.items.filter(
              (i) => i.role === "substitute"
            );

            return (
              <View key={meal.id} style={styles.card}>
                <Text style={styles.mealTitle}>
                  Comida {meal.meal_index + 1}
                </Text>

                {mainItems.length === 0 ? (
                  <Text style={styles.emptyMeal}>
                    Sin alimentos asignados
                  </Text>
                ) : (
                  mainItems.map((item) => {
                    const subs = substitutes.filter(
                      (s) => s.parent_item_id === item.id
                    );

                    return (
                      <View key={item.id}>
                        <View style={styles.foodRow}>
                          <Text style={styles.foodName}>
                            {item.food.name}
                          </Text>
                          <Text style={styles.grams}>
                            {formatEggAmount(
                              item.food.name,
                              item.grams
                            )}
                          </Text>
                        </View>

                        {subs.map((sub) => (
                          <View
                            key={sub.id}
                            style={styles.substituteRow}
                          >
                            <Text
                              style={[
                                styles.foodName,
                                styles.substituteLabel,
                              ]}
                            >
                              - {sub.food.name}
                            </Text>
                            <Text
                              style={[
                                styles.grams,
                                styles.substituteLabel,
                              ]}
                            >
                              {formatEggAmount(
                                sub.food.name,
                                sub.grams
                              )}
                            </Text>
                          </View>
                        ))}
                      </View>
                    );
                  })
                )}

                {/* SUPLEMENTOS */}
                {meal.supplements?.length > 0 && (
                  <View style={styles.supplementBlock}>
                    <Text style={styles.supplementTitle}>
                      Suplementos
                    </Text>

                    {meal.supplements.map((s) => (
                      <View
                        key={s.id}
                        style={styles.supplementRow}
                      >
                        <Text>
                          {s.name}
                          {s.timing && ` (${s.timing})`}
                        </Text>
                        <Text>
                          {s.amount != null
                            ? `${s.amount} ${s.unit ?? ""}`
                            : ""}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

        <Text style={styles.footer}>
          Plan nutricional generado con JuanjoFitness
        </Text>
      </Page>
    </Document>
  );
}
