import { NextRequest, NextResponse } from 'next/server';
import { register, collectDefaultMetrics } from 'prom-client';

// Initialize collection of default metrics
// distinct labels for the frontend app
collectDefaultMetrics({ prefix: 'nextjs_' });

export async function GET(req: NextRequest) {
    try {
        const metrics = await register.metrics();
        return new NextResponse(metrics, {
            headers: {
                'Content-Type': register.contentType,
            },
        });
    } catch (err) {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
