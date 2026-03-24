import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// Exotel credentials (server-side only)
const EXOTEL_API_KEY = process.env.EXOTEL_API_KEY || '';
const EXOTEL_API_TOKEN = process.env.EXOTEL_API_TOKEN || '';
const EXOTEL_ACCOUNT_SID = process.env.EXOTEL_ACCOUNT_SID || '';
const EXOTEL_CALLER_ID = process.env.EXOTEL_CALLER_ID || '';

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    // Only SUPER_ADMIN, OWNER, MANAGER can make calls
    const allowedRoles = ['SUPER_ADMIN', 'OWNER', 'MANAGER'];
    if (!allowedRoles.includes(session!.user.role)) {
      return NextResponse.json({ error: 'Unauthorized: Only owners and managers can make calls' }, { status: 403 });
    }

    const { customerPhone, agentPhone, action } = await request.json();

    // Test connection
    if (action === 'test') {
      if (!EXOTEL_API_KEY || !EXOTEL_ACCOUNT_SID) {
        return NextResponse.json({ 
          connected: false, 
          error: 'Exotel credentials not configured. Add EXOTEL_API_KEY, EXOTEL_API_TOKEN, EXOTEL_ACCOUNT_SID, EXOTEL_CALLER_ID to environment variables.' 
        });
      }

      const res = await fetch(
        `https://api.exotel.com/v1/Accounts/${EXOTEL_ACCOUNT_SID}`,
        {
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${EXOTEL_API_KEY}:${EXOTEL_API_TOKEN}`).toString('base64'),
          }
        }
      );
      const ok = res.status === 200;
      return NextResponse.json({ connected: ok, status: res.status });
    }

    // Make a call
    if (!customerPhone || !customerPhone.match(/^\d{10}$/)) {
      return NextResponse.json({ error: 'Invalid customer phone number. Must be 10 digits.' }, { status: 400 });
    }

    if (!EXOTEL_API_KEY || !EXOTEL_ACCOUNT_SID || !EXOTEL_CALLER_ID) {
      return NextResponse.json({ error: 'Exotel not configured on server.' }, { status: 500 });
    }

    const connectTo = agentPhone || session!.user.phone || customerPhone;

    const formData = new URLSearchParams();
    formData.append('From', customerPhone);
    formData.append('To', connectTo);
    formData.append('CallerId', EXOTEL_CALLER_ID);

    const exotelRes = await fetch(
      `https://api.exotel.com/v1/Accounts/${EXOTEL_ACCOUNT_SID}/Calls/connect.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${EXOTEL_API_KEY}:${EXOTEL_API_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const data = await exotelRes.json();

    if (data.Call) {
      return NextResponse.json({
        success: true,
        callSid: data.Call.Sid,
        status: data.Call.Status,
        from: data.Call.From,
        to: data.Call.To,
      });
    } else {
      return NextResponse.json({ error: 'Exotel API error', details: data }, { status: 500 });
    }

  } catch (err: any) {
    console.error('Calls API Error:', err);
    return NextResponse.json({ error: err.message || 'Call failed' }, { status: 500 });
  }
}
