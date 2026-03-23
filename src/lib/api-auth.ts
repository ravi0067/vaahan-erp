import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function getAuthSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, error: null };
}

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status });
}

// Serialize Prisma Decimal fields to numbers
export function serializeDecimals<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'object' && 'toNumber' in (obj as Record<string, unknown>)) {
    return (obj as unknown as { toNumber: () => number }).toNumber() as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeDecimals) as unknown as T;
  }
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serializeDecimals(value);
    }
    return result as T;
  }
  return obj;
}
