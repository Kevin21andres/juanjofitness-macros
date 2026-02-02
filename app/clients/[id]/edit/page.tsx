"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getClient,
  updateClient,
  deleteClient,
  Client,
} from "@/lib/clientsApi";

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditClientPage({ params }: Props) {
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
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        if (mounted) setError("Error cargando el cliente");
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
     GUARDAR
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

  /* =====================
     ELIMINAR
  ===================== */
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
    return <p className="text-white p-6">Cargando cliente…</p>;
  }

  if (error) {
    return <p className="text-red-400 p-6">{error}</p>;
  }

  if (!client) {
    return <p className="text-white p-6">Cliente no encontrado</p>;
  }

  /* =====================
     UI
  ===================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0B] via-[#0E1622] to-[#0B0B0B] px-6 py-10">
      <div className="max-w-xl mx-auto space-y-8">

        {/* HEADER */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Editar cliente
            </h1>
            <p className="text-sm text-white/50">
              Modifica los datos del cliente
            </p>
          </div>

          <Link
            href={`/clients/${clientId}`}
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            ← Volver
          </Link>
        </header>

        {/* FORM CARD */}
        <section className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl shadow-xl p-6 space-y-6">

          {/* CAMPOS */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">
                Nombre
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full rounded-lg bg-[#0B0B0B] border border-white/10 px-3 py-2 text-white
                           focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1">
                Email
              </label>
              <input
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                type="email"
                className="w-full rounded-lg bg-[#0B0B0B] border border-white/10 px-3 py-2 text-white
                           focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1">
                Teléfono
              </label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                className="w-full rounded-lg bg-[#0B0B0B] border border-white/10 px-3 py-2 text-white
                           focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1">
                Notas
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                rows={4}
                className="w-full rounded-lg bg-[#0B0B0B] border border-white/10 px-3 py-2 text-white resize-none
                           focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-white/10">

            {/* DANGER */}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              {deleting ? "Eliminando…" : "Eliminar cliente"}
            </button>

            <div className="flex gap-3 sm:ml-auto">
              <Link
                href={`/clients/${clientId}`}
                className="px-4 py-2 rounded-lg border border-white/20 text-white/70 text-sm hover:bg-white/5 transition"
              >
                Cancelar
              </Link>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium
                           transition hover:brightness-110 disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
