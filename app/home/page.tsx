"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/dashboardApi";

type Stats = {
  clientsCount: number;
  dietsCount: number;
  lastActivity: string | null;
};

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-12">

      {/* HERO */}
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">
          Panel de control
        </h1>
        <p className="text-sm text-white/60">
          Juanjo Fitness · Gestión nutricional interna
        </p>
        <p className="text-xs text-white/40 pt-1">
          Bienvenido de nuevo 👋
        </p>
      </header>

      {/* ACCIONES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/calculator"
          className="card group text-center hover:border-[var(--color-accent)] transition"
        >
          <span className="text-4xl mb-3 block">🍽️</span>
          <p className="text-lg font-medium text-white">
            Calculadora de dieta
          </p>
          <p className="text-sm text-white/60">
            Planifica comidas y macros
          </p>
        </Link>

        <Link
          href="/clients/new"
          className="card group text-center hover:border-[var(--color-accent)] transition"
        >
          <span className="text-4xl mb-3 block">➕</span>
          <p className="text-lg font-medium text-white">
            Crear cliente
          </p>
          <p className="text-sm text-white/60">
            Nuevo seguimiento
          </p>
        </Link>

        <Link
          href="/clients"
          className="card group text-center hover:border-[var(--color-accent)] transition"
        >
          <span className="text-4xl mb-3 block">👥</span>
          <p className="text-lg font-medium text-white">
            Ver clientes
          </p>
          <p className="text-sm text-white/60">
            Gestionar actuales
          </p>
        </Link>
      </section>

      {/* MÉTRICAS */}
      <section>
        <h2 className="text-sm font-medium text-white/70 mb-4">
          Resumen rápido
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card">
            <p className="text-xs text-white/50">
              Clientes activos
            </p>
            <p className="text-3xl font-semibold text-white mt-2">
              {stats ? stats.clientsCount : "—"}
            </p>
            <p className="text-xs text-white/40 mt-1">
              En seguimiento actual
            </p>
          </div>

          <div className="card">
            <p className="text-xs text-white/50">
              Dietas creadas
            </p>
            <p className="text-3xl font-semibold text-white mt-2">
              {stats ? stats.dietsCount : "—"}
            </p>
            <p className="text-xs text-white/40 mt-1">
              Totales en el sistema
            </p>
          </div>

          <div className="card">
            <p className="text-xs text-white/50">
              Última actividad
            </p>
            <p className="text-lg font-medium text-white mt-2">
              {stats?.lastActivity
                ? new Date(stats.lastActivity).toLocaleDateString()
                : "—"}
            </p>
            <p className="text-xs text-white/40 mt-1">
              Última dieta generada
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
