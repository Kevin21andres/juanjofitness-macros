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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error, data } =
      await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });

    console.log("LOGIN RESULT:", { error, data });

    setLoading(false);

    if (error) {
      setError("Credenciales incorrectas");
      return;
    }

    router.push("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]">
      <div className="w-full max-w-sm bg-[#111111] p-8 rounded-2xl border border-white/10">
        <h1 className="text-2xl font-semibold text-white mb-2">
          Acceso privado
        </h1>
        <p className="text-sm text-white/70 mb-6">
          Herramienta interna Juanjo Fitness
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="juanjo@email.com"
            required
            className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg px-3 py-2 text-white"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg px-3 py-2 text-white"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            disabled={loading}
            className="w-full bg-[var(--color-accent)] py-2 rounded-lg"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
