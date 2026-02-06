// app/clients/[id]/diet/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getActiveDiet,
  getDietHistory,
  Diet,
} from "@/lib/dietsApi";

export default function ClientDietPage({
  params,
}: {
  params: { id: string };
}) {
  const clientId = params.id;

  const [activeDiet, setActiveDiet] = useState<Diet | null>(null);
  const [history, setHistory] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [active, hist] = await Promise.all([
          getActiveDiet(clientId),
          getDietHistory(clientId),
        ]);

        if (!mounted) return;

        setActiveDiet(active);
        setHistory(hist.filter((d) => d.id !== active?.id));
      } catch (e) {
        console.error(e);
        if (mounted) {
          setError("Error cargando las dietas");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]">
        <p className="text-white/60">Cargando dieta…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0B] via-[#0E1622] to-[#0B0B0B] px-6 py-10 space-y-10">

      {/* HEADER */}
      <header className="space-y-1">
        <Link
          href={`/clients/${clientId}`}
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          ← Volver al cliente
        </Link>

        <h1 className="text-3xl font-semibold text-white tracking-tight">
          Dietas
        </h1>

        <p className="text-sm text-white/50">
          Gestión del plan nutricional
        </p>
      </header>

      {/* =====================
          DIETA ACTIVA
      ====================== */}
      <section className="rounded-2xl border border-[var(--color-accent)]/40 bg-[#111]/80 backdrop-blur-xl shadow-xl p-6 space-y-4 max-w-3xl">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">
            🟢 Dieta activa
          </h2>

          <Link
            href={`/calculator?clientId=${clientId}`}
            className="text-sm bg-[var(--color-accent)] px-4 py-2 rounded-lg text-white font-medium hover:brightness-110 transition"
          >
            {activeDiet ? "Cambiar dieta" : "Crear dieta"}
          </Link>
        </div>

        {activeDiet ? (
          <div className="flex justify-between items-center gap-4">
            <div className="space-y-1">
              <p className="text-white font-medium">
                {activeDiet.name}
              </p>
              <p className="text-xs text-white/40">
                Creada el{" "}
                {new Date(activeDiet.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href={`/clients/${clientId}/diet/${activeDiet.id}`}
                className="text-sm text-[var(--color-accent)] hover:underline"
              >
                Ver →
              </Link>

              <Link
                href={`/calculator?clientId=${clientId}&cloneDietId=${activeDiet.id}`}
                className="text-sm text-white/70 hover:text-[var(--color-accent)] transition"
              >
                Duplicar
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/60">
            No hay ninguna dieta activa actualmente.
          </p>
        )}
      </section>

      {/* =====================
          HISTÓRICO
      ====================== */}
      <section className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl shadow-lg p-6 space-y-4 max-w-3xl">

        <h3 className="text-white font-medium text-lg">
          📚 Historial de dietas
        </h3>

        {history.length === 0 ? (
          <p className="text-sm text-white/50">
            No hay dietas anteriores.
          </p>
        ) : (
          <ul className="divide-y divide-white/10">
            {history.map((diet) => (
              <li
                key={diet.id}
                className="flex justify-between items-center py-3"
              >
                <div>
                  <p className="text-sm text-white/80">
                    {diet.name}
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(diet.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Link
                    href={`/clients/${clientId}/diet/${diet.id}`}
                    className="text-xs text-[var(--color-accent)] hover:underline"
                  >
                    Ver
                  </Link>

                  <Link
                    href={`/calculator?clientId=${clientId}&cloneDietId=${diet.id}`}
                    className="text-xs text-white/60 hover:text-[var(--color-accent)] transition"
                  >
                    Duplicar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
