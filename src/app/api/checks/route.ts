import { NextResponse } from "next/server";
import { getChecks } from "@/lib/healthchecks";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const checks = await getChecks();
    return NextResponse.json(checks);
  } catch (error) {
    console.error("Error al obtener checks:", error);
    return NextResponse.json(
      { error: "Error al obtener checks" },
      { status: 500 }
    );
  }
}
