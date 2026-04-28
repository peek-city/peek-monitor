"use client";

import { useEffect, useState, useCallback } from "react";
import CheckCard from "@/components/CheckCard";

interface Check {
  name: string;
  slug: string;
  status: "new" | "up" | "grace" | "down" | "paused";
  last_ping: string | null;
  next_ping: string | null;
}

export default function DashboardPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchChecks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checks");
      if (res.ok) {
        const data = await res.json();
        setChecks(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error al cargar checks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Peek Monitor</h1>
            {lastUpdated && (
              <p className="text-xs text-gray-400 mt-0.5">
                Actualizado: {lastUpdated.toLocaleTimeString("es-AR")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchChecks}
              disabled={loading}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Refrescar"}
            </button>
            <a
              href="/api/auth/logout"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Cerrar sesión
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading && checks.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">Cargando checks...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {checks.map((check) => (
              <CheckCard key={check.slug} check={check} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
