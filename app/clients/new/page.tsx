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
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0B] via-[#0E1622] to-[#0B0B0B] px-6 py-10 flex justify-center">
      <div className="w-full max-w-3xl space-y-10">

        {/* HEADER */}
        <header className="space-y-2">
          <Link
            href="/clients"
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            ← Clientes
          </Link>

          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Nuevo cliente
          </h1>

          <p className="text-sm text-white/50">
            Añade un nuevo cliente para iniciar su seguimiento nutricional
          </p>
        </header>

        {/* FORM */}
        <form
          onSubmit={submit}
          className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl p-8 space-y-10 shadow-xl"
        >

          {/* DATOS OBLIGATORIOS */}
          <section className="space-y-5">
            <h2 className="text-lg font-medium text-white">
              📌 Datos obligatorios
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-white/50">
                  Nombre *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg bg-[#0B0B0B] border border-white/10 px-3 py-2 text-white
                             placeholder:text-white/30 focus:outline-none focus:border-[var(--color-accent)]
                             focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-xs text-white/50">
                  Apellidos *
                </label>
                <input
                  name="surname"
                  value={form.surname}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg bg-[#0B0B0B] border border-white/10 px-3 py-2 text-white
                             focus:outline-none focus:border-[var(--color-accent)]
                             focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50">
                Correo electrónico *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                className="mt-1 w-full rounded-lg bg-[#0B0B0B] border border-white/10 px-3 py-2 text-white
                           focus:outline-none focus:border-[var(--color-accent)]
                           focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <p className="text-xs text-white/40 mt-1">
                Se usará para enviar la dieta por email
              </p>
            </div>

            <div>
              <label className="text-xs text-white/50">
                Teléfono con prefijo *
              </label>
              <input
                name="phone"
                placeholder="+34 650 149 708"
                value={form.phone}
                onChange={onChange}
                className="mt-1 w-full rounded-lg bg-[#0B0B0B] border border-white/10 px-3 py-2 text-white
                           focus:outline-none focus:border-[var(--color-accent)]
                           focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <p className="text-xs text-white/40 mt-1">
                Se usará para enviar la dieta por WhatsApp
              </p>
            </div>
          </section>

          {/* DATOS OPCIONALES */}
          <section className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="text-lg font-medium text-white">
              📝 Información adicional
            </h2>

            <div>
              <label className="text-xs text-white/50">
                Notas
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={onChange}
                rows={4}
                className="mt-1 w-full rounded-lg bg-[#0B0B0B] border border-white/10 px-3 py-2 text-white resize-none
                           focus:outline-none focus:border-[var(--color-accent)]
                           focus:ring-1 focus:ring-[var(--color-accent)]"
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
              className="px-4 py-2 rounded-lg border border-white/20 text-white/70 text-sm
                         hover:bg-white/5 transition"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="px-6 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium
                         transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creando cliente…" : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
