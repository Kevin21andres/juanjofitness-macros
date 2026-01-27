"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/clientsApi";

export default function NewClientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

    const submit = async () => {
    if (!name.trim()) return;

    try {
        setLoading(true);
        await createClient({ name, email, notes });
        router.push("/clients");
    } catch (e) {
        console.error("Error creando cliente:", e);
        alert("Error al guardar el cliente");
    } finally {
        setLoading(false);
    }
    };

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 max-w-xl mx-auto space-y-6">

      <h1 className="text-2xl font-semibold text-white">
        Nuevo cliente
      </h1>

      <div className="space-y-4">
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
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className="bg-[var(--color-accent)] px-4 py-2 rounded-lg text-white"
      >
        Guardar cliente
      </button>

    </div>
  );
}
