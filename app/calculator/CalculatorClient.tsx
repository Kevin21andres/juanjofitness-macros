"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DietPlanner from "@/app/components/DietPlanner";
import SaveDietModal from "@/app/components/SaveDietModal";
import {
  getClientsWithCurrentDiet,
  ClientWithDiet,
} from "@/lib/clientsApi";
import { getDietDetail, DietDetail } from "@/lib/dietsApi";

export default function CalculatorClient() {
  const searchParams = useSearchParams();
  const clientIdFromUrl = searchParams.get("clientId");

  const [clients, setClients] = useState<ClientWithDiet[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedClient, setSelectedClient] =
    useState<ClientWithDiet | null>(null);
  const [query, setQuery] = useState("");

  const [savedDietId, setSavedDietId] = useState<string | null>(null);
  const [savedDiet, setSavedDiet] = useState<DietDetail | null>(null);
  const [loadingDiet, setLoadingDiet] = useState(false);

  /* =========================
     CARGAR CLIENTES
  ========================= */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoadingClients(true);
        setError(null);

        const data = await getClientsWithCurrentDiet();
        if (!mounted) return;

        setClients(data);
        setLoadingClients(false);

        if (clientIdFromUrl) {
          const c = data.find((c) => c.id === clientIdFromUrl);
          if (c) {
            setSelectedClient(c);
            setQuery(c.name);
          }
        }
      } catch (e) {
        console.error(e);
        if (mounted) {
          setError("Error cargando clientes");
          setLoadingClients(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [clientIdFromUrl]);

  /* =========================
     CARGAR DIETA TRAS GUARDAR
  ========================= */
  useEffect(() => {
    if (!savedDietId) return;

    let mounted = true;
    setLoadingDiet(true);

    getDietDetail(savedDietId)
      .then((diet) => {
        if (mounted) setSavedDiet(diet);
      })
      .finally(() => {
        if (mounted) setLoadingDiet(false);
      });

    return () => {
      mounted = false;
    };
  }, [savedDietId]);

  /* =========================
     FILTRADO CLIENTES
  ========================= */
  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;

    return clients.filter((c) =>
      c.name.toLowerCase().includes(q)
    );
  }, [clients, query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0B] via-[#0E1622] to-[#0B0B0B] px-6 py-10 space-y-10">

      {/* HEADER / HERO */}
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Calculadora de dieta
          </h1>
          <p className="text-sm text-white/50">
            Planificación nutricional por comidas
          </p>
        </div>

        <Link
          href="/home"
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          ← Volver al panel
        </Link>
      </header>

      {/* SELECCIÓN DE CLIENTE */}
      <section className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl shadow-xl p-6 space-y-4 max-w-2xl">

        <h2 className="text-white font-medium text-lg">
          👤 Seleccionar cliente
        </h2>

        <input
          className="w-full rounded-lg bg-[#0B0B0B] border border-white/10 px-3 py-2 text-white placeholder:text-white/30
                     focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
          placeholder="Buscar cliente…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedClient(null);
            setSavedDiet(null);
            setSavedDietId(null);
          }}
          disabled={loadingClients}
        />

        <div className="max-h-52 overflow-auto rounded-lg border border-white/10 bg-[#0B0B0B]">
          {loadingClients && (
            <p className="px-4 py-2 text-sm text-white/40">
              Cargando clientes…
            </p>
          )}

          {error && (
            <p className="px-4 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {!loadingClients &&
            !error &&
            filteredClients.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => {
                  setSelectedClient(client);
                  setQuery(client.name);
                  setSavedDiet(null);
                  setSavedDietId(null);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition
                  ${
                    selectedClient?.id === client.id
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-white/80 hover:bg-white/5"
                  }
                `}
              >
                {client.name}
              </button>
            ))}

          {!loadingClients &&
            !error &&
            filteredClients.length === 0 && (
              <p className="px-4 py-2 text-sm text-white/40">
                Sin resultados
              </p>
            )}
        </div>
      </section>

      {/* CALCULADORA */}
      {selectedClient && !savedDietId && (
        <DietPlanner
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          onSaved={(dietId) => setSavedDietId(dietId)}
        />
      )}

      {/* MODAL GUARDADO */}
      {savedDiet && selectedClient && (
        <SaveDietModal
          clientName={selectedClient.name}
          diet={savedDiet}
          clientEmail={selectedClient.email}
          clientPhone={selectedClient.phone}
          onClose={() => {
            setSavedDiet(null);
            setSavedDietId(null);
          }}
        />
      )}

      {/* LOADING OVERLAY */}
      {loadingDiet && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-xl border border-white/10 bg-[#111]/80 px-6 py-4 shadow-xl">
            <p className="text-sm text-white">
              ⏳ Preparando resumen de la dieta…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
