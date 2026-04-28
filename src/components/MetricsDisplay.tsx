"use client";

type ParsedBody =
  | { type: "group_success"; grupo: string; stepsOk: number; stepsTotal: number; wallSeconds: number; cpuSeconds: number; ramPeakMB: number }
  | { type: "group_fail"; grupo: string; stepFallido: string; exitCode: number; wallSeconds: number }
  | { type: "pipeline"; timestamp: string; commit: string; wakeHours: string; grupos: Record<string, string> }
  | { type: "recommendation"; status: string; wallSeconds: number; exitCode?: number }
  | { type: "raw"; text: string };

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-mono">{value}</span>
    </div>
  );
}

export default function MetricsDisplay({ body }: { body: ParsedBody }) {
  if (body.type === "group_success") {
    return (
      <div className="space-y-1">
        <div className="text-xs font-medium text-green-400 mb-1">
          ✓ {body.grupo}
        </div>
        <MetricRow label="Steps" value={`${body.stepsOk}/${body.stepsTotal}`} />
        <MetricRow label="Tiempo total" value={`${body.wallSeconds}s`} />
        <MetricRow label="CPU" value={`${body.cpuSeconds}s`} />
        <MetricRow label="RAM pico" value={`${body.ramPeakMB}MB`} />
      </div>
    );
  }

  if (body.type === "group_fail") {
    return (
      <div className="space-y-1 bg-red-900/20 rounded p-2">
        <div className="text-xs font-medium text-red-400 mb-1">
          ✗ {body.grupo}
        </div>
        <MetricRow label="Step fallido" value={body.stepFallido} />
        <MetricRow label="Exit code" value={body.exitCode} />
        <MetricRow label="Tiempo total" value={`${body.wallSeconds}s`} />
      </div>
    );
  }

  if (body.type === "pipeline") {
    return (
      <div className="space-y-1">
        <div className="text-xs font-medium text-blue-400 mb-1">
          Pipeline {body.timestamp}
        </div>
        <MetricRow label="Commit" value={body.commit || "—"} />
        <MetricRow label="Wake hours" value={body.wakeHours || "—"} />
        {Object.entries(body.grupos).map(([name, status]) => (
          <div key={name} className="flex justify-between text-xs">
            <span className="text-muted-foreground">{name}</span>
            <span
              className={`font-mono ${status === "OK" ? "text-green-400" : "text-red-400"}`}
            >
              {status}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (body.type === "recommendation") {
    return (
      <div className="space-y-1">
        <div
          className={`text-xs font-medium mb-1 ${body.status === "OK" ? "text-green-400" : "text-red-400"}`}
        >
          Recommendation: {body.status}
        </div>
        <MetricRow label="Tiempo total" value={`${body.wallSeconds}s`} />
        {body.exitCode !== undefined && (
          <MetricRow label="Exit code" value={body.exitCode} />
        )}
      </div>
    );
  }

  // raw
  return (
    <pre className="text-xs text-card-foreground font-mono whitespace-pre-wrap break-all bg-muted/50 rounded p-2 max-h-32 overflow-auto">
      {body.text}
    </pre>
  );
}
