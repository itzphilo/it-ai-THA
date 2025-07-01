import { NextRequest, NextResponse } from "next/server";
import candidates from "../../../../data/candidates.json";
import { SessionData } from "../../../../types/session";
import { CandidateSchema } from "../../../../lib/validator/candidateSchema";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const candidate = candidates.find((c) => c.sessionId === id);

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const result = CandidateSchema.safeParse(candidate);
  if (!result.success) {
    const missingFields = result.error.errors.map(e => ({ path: e.path, message: e.message }));
    return NextResponse.json({
      candidate,
      error: "Candidate data incomplete or invalid",
      missingFields
    }, { status: 422 });
  }

  return NextResponse.json(candidate, { status: 200 });
}

