// app/clients/page.tsx
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
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  /* ======================
     LOAD DATA
  ====================== */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getClientsWithCurrentDiet();
        if (mounted) setClients(data);
      } catch (e) {
        console.error(e);
        if (mounted) setError("Error cargando los clientes");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  /* ======================
     FILTERED LIST
  ====================== */
  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();

    return clients
      .filter((c) =>
        q ? c.name.toLowerCase().includes(q) : true
      )
      .filter((c) => {
        if (filter === "withDiet") return Boolean(c.currentDiet);
        if (filter === "noDiet") return !c.currentDiet;
        return true;
      });
  }, [clients, search, filter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0B] via-[#0E1622] to-[#0B0B0B] px-6 py-10 space-y-10">

      {/* HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Clientes
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Gestión y seguimiento nutricional
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/home"
            className="px-4 py-2 rounded-lg border border-white/20 text-white/70 text-sm
                       hover:bg-white/5 transition"
          >
            ← Volver
          </Link>

          <Link
            href="/clients/new"
            className="px-5 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium
                       transition hover:brightness-110"
          >
            + Nuevo cliente
          </Link>
        </div>
      </header>

      {/* SEARCH + FILTERS */}
      <section className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl p-5 flex flex-col md:flex-row gap-4 shadow-xl">
        <input
          placeholder="Buscar cliente por nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg bg-[#0B0B0B] border border-white/10 px-3 py-2 text-white
                     placeholder:text-white/30 focus:outline-none focus:border-[var(--color-accent)]
                     focus:ring-1 focus:ring-[var(--color-accent)]"
        />

        <div className="flex gap-2 flex-wrap">
          {[
            { id: "all", label: "Todos" },
            { id: "withDiet", label: "Con dieta" },
            { id: "noDiet", label: "Sin dieta" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as Filter)}
              className={`px-4 py-2 rounded-full text-sm transition
                ${
                  filter === f.id
                    ? "bg-[var(--color-accent)] text-white"
                    : "border border-white/20 text-white/70 hover:bg-white/5"
                }`}
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

      {error && (
        <p className="text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && filteredClients.length === 0 && (
        <p className="text-white/50">
          No hay clientes que coincidan con el filtro.
        </p>
      )}

      {/* GRID */}
      {!loading && !error && filteredClients.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="group rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl
                         p-6 space-y-5 shadow-lg transition
                         hover:border-[var(--color-accent)] hover:shadow-[0_0_0_1px_var(--color-accent)]"
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
                  <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full
                                   bg-[rgba(30,144,255,0.15)] text-[var(--color-accent)]">
                    🥗 {client.currentDiet.name}
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                    <p>🔥 {client.currentDiet.totals.kcal} kcal</p>
                    <p>🥩 {client.currentDiet.totals.protein} g</p>
                    <p>🍚 {client.currentDiet.totals.carbs} g</p>
                    <p>🥑 {client.currentDiet.totals.fat} g</p>
                  </div>
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
      )}
    </div>
  );
}
