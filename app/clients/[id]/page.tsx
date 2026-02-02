"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getClient, Client } from "@/lib/clientsApi";
import {
  getActiveDiet,
  getDietHistory,
  Diet,
} from "@/lib/dietsApi";

type Props = {
  params: Promise<{ id: string }>;
};

export default function ClientPage({ params }: Props) {
  const { id: clientId } = use(params);

  const [client, setClient] = useState<Client | null>(null);
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

        const [c, active, hist] = await Promise.all([
          getClient(clientId),
          getActiveDiet(clientId),
          getDietHistory(clientId),
        ]);

        if (!mounted) return;

        setClient(c);
        setActiveDiet(active);
        setHistory(hist.filter((d) => d.id !== active?.id));
      } catch (e) {
        console.error(e);
        if (mounted) setError("Error cargando el cliente");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [clientId]);

  if (loading) {
    return <p className="text-white p-6">Cargando cliente…</p>;
  }

  if (error) {
    return <p className="text-red-400 p-6">{error}</p>;
  }

  if (!client) {
    return <p className="text-white p-6">Cliente no encontrado</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0B] via-[#0E1622] to-[#0B0B0B] px-6 py-10 space-y-10">

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {client.name}
          </h1>

          {client.email && (
            <p className="text-sm text-white/60">
              {client.email}
            </p>
          )}

          {client.phone && (
            <p className="text-xs text-white/40">
              📲 {client.phone}
            </p>
          )}
        </div>

        <div className="flex flex-row sm:flex-col gap-3 sm:items-end">
          <Link
            href={`/clients/${clientId}/edit`}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm
                       hover:bg-white/20 transition"
          >
            Editar cliente
          </Link>

          <Link
            href="/clients"
            className="text-xs text-[var(--color-accent)] hover:underline"
          >
            ← Volver a clientes
          </Link>
        </div>
      </header>

      {/* NOTAS CLIENTE */}
      {client.notes?.trim() && (
        <section className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl p-6 shadow-xl space-y-2">
          <h2 className="text-lg font-medium text-white">
            📝 Notas del cliente
          </h2>

          <p className="text-sm text-white/80 whitespace-pre-line">
            {client.notes}
          </p>
        </section>
      )}

      {/* DIETA ACTIVA */}
      <section className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-medium text-white">
          Dieta actual
        </h2>

        {activeDiet ? (
          <div className="flex justify-between items-center gap-4">
            <div>
              <p className="text-white font-medium">
                {activeDiet.name}
              </p>
              <p className="text-xs text-white/40">
                Creada el{" "}
                {new Date(activeDiet.created_at).toLocaleDateString()}
              </p>
            </div>

            <Link
              href={`/clients/${clientId}/diet/${activeDiet.id}`}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Ver dieta →
            </Link>
          </div>
        ) : (
          <p className="text-sm text-white/50">
            Este cliente no tiene una dieta activa.
          </p>
        )}

        <Link
          href={`/calculator?clientId=${clientId}`}
          className="inline-flex items-center justify-center mt-2 rounded-lg
                     bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white
                     transition hover:brightness-110"
        >
          {activeDiet ? "Cambiar dieta" : "Crear dieta"}
        </Link>
      </section>

      {/* HISTÓRICO */}
      <section className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-medium text-white">
          Historial de dietas
        </h2>

        {history.length === 0 ? (
          <p className="text-sm text-white/50">
            No hay dietas anteriores.
          </p>
        ) : (
          <ul className="space-y-3">
            {history.map((diet) => (
              <li
                key={diet.id}
                className="flex justify-between items-center border-b border-white/10 pb-3 last:border-none"
              >
                <div>
                  <p className="text-sm text-white">
                    {diet.name}
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(diet.created_at).toLocaleDateString()}
                  </p>
                </div>

                <Link
                  href={`/clients/${clientId}/diet/${diet.id}`}
                  className="text-xs text-[var(--color-accent)] hover:underline"
                >
                  Ver →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
