import { NextRequest, NextResponse } from "next/server";
import candidates from "../../../../data/candidates.json";
import { SessionData } from "../../../../types/session";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const candidate = candidates.find((c) => c.sessionId === id);

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  return NextResponse.json(candidate, { status: 200 });
}

