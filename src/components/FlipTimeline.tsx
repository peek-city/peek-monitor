"use client";

interface EnrichedFlip {
  timestamp: string;
  up: 0 | 1;
  durationSeconds: number | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  const remainMin = min % 60;
  if (hr < 24) return `${hr}h ${remainMin}m`;
  const days = Math.floor(hr / 24);
  const remainHr = hr % 24;
  return `${days}d ${remainHr}h`;
}

export default function FlipTimeline({ flips }: { flips: EnrichedFlip[] }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="divide-y divide-border/50">
        {flips.map((flip, index) => {
          const isUp = flip.up === 1;

          return (
            <div
              key={`${flip.timestamp}-${index}`}
              className="flex items-center gap-4 px-4 py-3"
            >
              {/* Direction indicator */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isUp
                    ? "bg-green-900/30 text-green-400"
                    : "bg-red-900/30 text-red-400"
                }`}
              >
                {isUp ? "↑" : "↓"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground">
                  {isUp ? "Recuperado" : "Caído"}
                  <span className="text-muted-foreground ml-2">
                    {isUp ? "(down → up)" : "(up → down)"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(flip.timestamp)}
                </div>
              </div>

              {/* Duration */}
              {flip.durationSeconds !== null && (
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-muted-foreground">Duración</div>
                  <div className="text-sm text-card-foreground font-mono">
                    {formatDuration(flip.durationSeconds)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
