import { notFound } from "next/navigation";
import { getSharedDietByToken } from "@/lib/dietsApi";

export default async function SharedDietPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const sharedDiet = await getSharedDietByToken(token);

  if (!sharedDiet) {
    notFound();
  }

  const { diet } = sharedDiet;

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 text-white">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HEADER */}
        <header className="space-y-2 border-b border-white/10 pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            {diet.name}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <span>🔥 {diet.totals.kcal} kcal</span>
            <span>🥩 {diet.totals.protein} g proteína</span>
            <span>🍚 {diet.totals.carbs} g hidratos</span>
            <span>🥑 {diet.totals.fat} g grasas</span>
          </div>
        </header>

        {/* MEALS */}
        <section className="space-y-6">
          {diet.meals
            .sort((a, b) => a.meal_index - b.meal_index)
            .map((meal) => (
              <div
                key={meal.id}
                className="rounded-xl border border-white/10 bg-[#111] p-5 space-y-4"
              >
                <h2 className="text-lg font-medium">
                  🍽️ Comida {meal.meal_index + 1}
                </h2>

                <ul className="space-y-2 text-sm text-white/80">
                  {meal.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between gap-3"
                    >
                      <span>{item.food.name}</span>
                      <span className="text-white/60">
                        {item.grams} g
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </section>

        {/* FOOTER */}
        <footer className="pt-8 text-center text-xs text-white/40">
          Plan nutricional generado con JuanjoFitness
        </footer>

      </div>
    </div>
  );
}
