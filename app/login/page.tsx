"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false); // 👈 transición

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    const { error } =
      await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setLoading(false);
      setError("Credenciales incorrectas");
      return;
    }

    // ✨ animación de salida
    setLeaving(true);

    setTimeout(() => {
      router.push("/home");
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B0B0B] via-[#0E1622] to-[#0B0B0B] px-4">

      {/* CARD LOGIN */}
      <div
        className={`
          w-full max-w-sm rounded-2xl border border-white/10
          bg-[#111]/80 backdrop-blur-xl shadow-xl p-8 space-y-6
          transition-all duration-300 ease-out
          ${leaving ? "opacity-0 scale-95" : "opacity-100 scale-100"}
        `}
      >
        {/* LOGO / TITLE */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Juanjo<span className="text-[var(--color-accent)]">Fitness</span>
          </h1>
          <p className="text-sm text-white/60">
            Acceso privado · Panel nutricional
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-white/50">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo"
              required
              className="w-full rounded-lg bg-[#0B0B0B] border border-white/10 px-3 py-2 text-white placeholder:text-white/30
                         focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/50">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="contraseña"
              required
              className="w-full rounded-lg bg-[#0B0B0B] border border-white/10 px-3 py-2 text-white placeholder:text-white/30
                         focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-[var(--color-accent)] py-2.5 font-medium text-white
                       transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-white/30">
          Plataforma interna de nutrición
        </p>
      </div>

      {/* OVERLAY TRANSICIÓN */}
      {leaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0B0B]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-[var(--color-accent)] animate-spin" />
            <p className="text-sm text-white/60">
              Accediendo al panel…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
