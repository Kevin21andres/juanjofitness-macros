"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClientWithDiet,
  getClientsWithCurrentDiet,
} from "@/lib/clientsApi";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithDiet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientsWithCurrentDiet()
      .then(setClients)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-6">

      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">
          Clientes
        </h1>

        <Link
          href="/clients/new"
          className="bg-[var(--color-accent)] px-4 py-2 rounded-lg text-white text-sm"
        >
          + Nuevo cliente
        </Link>
      </header>

      {loading && (
        <p className="text-white/60">Cargando clientes…</p>
      )}

      {!loading && clients.length === 0 && (
        <p className="text-white/60">No hay clientes todavía.</p>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="card hover:border-[var(--color-accent)] transition space-y-2"
          >
            <h3 className="text-white font-medium">
              {client.name}
            </h3>

            {client.email && (
              <p className="text-sm text-white/60">
                {client.email}
              </p>
            )}

            {client.currentDiet ? (
              <p className="text-sm text-white/70">
                🥗 Dieta actual:
                <br />
                <span className="text-white">
                  {client.currentDiet.name}
                </span>
              </p>
            ) : (
              <p className="text-sm text-white/40">
                ❌ Sin dieta asignada
              </p>
            )}

            <p className="text-xs text-white/40">
              Cliente desde{" "}
              {new Date(client.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </section>

    </div>
  );
}
