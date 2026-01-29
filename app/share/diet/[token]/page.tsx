import { notFound } from "next/navigation";
import { getSharedDietByToken } from "@/lib/dietsApi";

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
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* HEADER */}
        <header className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {diet.name}
          </h1>

          {/* Totales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Energía" value={`${diet.totals.kcal} kcal`} />
            <Stat label="Proteína" value={`${diet.totals.protein} g`} />
            <Stat label="Carbohidratos" value={`${diet.totals.carbs} g`} />
            <Stat label="Grasas" value={`${diet.totals.fat} g`} />
          </div>
        </header>

        {/* NOTAS */}
        {diet.notes?.trim() && (
          <section className="rounded-2xl border border-white/10 bg-[#111] p-5 space-y-3">
            <h2 className="text-base font-medium flex items-center gap-2">
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
            .map((meal) => (
              <div
                key={meal.id}
                className="rounded-2xl border border-white/10 bg-[#111] p-5 space-y-4"
              >
                <h2 className="text-base font-medium flex items-center gap-2">
                  🍽️ Comida {meal.meal_index + 1}
                </h2>

                <ul className="divide-y divide-white/10 text-sm">
                  {meal.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-center py-2"
                    >
                      <span className="text-white/85">
                        {item.food.name}
                      </span>
                      <span className="text-white/50 text-xs">
                        {item.grams} g
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </section>

        {/* FOOTER */}
        <footer className="pt-6 text-center text-[11px] text-white/40">
          Plan nutricional generado con JuanjoFitness
        </footer>
      </div>
    </div>
  );
}

/* =========================
   COMPONENTE STAT
========================= */
function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111] px-4 py-3">
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
