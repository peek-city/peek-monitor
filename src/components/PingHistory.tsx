"use client";

import MetricsDisplay from "./MetricsDisplay";

type ParsedBody =
  | { type: "group_success"; grupo: string; stepsOk: number; stepsTotal: number; wallSeconds: number; cpuSeconds: number; ramPeakMB: number }
  | { type: "group_fail"; grupo: string; stepFallido: string; exitCode: number; wallSeconds: number }
  | { type: "pipeline"; timestamp: string; commit: string; wakeHours: string; grupos: Record<string, string> }
  | { type: "recommendation"; status: string; wallSeconds: number; exitCode?: number }
  | { type: "raw"; text: string };

interface EnrichedPing {
  type: "success" | "fail" | "start";
  date: string;
  n: number;
  duration: number | null;
  body: ParsedBody | null;
}

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  success: {
    label: "OK",
    className: "bg-green-900/50 text-green-300 border-green-800",
  },
  fail: {
    label: "FAIL",
    className: "bg-red-900/50 text-red-300 border-red-800",
  },
  start: {
    label: "START",
    className: "bg-blue-900/50 text-blue-300 border-blue-800",
  },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface PingHistoryProps {
  pings: EnrichedPing[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PingHistory({
  pings,
  page,
  totalPages,
  onPageChange,
}: PingHistoryProps) {
  if (pings.length === 0) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">
        Sin pings registrados.
      </div>
    );
  }

  return (
    <div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs">
              <th className="text-left py-3 px-4 font-medium w-16">#</th>
              <th className="text-left py-3 px-4 font-medium w-40">
                Timestamp
              </th>
              <th className="text-left py-3 px-4 font-medium w-20">Tipo</th>
              <th className="text-left py-3 px-4 font-medium">
                Body / Métricas
              </th>
            </tr>
          </thead>
          <tbody>
            {pings.map((ping) => {
              const badge = TYPE_BADGES[ping.type] ?? TYPE_BADGES.success;
              const isFail = ping.type === "fail";

              return (
                <tr
                  key={ping.n}
                  className={`border-b border-border/50 ${isFail ? "bg-red-950/20" : ""}`}
                >
                  <td className="py-3 px-4 text-muted-foreground font-mono text-xs">
                    {ping.n}
                  </td>
                  <td className="py-3 px-4 text-card-foreground text-xs">
                    {formatDate(ping.date)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {ping.body ? (
                      <MetricsDisplay body={ping.body} />
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
