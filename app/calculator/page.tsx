import Link from "next/link";
import DietPlanner from "@/app/components/DietPlanner";

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-6">

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Calculadora de dieta
          </h1>
          <p className="text-sm text-white/60">
            Planificación por comidas
          </p>
        </div>

        <Link
          href="/home"
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          ← Volver al panel
        </Link>
      </header>

      <DietPlanner />

    </div>
  );
}
