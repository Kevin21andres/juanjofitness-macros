import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-8">

      {/* HEADER / HERO */}
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-white">
          Panel de control
        </h1>
        <p className="text-sm text-white/60">
          Juanjo Fitness · Gestión interna
        </p>
      </header>

      {/* ACCIONES PRINCIPALES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Link
          href="/calculator"
          className="card group flex flex-col items-center justify-center text-center hover:border-[var(--color-accent)] transition"
        >
          <span className="text-3xl mb-2">🍽️</span>
          <p className="text-lg font-medium text-white">
            Calculadora de dieta
          </p>
          <p className="text-sm text-white/60">
            Planificar comidas y macros
          </p>
        </Link>

        <Link
          href="/clients/new"
          className="card group flex flex-col items-center justify-center text-center hover:border-[var(--color-accent)] transition"
        >
          <span className="text-3xl mb-2">➕</span>
          <p className="text-lg font-medium text-white">
            Crear cliente
          </p>
          <p className="text-sm text-white/60">
            Nuevo seguimiento
          </p>
        </Link>

        <Link
          href="/clients"
          className="card group flex flex-col items-center justify-center text-center hover:border-[var(--color-accent)] transition"
        >
          <span className="text-3xl mb-2">👥</span>
          <p className="text-lg font-medium text-white">
            Ver clientes
          </p>
          <p className="text-sm text-white/60">
            Gestionar actuales
          </p>
        </Link>

      </section>

      {/* MÉTRICAS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <div className="card">
          <p className="text-sm text-white/60">
            Clientes activos
          </p>
          <p className="text-3xl font-semibold text-white mt-1">
            12
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-white/60">
            Dietas creadas
          </p>
          <p className="text-3xl font-semibold text-white mt-1">
            28
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-white/60">
            Última actividad
          </p>
          <p className="text-sm text-white mt-2">
            Hoy
          </p>
        </div>

      </section>

    </div>
  );
}
