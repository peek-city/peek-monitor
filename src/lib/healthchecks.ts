const BASE_URL = "https://healthchecks.io/api/v3";

function getApiKey(): string {
  const key = process.env.HEALTHCHECKS_API_KEY;
  if (!key) {
    throw new Error("Variable de entorno HEALTHCHECKS_API_KEY no configurada");
  }
  return key;
}

function headers(): HeadersInit {
  return { "X-Api-Key": getApiKey() };
}

export interface HealthCheck {
  name: string;
  slug: string;
  status: "new" | "up" | "grace" | "down" | "paused";
  last_ping: string | null;
  next_ping: string | null;
  uuid: string;
  n_pings: number;
  tags: string;
  desc: string;
  grace: number;
}

export interface PingEntry {
  type: "success" | "fail" | "start";
  date: string;
  n: number;
  scheme: string;
  remote_addr: string;
  method: string;
  ua: string;
  rid: string | null;
  duration: number | null;
  body_url: string | null;
}

export interface FlipEntry {
  timestamp: string;
  up: 0 | 1;
}

export async function getChecks(): Promise<HealthCheck[]> {
  const response = await fetch(`${BASE_URL}/checks/`, {
    headers: headers(),
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener checks: ${response.status}`);
  }

  const data = await response.json();
  return data.checks ?? data;
}

export async function getPings(uuid: string): Promise<PingEntry[]> {
  const response = await fetch(`${BASE_URL}/checks/${uuid}/pings/`, {
    headers: headers(),
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener pings: ${response.status}`);
  }

  const data = await response.json();
  return data.pings ?? data;
}

export async function getPingBody(
  uuid: string,
  pingNumber: number
): Promise<string> {
  const response = await fetch(
    `${BASE_URL}/checks/${uuid}/pings/${pingNumber}/body`,
    { headers: headers(), next: { revalidate: 0 } }
  );

  if (!response.ok) {
    return "";
  }

  return response.text();
}

export async function getFlips(uuid: string): Promise<FlipEntry[]> {
  const response = await fetch(`${BASE_URL}/checks/${uuid}/flips/`, {
    headers: headers(),
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener flips: ${response.status}`);
  }

  const data = await response.json();
  return data.flips ?? data;
}

export function findCheckBySlug(
  checks: HealthCheck[],
  slug: string
): HealthCheck | undefined {
  return checks.find((c) => c.slug === slug);
}
