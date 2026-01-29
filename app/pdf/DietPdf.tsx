import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { DietDetail } from "@/lib/dietsApi";

/* =========================
   COLORES CORPORATIVOS
========================= */
const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1E40AF",
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

  /* ---------- PORTADA ---------- */
  coverTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    marginBottom: 6,
  },

  coverSubtitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 20,
  },

  coverMeta: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 4,
  },

  divider: {
    height: 3,
    backgroundColor: COLORS.primary,
    marginVertical: 24,
  },

  /* ---------- SECCIONES ---------- */
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primaryDark,
    marginBottom: 12,
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    border: `1 solid ${COLORS.border}`,
  },

  /* ---------- RESUMEN ---------- */
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  macroLabel: {
    color: COLORS.muted,
  },

  macroValue: {
    fontFamily: "Helvetica-Bold",
  },

  /* ---------- COMIDAS ---------- */
  mealTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: COLORS.primary,
  },

  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  foodName: {
    maxWidth: "75%",
  },

  grams: {
    color: COLORS.muted,
  },

  /* ---------- NOTAS ---------- */
  notesText: {
    fontSize: 11,
    color: COLORS.text,
    lineHeight: 1.4,
    whiteSpace: "pre-wrap",
  },

  footer: {
    marginTop: 30,
    fontSize: 9,
    color: COLORS.muted,
    textAlign: "center",
  },
});

/* =========================
   PROPS
========================= */
type Props = {
  diet: DietDetail;
  clientName: string;
};

/* =========================
   PDF
========================= */
export default function DietPdf({
  diet,
  clientName,
}: Props) {
  /* =========================
     🔢 CÁLCULO DE TOTALES
  ========================= */
  const totals = diet.meals.reduce(
    (acc, meal) => {
      meal.items.forEach((item) => {
        const factor = item.grams / 100;
        acc.kcal += item.food.kcal_100 * factor;
        acc.protein += item.food.protein_100 * factor;
        acc.carbs += item.food.carbs_100 * factor;
        acc.fat += item.food.fat_100 * factor;
      });
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <Document>
      {/* ======================
          PORTADA + RESUMEN
      ====================== */}
      <Page style={styles.page}>
        <Text style={styles.coverTitle}>
          Plan Nutricional
        </Text>

        <Text style={styles.coverSubtitle}>
          {clientName}
        </Text>

        <Text style={styles.coverMeta}>
          Dieta: {diet.name}
        </Text>

        <Text style={styles.coverMeta}>
          Fecha: {new Date(diet.created_at).toLocaleDateString()}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>
          Resumen Nutricional
        </Text>

        <View style={styles.card}>
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>🔥 Energía</Text>
            <Text style={styles.macroValue}>
              {totals.kcal.toFixed(0)} kcal
            </Text>
          </View>

          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>🥩 Proteína</Text>
            <Text style={styles.macroValue}>
              {totals.protein.toFixed(1)} g
            </Text>
          </View>

          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>🍚 Carbohidratos</Text>
            <Text style={styles.macroValue}>
              {totals.carbs.toFixed(1)} g
            </Text>
          </View>

          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>🥑 Grasas</Text>
            <Text style={styles.macroValue}>
              {totals.fat.toFixed(1)} g
            </Text>
          </View>
        </View>

        {/* 📝 NOTAS */}
        {diet.notes && diet.notes.trim().length > 0 && (
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

        <Text style={styles.footer}>
          Plan generado automáticamente · Nutrición personalizada
        </Text>
      </Page>

      {/* ======================
          COMIDAS
      ====================== */}
      <Page style={styles.page}>
        <Text style={styles.sectionTitle}>
          Comidas
        </Text>

        {diet.meals
          .sort((a, b) => a.meal_index - b.meal_index)
          .map((meal) => (
            <View key={meal.id} style={styles.card}>
              <Text style={styles.mealTitle}>
                Comida {meal.meal_index + 1}
              </Text>

              {meal.items.map((item) => (
                <View key={item.id} style={styles.foodRow}>
                  <Text style={styles.foodName}>
                    {item.food.name}
                  </Text>
                  <Text style={styles.grams}>
                    {item.grams} g
                  </Text>
                </View>
              ))}
            </View>
          ))}
      </Page>
    </Document>
  );
}
