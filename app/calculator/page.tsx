"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DietPlanner from "@/app/components/DietPlanner";
import { getClients } from "@/lib/clientsApi";

type Client = {
  id: string;
  name: string;
};

export default function CalculatorPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingClients, setLoadingClients] = useState(true);

  // 🔹 cargar clientes
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
      } catch (e) {
        console.error("Error cargando clientes:", e);
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-6">

      {/* HEADER */}
      <header className="flex items-center justify-between">
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

      {/* SELECTOR DE CLIENTE */}
      <section className="card">
        <label className="text-sm text-white/70">
          Cliente
        </label>

        {loadingClients ? (
          <p className="text-sm text-white/50 mt-2">
            Cargando clientes…
          </p>
        ) : (
          <select
            className="input mt-2"
            value={selectedClient?.id ?? ""}
            onChange={(e) => {
              const client = clients.find(
                (c) => c.id === e.target.value
              );
              setSelectedClient(client ?? null);
            }}
          >
            <option value="">Selecciona un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        )}
      </section>

      {/* CALCULADORA */}
      {selectedClient && (
        <DietPlanner
          clientId={selectedClient.id}
          clientName={selectedClient.name}
        />
      )}

      {!selectedClient && (
        <p className="text-sm text-white/50">
          Selecciona un cliente para crear o modificar su dieta
        </p>
      )}

    </div>
  );
}
