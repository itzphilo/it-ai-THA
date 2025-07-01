import { NextResponse } from 'next/server';
import candidates from '../../../data/candidates.json';
import { writeFile } from 'fs/promises';
import isValidEmail from '../../../lib/validator/email';
import isValidIndianPhoneNumber from '../../../lib/validator/phone';

const ITEMS_PER_PAGE = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  const paginatedCandidates = candidates.slice(startIndex, endIndex);
  return NextResponse.json({
    data: paginatedCandidates,
    total: candidates.length,
    page,
    totalPages: Math.ceil(candidates.length / ITEMS_PER_PAGE),
  });
}

export async function POST(request: Request) {
  const requestData = await request.json();
  const newCandidates = Array.isArray(requestData) ? requestData : [requestData];

  const updatedCandidates = candidates.map((c: any) => ({ ...c }));
  const errors = [];
  let added = 0;
  let merged = 0;

  for (const candidate of newCandidates) {
    const existingIdx = updatedCandidates.findIndex((c: any) => c.sessionId === candidate.sessionId);
    if (existingIdx !== -1) {
      const existing = updatedCandidates[existingIdx];
      const mergedFields = { ...existing.fields };
      for (const key in candidate.fields) {
        if (!mergedFields[key] && candidate.fields[key]) {
          mergedFields[key] = candidate.fields[key];
        }
      }
      const emailValid = isValidEmail(mergedFields.email || '');
      const phoneValid = isValidIndianPhoneNumber(mergedFields.phone || '');
      if (!emailValid || !phoneValid) {
        errors.push({
          sessionId: candidate.sessionId,
          email: mergedFields.email,
          phone: mergedFields.phone,
          emailValid,
          phoneValid
        });
        continue;
      }
      updatedCandidates[existingIdx] = { ...existing, fields: mergedFields };
      merged++;
    } else {
      const emailValid = isValidEmail(candidate.fields?.email || '');
      const phoneValid = isValidIndianPhoneNumber(candidate.fields?.phone || '');
      if (!emailValid || !phoneValid) {
        errors.push({
          sessionId: candidate.sessionId,
          email: candidate.fields?.email,
          phone: candidate.fields?.phone,
          emailValid,
          phoneValid
        });
        continue;
      }
      updatedCandidates.push(candidate);
      added++;
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({
      message: 'Invalid candidate data',
      errors
    }, { status: 400 });
  }

  const data = JSON.stringify(updatedCandidates, null, 2);
  await writeFile('app/data/candidates.json', data, { encoding: 'utf-8' });
  return NextResponse.json({
    message: 'Candidates list updated.',
    added,
    merged
  }, { status: 200 });
}