"use client";

import { useEffect, useState, useCallback } from "react";
import CheckCard from "@/components/CheckCard";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <img src="/peek-logo.png" alt="Peek" className="h-7" />
              <span className="text-lg font-bold text-foreground">Peek Monitor</span>
            </div>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Actualizado: {lastUpdated.toLocaleTimeString("es-AR")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchChecks}
              disabled={loading}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Refrescar"}
            </button>
            <ThemeToggle />
            <a
              href="/api/auth/logout"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Cerrar sesión
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading && checks.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Cargando checks...</div>
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
