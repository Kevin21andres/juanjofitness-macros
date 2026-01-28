"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DietPlanner from "@/app/components/DietPlanner";
import SaveDietModal from "@/app/components/SaveDietModal";
import { getClients } from "@/lib/clientsApi";
import { getDietDetail, DietDetail } from "@/lib/dietsApi";

type Client = {
  id: string;
  name: string;
};

export default function CalculatorPage() {
  const searchParams = useSearchParams();
  const clientIdFromUrl = searchParams.get("clientId");

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [query, setQuery] = useState("");

  const [savedDietId, setSavedDietId] = useState<string | null>(null);
  const [savedDiet, setSavedDiet] = useState<DietDetail | null>(null);
  const [loadingDiet, setLoadingDiet] = useState(false);

  /* =========================
     CARGAR CLIENTES
  ========================= */
  useEffect(() => {
    let mounted = true;

    getClients().then((data) => {
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
    });

    return () => {
      mounted = false;
    };
  }, [clientIdFromUrl]);

  /* =========================
     CARGAR DIETA TRAS GUARDAR
  ========================= */
  useEffect(() => {
    if (!savedDietId) return;

    setLoadingDiet(true);

    getDietDetail(savedDietId)
      .then(setSavedDiet)
      .finally(() => setLoadingDiet(false));
  }, [savedDietId]);

  const filteredClients = useMemo(
    () =>
      clients.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      ),
    [clients, query]
  );

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-8">

      {/* HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Calculadora de dieta
          </h1>
          <p className="text-sm text-white/60">
            Planificación por comidas
          </p>
        </div>

        <Link
          href="/home"
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          ← Volver al panel
        </Link>
      </header>

      {/* CLIENTE */}
      <section className="card space-y-3">
        <label className="text-sm text-white/70">
          Cliente
        </label>

        <input
          className="input"
          placeholder="Buscar cliente…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loadingClients}
        />

        <div className="max-h-48 overflow-auto border border-white/10 rounded-lg">
          {loadingClients && (
            <p className="px-4 py-2 text-sm text-white/40">
              Cargando clientes…
            </p>
          )}

          {!loadingClients && filteredClients.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => {
                setSelectedClient(client);
                setQuery(client.name);
              }}
              className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/5"
            >
              {client.name}
            </button>
          ))}

          {!loadingClients && filteredClients.length === 0 && (
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

      {/* MODAL POST-GUARDADO */}
      {savedDiet && selectedClient && (
        <SaveDietModal
          clientName={selectedClient.name}
          diet={savedDiet}
          onClose={() => {
            setSavedDiet(null);
            setSavedDietId(null);
          }}
        />
      )}

      {/* LOADING DIETA */}
      {loadingDiet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center">
          <p className="text-white text-sm">
            ⏳ Preparando resumen de la dieta…
          </p>
        </div>
      )}
    </div>
  );
}
