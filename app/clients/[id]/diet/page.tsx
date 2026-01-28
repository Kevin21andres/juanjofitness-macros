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

  useEffect(() => {
    const load = async () => {
      const active = await getActiveDiet(clientId);
      const hist = await getDietHistory(clientId);
      setActiveDiet(active);
      setHistory(hist);
      setLoading(false);
    };

    load();
  }, [clientId]);

  if (loading) {
    return <p className="text-white p-6">Cargando dieta…</p>;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-8">

      {/* HEADER */}
      <header>
        <Link
          href={`/clients/${clientId}`}
          className="text-sm text-[var(--color-accent)]"
        >
          ← Volver al cliente
        </Link>

        <h1 className="text-2xl font-semibold text-white mt-2">
          Dieta
        </h1>
      </header>

      {/* =====================
          DIETA ACTIVA
      ====================== */}
      <section className="card space-y-3">
        <h2 className="text-white font-medium text-lg">
          Dieta actual
        </h2>

        {activeDiet ? (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white">{activeDiet.name}</p>
              <p className="text-xs text-white/40">
                Creada el{" "}
                {new Date(activeDiet.created_at).toLocaleDateString()}
              </p>
            </div>

            <Link
              href={`/clients/${clientId}/diet/${activeDiet.id}`}
              className="text-sm text-[var(--color-accent)]"
            >
              Ver dieta →
            </Link>
          </div>
        ) : (
          <p className="text-white/60 text-sm">
            No hay dieta activa.
          </p>
        )}

        <Link
          href={`/calculator?clientId=${clientId}`}
          className="inline-block mt-2 bg-[var(--color-accent)] px-4 py-2 rounded-lg text-white text-sm"
        >
          {activeDiet ? "Cambiar dieta" : "Crear dieta"}
        </Link>
      </section>

      {/* =====================
          HISTÓRICO
      ====================== */}
      {history.length > 0 && (
        <section className="card space-y-3">
          <h3 className="text-white font-medium">
            Historial de dietas
          </h3>

          <ul className="space-y-2">
            {history.map((diet) => (
              <li
                key={diet.id}
                className="flex justify-between items-center"
              >
                <span className="text-sm text-white/80">
                  {diet.name}
                </span>

                <Link
                  href={`/clients/${clientId}/diet/${diet.id}`}
                  className="text-xs text-[var(--color-accent)]"
                >
                  Ver →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
