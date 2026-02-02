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
  accent: "#1E90FF",
  accentDark: "#1E3A8A",
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

  /* ---------- HERO ---------- */
  hero: {
    backgroundColor: COLORS.accent,
    padding: 24,
    borderRadius: 14,
    marginBottom: 28,
  },

  heroTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  heroSubtitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#E0F2FE",
  },

  heroMeta: {
    fontSize: 10,
    color: "#DBEAFE",
    marginTop: 6,
  },

  /* ---------- SECCIONES ---------- */
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accentDark,
    marginBottom: 12,
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    border: `1 solid ${COLORS.border}`,
  },

  /* ---------- RESUMEN ---------- */
  macroGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  macroBox: {
    width: "48%",
    padding: 10,
    borderRadius: 8,
    border: `1 solid ${COLORS.border}`,
    marginBottom: 8,
  },

  macroLabel: {
    fontSize: 10,
    color: COLORS.muted,
    marginBottom: 2,
  },

  macroValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accent,
  },

  /* ---------- COMIDAS ---------- */
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
    maxWidth: "75%",
  },

  grams: {
    color: COLORS.muted,
  },

  /* ---------- NOTAS ---------- */
  notesText: {
    fontSize: 11,
    color: COLORS.text,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
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
  diet: DietDetail;
  clientName: string;
};

/* =========================
   PDF
========================= */
export default function DietPdf({ diet, clientName }: Props) {
  /* =========================
     🔢 TOTALES
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
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Plan Nutricional
          </Text>

          <Text style={styles.heroSubtitle}>
            {clientName}
          </Text>

          <Text style={styles.heroMeta}>
            Dieta: {diet.name}
          </Text>

          <Text style={styles.heroMeta}>
            Fecha:{" "}
            {new Date(diet.created_at).toLocaleDateString()}
          </Text>
        </View>

        {/* RESUMEN */}
        <Text style={styles.sectionTitle}>
          Resumen nutricional diario
        </Text>

        <View style={styles.card}>
          <View style={styles.macroGrid}>
            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>
                Energía
              </Text>
              <Text style={styles.macroValue}>
                {totals.kcal.toFixed(0)} kcal
              </Text>
            </View>

            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>
                Proteína
              </Text>
              <Text style={styles.macroValue}>
                {totals.protein.toFixed(1)} g
              </Text>
            </View>
          </View>

          <View style={styles.macroGrid}>
            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>
                Carbohidratos
              </Text>
              <Text style={styles.macroValue}>
                {totals.carbs.toFixed(1)} g
              </Text>
            </View>

            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>
                Grasas
              </Text>
              <Text style={styles.macroValue}>
                {totals.fat.toFixed(1)} g
              </Text>
            </View>
          </View>
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

        <Text style={styles.footer}>
          Plan nutricional generado con JuanjoFitness
        </Text>
      </Page>

      {/* ======================
          COMIDAS
      ====================== */}
      <Page style={styles.page}>
        <Text style={styles.sectionTitle}>
          Distribución de comidas
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
