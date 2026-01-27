import FoodCalculator from "@/app/components/FoodCalculator";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-10">

      <header>
        <h1 className="text-2xl font-semibold text-white">
          Panel de control
        </h1>
        <p className="text-sm text-white/60">
          Juanjo Fitness · Macros & Clientes
        </p>
      </header>

      <FoodCalculator />

      {/* Acciones rápidas y clientes recientes siguen aquí */}
    </div>
  );
}
