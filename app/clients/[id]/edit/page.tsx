"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getClient, updateClient, deleteClient, Client } from "@/lib/clientsApi";

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditClientPage({ params }: Props) {
  // Resolver params correctamente
  const { id: clientId } = use(params);

  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);


  /* =====================
     CARGAR CLIENTE
  ===================== */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const c = await getClient(clientId);

        if (!mounted) return;

        setClient(c);
        setForm({
          name: c.name,
          email: c.email ?? "",
          phone: c.phone ?? "",
          notes: c.notes ?? "",
        });
      } catch (e) {
        console.error(e);
        if (mounted) {
          setError("Error cargando el cliente");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [clientId]);

  /* =====================
     GUARDAR CAMBIOS
  ===================== */

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await updateClient(clientId, {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        notes: form.notes.trim() || null,
      });

      router.push(`/clients/${clientId}`);
    } catch (e) {
      console.error(e);
      setError("Error guardando los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
  const confirmed = window.confirm(
    "¿Seguro que quieres eliminar este cliente?\n\nEsta acción no se puede deshacer."
  );

  if (!confirmed) return;

  try {
    setDeleting(true);
    await deleteClient(clientId);
    router.push("/clients");
  } catch (e) {
    console.error(e);
    setError("Error eliminando el cliente");
  } finally {
    setDeleting(false);
  }
};


  /* =====================
     ESTADOS
  ===================== */

  if (loading) {
    return (
      <p className="text-white p-6">
        Cargando cliente…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-red-400 p-6">
        {error}
      </p>
    );
  }

  if (!client) {
    return (
      <p className="text-white p-6">
        Cliente no encontrado
      </p>
    );
  }

  /* =====================
     UI
  ===================== */

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* HEADER */}
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">
            Editar cliente
          </h1>

          <Link
            href={`/clients/${clientId}`}
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            ← Volver
          </Link>
        </header>

        {/* FORM */}
        <div className="card space-y-4">

          <div>
            <label className="block text-sm text-white/70 mb-1">
              Nombre
            </label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">
              Email
            </label>
            <input
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              type="email"
              className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">
              Teléfono
            </label>
            <input
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">
              Notas
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
              rows={4}
              className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg px-3 py-2 text-white resize-none"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-between items-center pt-2">
            <button
  onClick={handleDelete}
  disabled={deleting}
  className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
>
  {deleting ? "Eliminando…" : "Eliminar cliente"}
</button>

            <Link
              href={`/clients/${clientId}`}
              className="text-sm text-white/60 hover:text-white"
            >
              Cancelar
            </Link>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--color-accent)] px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
