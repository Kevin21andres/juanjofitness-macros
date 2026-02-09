// app/share/diet/[token]/page.tsx
import { notFound } from "next/navigation";
import { getSharedDietByToken } from "@/lib/dietsApi";
import { formatEggAmount } from "@/lib/formatEggAmount";

export default async function SharedDietPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const sharedDiet = await getSharedDietByToken(token);
  if (!sharedDiet) notFound();

  const { diet } = sharedDiet;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0B] via-[#0E1622] to-[#0B0B0B] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* HERO */}
        <header className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {diet.name}
            </h1>

            <a
              href={`/api/diets/shared/${token}/pdf`}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:brightness-110 transition"
            >
              📄 Descargar PDF
            </a>

            <p className="text-sm text-white/50">
              Plan nutricional personalizado
            </p>
          </div>

          {/* TOTALES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Energía" value={`${diet.totals.kcal} kcal`} />
            <Stat label="Proteína" value={`${diet.totals.protein} g`} />
            <Stat label="Carbohidratos" value={`${diet.totals.carbs} g`} />
            <Stat label="Grasas" value={`${diet.totals.fat} g`} />
          </div>
        </header>

        {/* NOTAS */}
        {diet.notes?.trim() && (
          <section className="rounded-2xl border border-[var(--color-accent)]/30 bg-[#111]/80 backdrop-blur-xl shadow-lg p-6 space-y-3">
            <h2 className="text-sm font-medium flex items-center gap-2 text-[var(--color-accent)]">
              📝 Notas y recomendaciones
            </h2>

            <p className="whitespace-pre-line text-sm text-white/80 leading-relaxed">
              {diet.notes}
            </p>
          </section>
        )}

        {/* COMIDAS */}
        <section className="space-y-6">
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
                <div
                  key={meal.id}
                  className="rounded-2xl border border-white/10 bg-[#111]/80 backdrop-blur-xl shadow-lg p-6 space-y-4"
                >
                  <h2 className="text-sm font-medium flex items-center gap-2 text-[var(--color-accent)]">
                    🍽️ Comida {meal.meal_index + 1}
                  </h2>

                  {/* ALIMENTOS */}
                  {mainItems.length === 0 ? (
                    <p className="text-white/40 italic">
                      Sin alimentos asignados
                    </p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {mainItems.map((item) => {
                        const subs = substitutes.filter(
                          (s) =>
                            s.parent_item_id === item.id
                        );

                        return (
                          <li key={item.id}>
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                              <span className="text-white/90">
                                {item.food.name}
                              </span>
                              <span className="text-white/50 text-xs">
                                {formatEggAmount(
                                  item.food.name,
                                  item.grams
                                )}
                              </span>
                            </div>

                            {subs.length > 0 && (
                              <ul className="mt-1 ml-4 space-y-1">
                                {subs.map((sub) => (
                                  <li
                                    key={sub.id}
                                    className="flex justify-between items-center text-xs text-white/60 italic"
                                  >
                                    <span>
                                      ↳ {sub.food.name}
                                    </span>
                                    <span>
                                      {formatEggAmount(
                                        sub.food.name,
                                        sub.grams
                                      )}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* SUPLEMENTACIÓN */}
                  {meal.supplements?.length > 0 && (
                    <div className="pt-4 border-t border-white/10 space-y-2">
                      <p className="text-xs font-semibold text-white/60">
                        💊 Suplementación
                      </p>

                      <ul className="space-y-1 text-sm">
                        {meal.supplements.map((s) => (
                          <li
                            key={s.id}
                            className="flex justify-between items-center text-white/80"
                          >
                            <span>{s.name}</span>
                            <span className="text-white/50 text-xs">
                              {s.amount}
                              {s.unit ? ` ${s.unit}` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
        </section>

        {/* FOOTER */}
        <footer className="pt-6 text-center text-xs text-white/40">
          Plan nutricional generado con{" "}
          <span className="text-[var(--color-accent)] font-medium">
            JuanjoFitness
          </span>
        </footer>
      </div>
    </div>
  );
}

/* =========================
   STAT
========================= */
function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111]/80 backdrop-blur-xl px-4 py-3 shadow">
      <p className="text-[11px] uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p className="text-sm font-semibold text-[var(--color-accent)]">
        {value}
      </p>
    </div>
  );
}
