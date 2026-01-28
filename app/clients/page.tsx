"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ClientWithDiet,
  getClientsWithCurrentDiet,
} from "@/lib/clientsApi";

type Filter = "all" | "withDiet" | "noDiet";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithDiet[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  /* ======================
     LOAD DATA
  ====================== */
  useEffect(() => {
    getClientsWithCurrentDiet()
      .then(setClients)
      .finally(() => setLoading(false));
  }, []);

  /* ======================
     FILTERED LIST
  ====================== */
  const filteredClients = useMemo(() => {
    return clients
      .filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
      .filter((c) => {
        if (filter === "withDiet") return c.currentDiet;
        if (filter === "noDiet") return !c.currentDiet;
        return true;
      });
  }, [clients, search, filter]);

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-10">

      {/* HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Clientes
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Gestión y seguimiento nutricional
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/home"
            className="px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-white/5 transition"
          >
            ← Volver al menú
          </Link>

          <Link
            href="/clients/new"
            className="bg-[var(--color-accent)] px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition"
          >
            + Nuevo cliente
          </Link>
        </div>
      </header>

      {/* SEARCH + FILTERS */}
      <section className="card flex flex-col md:flex-row gap-4">
        <input
          placeholder="Buscar cliente por nombre…"
          className="input flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2">
          {[
            { id: "all", label: "Todos" },
            { id: "withDiet", label: "Con dieta" },
            { id: "noDiet", label: "Sin dieta" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as Filter)}
              className={`px-4 py-2 rounded-lg text-sm transition
                ${
                  filter === f.id
                    ? "bg-[var(--color-accent)] text-white"
                    : "border border-white/20 text-white/70 hover:bg-white/5"
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* STATES */}
      {loading && (
        <p className="text-white/60">
          Cargando clientes…
        </p>
      )}

      {!loading && filteredClients.length === 0 && (
        <p className="text-white/60">
          No hay clientes que coincidan con el filtro.
        </p>
      )}

      {/* GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="group card space-y-5 hover:border-[var(--color-accent)] transition"
          >
            {/* NAME */}
            <div>
              <h3 className="text-xl font-medium text-white">
                {client.name}
              </h3>

              {client.email && (
                <p className="text-sm text-white/50 mt-1">
                  {client.email}
                </p>
              )}
            </div>

            {/* DIET INFO */}
            {client.currentDiet ? (
              <div className="space-y-2">
                <span className="inline-block text-xs px-3 py-1 rounded-full bg-white/10 text-white/70">
                  🥗 {client.currentDiet.name}
                </span>

                {client.currentDiet.totals && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                    <p>🔥 {client.currentDiet.totals.kcal} kcal</p>
                    <p>🥩 {client.currentDiet.totals.protein} g</p>
                    <p>🍚 {client.currentDiet.totals.carbs} g</p>
                    <p>🥑 {client.currentDiet.totals.fat} g</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/40">
                ❌ Sin dieta asignada
              </p>
            )}

            {/* FOOTER */}
            <p className="text-xs text-white/30 border-t border-white/10 pt-3">
              Cliente desde{" "}
              {new Date(client.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
