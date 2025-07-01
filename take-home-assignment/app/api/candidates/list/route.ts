import { NextResponse } from 'next/server';
import candidates from '../../../data/candidates.json';
import { writeFile } from 'fs/promises';
  
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
  const data = JSON.stringify([...candidates, ...requestData], null, 2);
  await writeFile('app/data/candidates.json', data, { encoding: 'utf-8' });
  return NextResponse.json({
    message: 'Candidates list updated.',
  }, { status: 200 });
}
