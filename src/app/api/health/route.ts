import { NextResponse } from 'next/server';

// Dummy health check for DB, Auth, Liveblocks, Stripe
export async function GET() {
  // TODO: Replace with real checks
  const checks = [
    { name: 'database', healthy: true },
    { name: 'auth', healthy: true },
    { name: 'liveblocks', healthy: true },
    { name: 'stripe', healthy: true },
  ];
  const allHealthy = checks.every(c => c.healthy);
  return NextResponse.json({
    status: allHealthy ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  }, { status: allHealthy ? 200 : 503 });
}
