import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-6">

      <header>
        <h1 className="text-2xl font-semibold text-white">
          Panel de control
        </h1>
        <p className="text-sm text-white/60">
          Juanjo Fitness · Gestión interna
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/calculator" className="card text-center">
          <p className="text-lg font-medium text-white">Calculadora</p>
          <p className="text-sm text-white/60">Planificar dieta</p>
        </Link>

        <Link href="/clients/new" className="card text-center">
          <p className="text-lg font-medium text-white">Crear cliente</p>
          <p className="text-sm text-white/60">Nuevo seguimiento</p>
        </Link>

        <Link href="/clients" className="card text-center">
          <p className="text-lg font-medium text-white">Ver clientes</p>
          <p className="text-sm text-white/60">Gestionar actuales</p>
        </Link>
      </section>

      <section className="card">
        <p className="text-sm text-white/60">Total de clientes</p>
        <p className="text-3xl font-semibold text-white">12</p>
      </section>

    </div>
  );
}
