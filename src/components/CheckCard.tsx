"use client";

import { useRouter } from "next/navigation";

interface Check {
  name: string;
  slug: string;
  status: "new" | "up" | "grace" | "down" | "paused";
  last_ping: string | null;
  next_ping: string | null;
}

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
  grace: "Pendiente",
  new: "Nuevo",
  paused: "Pausado",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `hace ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `hace ${diffHr}h`;
  const diffDays = Math.floor(diffHr / 24);
  return `hace ${diffDays}d`;
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return timeAgo(dateStr);
}

function formatFutureRelative(dateStr: string | null): string {
  if (!dateStr) return "—";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = then - now;

  if (diffMs < 0) return "vencido";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `en ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `en ${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `en ${diffHr}h`;
  const diffDays = Math.floor(diffHr / 24);
  return `en ${diffDays}d`;
}

export default function CheckCard({ check }: { check: Check }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/checks/${check.slug}`)}
      className="bg-card border border-border rounded-lg p-5 cursor-pointer hover:border-accent transition-colors"
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`w-3 h-3 rounded-full flex-shrink-0 ${STATUS_COLORS[check.status] ?? "bg-gray-400"}`}
        />
        <h3 className="text-foreground font-medium truncate">{check.name}</h3>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {STATUS_LABELS[check.status] ?? check.status}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Último ping</span>
          <span className="text-card-foreground">
            {formatRelativeDate(check.last_ping)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Próximo ping</span>
          <span className="text-card-foreground">
            {formatFutureRelative(check.next_ping)}
          </span>
        </div>
      </div>
    </div>
  );
}
