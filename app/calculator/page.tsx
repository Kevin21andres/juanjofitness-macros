import { Suspense } from "react";
import CalculatorClient from "./CalculatorClient";

export default function CalculatorPage() {
  return (
    <Suspense fallback={<CalculatorLoading />}>
      <CalculatorClient />
    </Suspense>
  );
}

function CalculatorLoading() {
  return (
    <div
      className="min-h-screen bg-[#0B0B0B] flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <p className="text-white text-sm animate-pulse">
        ⏳ Cargando calculadora…
      </p>
    </div>
  );
}
