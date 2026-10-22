import { connection, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  await connection();
  const h = request.headers;
  return Response.json({
    'x-forwarded-for': h.get('x-forwarded-for'),
    'x-real-ip': h.get('x-real-ip'),
    'x-vercel-forwarded-for': h.get('x-vercel-forwarded-for'),
  });
}
