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
  // ✅ Resolver params correctamente
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

        // 👉 Excluir la dieta activa del histórico
        setHistory(
          hist.filter((d) => d.id !== active?.id)
        );
      } catch (e) {
        console.error(e);
        if (mounted) {
          setError("Error cargando el cliente");
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
    return <p className="text-white p-6">Cargando cliente…</p>;
  }

  if (error) {
    return (
      <p className="text-red-400 p-6">
        {error}
      </p>
    );
  }

  if (!client) {
    return <p className="text-white p-6">Cliente no encontrado</p>;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-8">

      {/* HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            {client.name}
          </h1>

          {client.email && (
            <p className="text-white/60 text-sm">
              {client.email}
            </p>
          )}

          {client.phone && (
            <p className="text-white/40 text-xs">
              📲 {client.phone}
            </p>
          )}
        </div>

        <Link
          href="/clients"
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          ← Volver a clientes
        </Link>
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
              <p className="text-white">
                {activeDiet.name}
              </p>
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
            Este cliente no tiene una dieta activa.
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
      <section className="card space-y-4">
        <h2 className="text-white font-medium text-lg">
          Historial de dietas
        </h2>

        {history.length === 0 ? (
          <p className="text-white/60 text-sm">
            No hay dietas anteriores.
          </p>
        ) : (
          <ul className="space-y-2">
            {history.map((diet) => (
              <li
                key={diet.id}
                className="flex justify-between items-center border-b border-white/10 pb-2"
              >
                <div>
                  <p className="text-white text-sm">
                    {diet.name}
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(diet.created_at).toLocaleDateString()}
                  </p>
                </div>

                <Link
                  href={`/clients/${clientId}/diet/${diet.id}`}
                  className="text-xs text-[var(--color-accent)]"
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
