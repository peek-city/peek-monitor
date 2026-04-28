export interface GroupSuccessMetrics {
  type: "group_success";
  grupo: string;
  stepsOk: number;
  stepsTotal: number;
  wallSeconds: number;
  cpuSeconds: number;
  ramPeakMB: number;
}

export interface GroupFailMetrics {
  type: "group_fail";
  grupo: string;
  stepFallido: string;
  exitCode: number;
  wallSeconds: number;
}

export interface PipelineMetrics {
  type: "pipeline";
  timestamp: string;
  commit: string;
  wakeHours: string;
  grupos: Record<string, string>;
}

export interface RecommendationMetrics {
  type: "recommendation";
  status: string;
  wallSeconds: number;
  exitCode?: number;
}

export type ParsedBody =
  | GroupSuccessMetrics
  | GroupFailMetrics
  | PipelineMetrics
  | RecommendationMetrics
  | { type: "raw"; text: string };

export function parseBody(body: string): ParsedBody {
  const trimmed = body.trim();

  // Group success: grupo=<name> steps=<ok>/<total> wall=<s>s cpu_s=<s>s ram_peak=<MB>MB
  const successMatch = trimmed.match(
    /^grupo=(\S+)\s+steps=(\d+)\/(\d+)\s+wall=(\d+(?:\.\d+)?)s\s+cpu_s=(\d+(?:\.\d+)?)s\s+ram_peak=(\d+(?:\.\d+)?)MB$/
  );
  if (successMatch) {
    return {
      type: "group_success",
      grupo: successMatch[1],
      stepsOk: parseInt(successMatch[2], 10),
      stepsTotal: parseInt(successMatch[3], 10),
      wallSeconds: parseFloat(successMatch[4]),
      cpuSeconds: parseFloat(successMatch[5]),
      ramPeakMB: parseFloat(successMatch[6]),
    };
  }

  // Group fail: grupo=<name> step_fallido=<step> exit=<code> wall=<s>s
  const failMatch = trimmed.match(
    /^grupo=(\S+)\s+step_fallido=(.+?)\s+exit=(\d+)\s+wall=(\d+(?:\.\d+)?)s$/
  );
  if (failMatch) {
    return {
      type: "group_fail",
      grupo: failMatch[1],
      stepFallido: failMatch[2],
      exitCode: parseInt(failMatch[3], 10),
      wallSeconds: parseFloat(failMatch[4]),
    };
  }

  // Recommendation: status=<OK|FAIL> wall=<s>s (may also have exit=<code>)
  const recoMatch = trimmed.match(
    /^status=(OK|FAIL)\s+wall=(\d+(?:\.\d+)?)s(?:\s+exit=(\d+))?$/
  );
  if (recoMatch) {
    const result: RecommendationMetrics = {
      type: "recommendation",
      status: recoMatch[1],
      wallSeconds: parseFloat(recoMatch[2]),
    };
    if (recoMatch[3]) {
      result.exitCode = parseInt(recoMatch[3], 10);
    }
    return result;
  }

  // Pipeline: multiline starting with "pipeline <timestamp>"
  const lines = trimmed.split("\n").map((l) => l.trim());
  if (lines[0]?.startsWith("pipeline ")) {
    const timestamp = lines[0].replace("pipeline ", "");
    let commit = "";
    let wakeHours = "";
    const grupos: Record<string, string> = {};

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("commit=")) {
        commit = line.replace("commit=", "");
      } else if (line.startsWith("wake_hours=")) {
        wakeHours = line.replace("wake_hours=", "");
      } else if (line.startsWith("grupo_")) {
        const eqIdx = line.indexOf("=");
        if (eqIdx !== -1) {
          const name = line.substring(6, eqIdx);
          const value = line.substring(eqIdx + 1);
          grupos[name] = value;
        }
      }
    }

    return { type: "pipeline", timestamp, commit, wakeHours, grupos };
  }

  // Fallback
  return { type: "raw", text: body };
}
