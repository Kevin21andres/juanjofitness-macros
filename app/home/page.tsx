export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-8">

      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-white">
          Panel de control
        </h1>
        <p className="text-white/60 text-sm">
          Juanjo Fitness · Macros & Clientes
        </p>
      </header>

      {/* Calculadora rápida */}
      <section className="bg-[#111111] rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-medium text-white mb-4">
          Calculadora rápida
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <input className="input" placeholder="Peso (kg)" />
          <input className="input" placeholder="Altura (cm)" />
        </div>

        <button className="mt-4 bg-[var(--color-accent)] px-4 py-2 rounded-lg text-white">
          Calcular macros
        </button>
      </section>

      {/* Acciones */}
      <section className="flex gap-4">
        <button className="flex-1 bg-[var(--color-accent)] py-3 rounded-xl text-white font-medium">
          + Nuevo cliente
        </button>
        <button className="flex-1 bg-[#111111] py-3 rounded-xl text-white border border-white/10">
          Ver clientes
        </button>
      </section>

      {/* Clientes recientes */}
      <section>
        <h2 className="text-lg font-medium text-white mb-3">
          Clientes recientes
        </h2>

        <div className="space-y-3">
          <div className="card">
            <p className="text-white font-medium">Carlos Pérez</p>
            <p className="text-white/60 text-sm">Definición</p>
          </div>
        </div>
      </section>

    </div>
  );
}
