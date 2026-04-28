import { NextRequest, NextResponse } from "next/server";
import {
  getChecks,
  findCheckBySlug,
  getPings,
  getPingBody,
} from "@/lib/healthchecks";
import { parseBody, ParsedBody } from "@/lib/body-parser";

export const dynamic = "force-dynamic";

interface EnrichedPing {
  type: "success" | "fail" | "start";
  date: string;
  n: number;
  duration: number | null;
  body: ParsedBody | null;
}

const PAGE_SIZE = 25;

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const page = parseInt(
      request.nextUrl.searchParams.get("page") ?? "1",
      10
    );

    const checks = await getChecks();
    const check = findCheckBySlug(checks, slug);

    if (!check) {
      return NextResponse.json(
        { error: "Check no encontrado" },
        { status: 404 }
      );
    }

    const allPings = await getPings(check.uuid);

    // Paginate
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pagePings = allPings.slice(start, end);

    // Enrich with parsed bodies
    const enriched: EnrichedPing[] = await Promise.all(
      pagePings.map(async (ping) => {
        let body: ParsedBody | null = null;

        if (ping.body_url) {
          try {
            const rawBody = await getPingBody(check.uuid, ping.n);
            if (rawBody) {
              body = parseBody(rawBody);
            }
          } catch {
            // Ignore body fetch errors
          }
        }

        return {
          type: ping.type,
          date: ping.date,
          n: ping.n,
          duration: ping.duration,
          body,
        };
      })
    );

    return NextResponse.json({
      pings: enriched,
      total: allPings.length,
      page,
      totalPages: Math.ceil(allPings.length / PAGE_SIZE),
    });
  } catch (error) {
    console.error("Error al obtener pings:", error);
    return NextResponse.json(
      { error: "Error al obtener pings" },
      { status: 500 }
    );
  }
}
