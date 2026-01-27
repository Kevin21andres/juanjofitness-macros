"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [result, setResult] = useState<null | {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  }>(null);

  const handleCalculate = () => {
    // valores fake de momento
    setResult({
      kcal: 2300,
      protein: 160,
      carbs: 250,
      fat: 70,
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-10">

      {/* HEADER */}
      <header>
        <h1 className="text-2xl font-semibold text-white">
          Panel de control
        </h1>
        <p className="text-sm text-white/60">
          Juanjo Fitness · Macros & Clientes
        </p>
      </header>

      {/* CALCULADORA RÁPIDA */}
      <section className="bg-[#111111] rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-medium text-white mb-4">
          Calculadora rápida de macros
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <input className="input" placeholder="Peso (kg)" />
          <input className="input" placeholder="Altura (cm)" />
          <input className="input" placeholder="Actividad" />
          <input className="input" placeholder="Objetivo" />
        </div>

        <button
          onClick={handleCalculate}
          className="mt-4 bg-[var(--color-accent)] px-4 py-2 rounded-lg text-white font-medium hover:brightness-110 transition"
        >
          Calcular macros
        </button>

        {result && (
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="card">
              <p className="text-white/60">Calorías</p>
              <p className="text-xl font-semibold text-white">
                {result.kcal} kcal
              </p>
            </div>
            <div className="card">
              <p className="text-white/60">Proteínas</p>
              <p className="text-xl font-semibold text-white">
                {result.protein} g
              </p>
            </div>
            <div className="card">
              <p className="text-white/60">Carbohidratos</p>
              <p className="text-xl font-semibold text-white">
                {result.carbs} g
              </p>
            </div>
            <div className="card">
              <p className="text-white/60">Grasas</p>
              <p className="text-xl font-semibold text-white">
                {result.fat} g
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ACCIONES RÁPIDAS */}
      <section className="grid grid-cols-2 gap-4">
        <Link
          href="/clients/new"
          className="bg-[var(--color-accent)] py-3 rounded-xl text-white font-medium text-center hover:brightness-110 transition"
        >
          + Nuevo cliente
        </Link>

        <Link
          href="/clients"
          className="bg-[#111111] py-3 rounded-xl text-white border border-white/10 text-center hover:bg-white/5 transition"
        >
          Ver clientes
        </Link>
      </section>

      {/* CLIENTES RECIENTES */}
      <section>
        <h2 className="text-lg font-medium text-white mb-4">
          Clientes recientes
        </h2>

        <div className="space-y-3">
          <div className="card">
            <p className="text-white font-medium">Carlos Pérez</p>
            <p className="text-white/60 text-sm">Definición</p>
          </div>

          <div className="card">
            <p className="text-white font-medium">Laura Gómez</p>
            <p className="text-white/60 text-sm">Volumen</p>
          </div>
        </div>
      </section>

    </div>
  );
}
