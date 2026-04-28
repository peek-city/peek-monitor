import { NextResponse } from "next/server";
import { getChecks, findCheckBySlug, getFlips } from "@/lib/healthchecks";

export const dynamic = "force-dynamic";

interface EnrichedFlip {
  timestamp: string;
  up: 0 | 1;
  durationSeconds: number | null;
}

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const checks = await getChecks();
    const check = findCheckBySlug(checks, slug);

    if (!check) {
      return NextResponse.json(
        { error: "Check no encontrado" },
        { status: 404 }
      );
    }

    const flips = await getFlips(check.uuid);

    // Calculate duration between consecutive flips
    // Flips are ordered most recent first
    const enriched: EnrichedFlip[] = flips.map((flip, index) => {
      let durationSeconds: number | null = null;

      if (index > 0) {
        // Duration from this flip to the next (more recent) flip
        const nextFlip = flips[index - 1];
        const thisTime = new Date(flip.timestamp).getTime();
        const nextTime = new Date(nextFlip.timestamp).getTime();
        durationSeconds = Math.round((nextTime - thisTime) / 1000);
      }

      return {
        timestamp: flip.timestamp,
        up: flip.up,
        durationSeconds,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Error al obtener flips:", error);
    return NextResponse.json(
      { error: "Error al obtener flips" },
      { status: 500 }
    );
  }
}
