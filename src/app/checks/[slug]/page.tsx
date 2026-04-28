"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PingHistory from "@/components/PingHistory";
import FlipTimeline from "@/components/FlipTimeline";

interface PingsResponse {
  pings: EnrichedPing[];
  total: number;
  page: number;
  totalPages: number;
}

interface EnrichedPing {
  type: "success" | "fail" | "start";
  date: string;
  n: number;
  duration: number | null;
  body: ParsedBody | null;
}

interface EnrichedFlip {
  timestamp: string;
  up: 0 | 1;
  durationSeconds: number | null;
}

// ParsedBody types
type ParsedBody =
  | { type: "group_success"; grupo: string; stepsOk: number; stepsTotal: number; wallSeconds: number; cpuSeconds: number; ramPeakMB: number }
  | { type: "group_fail"; grupo: string; stepFallido: string; exitCode: number; wallSeconds: number }
  | { type: "pipeline"; timestamp: string; commit: string; wakeHours: string; grupos: Record<string, string> }
  | { type: "recommendation"; status: string; wallSeconds: number; exitCode?: number }
  | { type: "raw"; text: string };

const STATUS_COLORS: Record<string, string> = {
  up: "bg-green-500",
  down: "bg-red-500",
  grace: "bg-yellow-500",
  new: "bg-gray-400",
  paused: "bg-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
  up: "Activo",
  down: "Caído",
  grace: "En gracia",
  new: "Nuevo",
  paused: "Pausado",
};

export default function CheckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [pingsData, setPingsData] = useState<PingsResponse | null>(null);
  const [flips, setFlips] = useState<EnrichedFlip[]>([]);
  const [checkInfo, setCheckInfo] = useState<{
    name: string;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchCheckInfo() {
      try {
        const res = await fetch("/api/checks");
        if (res.ok) {
          const checks = await res.json();
          const check = checks.find(
            (c: { slug: string }) => c.slug === slug
          );
          if (check) {
            setCheckInfo({ name: check.name, status: check.status });
          }
        }
      } catch (error) {
        console.error("Error al cargar info del check:", error);
      }
    }

    async function fetchFlips() {
      try {
        const res = await fetch(`/api/checks/${slug}/flips`);
        if (res.ok) {
          const data = await res.json();
          setFlips(data);
        }
      } catch (error) {
        console.error("Error al cargar flips:", error);
      }
    }

    fetchCheckInfo();
    fetchFlips();
  }, [slug]);

  useEffect(() => {
    async function fetchPings() {
      setLoading(true);
      try {
        const res = await fetch(`/api/checks/${slug}/pings?page=${page}`);
        if (res.ok) {
          const data = await res.json();
          setPingsData(data);
        }
      } catch (error) {
        console.error("Error al cargar pings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPings();
  }, [slug, page]);

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Volver
          </button>
          {checkInfo && (
            <div className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full ${STATUS_COLORS[checkInfo.status] ?? "bg-gray-400"}`}
              />
              <h1 className="text-xl font-bold text-white">
                {checkInfo.name}
              </h1>
              <span className="text-sm text-gray-400">
                {STATUS_LABELS[checkInfo.status] ?? checkInfo.status}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Ping History */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">
            Historial de Pings
          </h2>
          {loading && !pingsData ? (
            <div className="text-gray-400 py-8 text-center">
              Cargando pings...
            </div>
          ) : pingsData ? (
            <PingHistory
              pings={pingsData.pings}
              page={pingsData.page}
              totalPages={pingsData.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </section>

        {/* Flip Timeline */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">
            Historial de Cambios de Estado
          </h2>
          {flips.length === 0 ? (
            <div className="text-gray-400 py-4 text-center text-sm">
              Sin cambios de estado registrados.
            </div>
          ) : (
            <FlipTimeline flips={flips} />
          )}
        </section>
      </main>
    </div>
  );
}
