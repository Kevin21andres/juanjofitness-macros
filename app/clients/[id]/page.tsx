"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getClient, updateClient } from "@/lib/clientsApi";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  // 🔹 estados locales (CLAVE)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadClient = async () => {
      try {
        const client = await getClient(id);

        // 👉 copiar datos a estados
        setName(client.name ?? "");
        setEmail(client.email ?? "");
        setNotes(client.notes ?? "");
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [id]);

  const save = async () => {
    await updateClient(id, {
      name,
      email,
      notes,
    });

    router.push("/clients");
  };

  if (loading) {
    return (
      <div className="p-6 text-white/60">
        Cargando cliente…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 max-w-xl mx-auto space-y-6">

      <h1 className="text-2xl font-semibold text-white">
        Editar cliente
      </h1>

      <input
        className="input"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="input"
        placeholder="Email (opcional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <textarea
        className="input min-h-[120px]"
        placeholder="Notas"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button
        onClick={save}
        className="bg-[var(--color-accent)] px-4 py-2 rounded-lg text-white"
      >
        Guardar cambios
      </button>

    </div>
  );
}
