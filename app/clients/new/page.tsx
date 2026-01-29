"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/clientsApi";

const PHONE_REGEX = /^\+\d{1,3}\s?\d{6,14}$/;

export default function NewClientPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isFormValid =
    form.name.trim() &&
    form.surname.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    PHONE_REGEX.test(form.phone.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);

    if (!isFormValid) {
      setError(
        "Nombre, apellidos, email y teléfono válidos son obligatorios"
      );
      return;
    }

    setLoading(true);

    try {
      await createClient({
        name: `${form.name.trim()} ${form.surname.trim()}`,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        notes: form.notes.trim() || null,
      });

      router.push("/clients");
    } catch (err) {
      console.error(err);
      setError("Error creando el cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 flex justify-center">
      <div className="w-full max-w-2xl space-y-8">

        {/* HEADER */}
        <header className="space-y-1">
          <Link
            href="/clients"
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            ← Clientes
          </Link>

          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Nuevo cliente
          </h1>

          <p className="text-sm text-white/50">
            Añade un nuevo cliente para gestionar su dieta y seguimiento
          </p>
        </header>

        {/* FORM */}
        <form onSubmit={submit} className="card space-y-8">

          {/* DATOS OBLIGATORIOS */}
          <section className="space-y-4">
            <h2 className="text-white font-medium text-lg">
              📌 Datos obligatorios
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/60">Nombre *</label>
                <input
                  name="name"
                  className="input mt-1"
                  value={form.name}
                  onChange={onChange}
                />
              </div>

              <div>
                <label className="text-xs text-white/60">Apellidos *</label>
                <input
                  name="surname"
                  className="input mt-1"
                  value={form.surname}
                  onChange={onChange}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/60">
                Correo electrónico *
              </label>
              <input
                name="email"
                type="email"
                className="input mt-1"
                value={form.email}
                onChange={onChange}
              />
              <p className="text-xs text-white/40 mt-1">
                Se usará para enviar la dieta por email
              </p>
            </div>

            <div>
              <label className="text-xs text-white/60">
                Teléfono con prefijo *
              </label>
              <input
                name="phone"
                className="input mt-1"
                placeholder="+34 650 149 708"
                value={form.phone}
                onChange={onChange}
              />
              <p className="text-xs text-white/40 mt-1">
                Se usará para enviar la dieta por WhatsApp
              </p>
            </div>
          </section>

          {/* DATOS OPCIONALES */}
          <section className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="text-white font-medium text-lg">
              📝 Información adicional
            </h2>

            <div>
              <label className="text-xs text-white/60">Notas</label>
              <textarea
                name="notes"
                className="input mt-1 min-h-[90px]"
                value={form.notes}
                onChange={onChange}
              />
            </div>
          </section>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Link
              href="/clients"
              className="px-4 py-2 rounded-lg border border-white/20 text-white/70 text-sm hover:bg-white/5 transition"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="bg-[var(--color-accent)] px-6 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition"
            >
              {loading ? "Creando cliente…" : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
