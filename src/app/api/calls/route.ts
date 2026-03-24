import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// Exotel credentials (server-side only)
const EXOTEL_API_KEY = process.env.EXOTEL_API_KEY || '';
const EXOTEL_API_TOKEN = process.env.EXOTEL_API_TOKEN || '';
const EXOTEL_ACCOUNT_SID = process.env.EXOTEL_ACCOUNT_SID || '';
const EXOTEL_CALLER_ID = process.env.EXOTEL_CALLER_ID || '';
const APP_URL = process.env.NEXTAUTH_URL || 'https://vaahan-erp.vercel.app';

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    // Only SUPER_ADMIN, OWNER, MANAGER can make calls
    const allowedRoles = ['SUPER_ADMIN', 'OWNER', 'MANAGER'];
    if (!allowedRoles.includes(session!.user.role)) {
      return NextResponse.json({ error: 'Unauthorized: Only owners and managers can make calls' }, { status: 403 });
    }

    const body = await request.json();
    const { customerPhone, action, purpose, customerName, companyName, offerDetails, lang } = body;

    // Test connection
    if (action === 'test') {
      if (!EXOTEL_API_KEY || !EXOTEL_ACCOUNT_SID) {
        return NextResponse.json({ 
          connected: false, 
          error: 'Exotel credentials not configured.' 
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
      return NextResponse.json({ connected: res.status === 200, status: res.status });
    }

    // Validate phone
    if (!customerPhone || !customerPhone.match(/^\d{10}$/)) {
      return NextResponse.json({ error: 'Invalid phone number. Must be 10 digits.' }, { status: 400 });
    }

    if (!EXOTEL_API_KEY || !EXOTEL_ACCOUNT_SID || !EXOTEL_CALLER_ID) {
      return NextResponse.json({ error: 'Exotel not configured on server.' }, { status: 500 });
    }

    // Build the flow webhook URL with parameters
    const flowParams = new URLSearchParams();
    flowParams.set('company', companyName || 'VaahanERP');
    flowParams.set('purpose', purpose || 'offer');
    flowParams.set('name', customerName || 'Sir');
    if (offerDetails) flowParams.set('offer', offerDetails);
    flowParams.set('lang', lang || 'hi-IN');

    const flowUrl = `${APP_URL}/api/calls/flow?${flowParams.toString()}`;

    // Exotel call with voice flow
    const formData = new URLSearchParams();
    formData.append('From', customerPhone);
    formData.append('To', EXOTEL_CALLER_ID); // Exotel virtual number handles the flow
    formData.append('CallerId', EXOTEL_CALLER_ID);
    formData.append('Url', flowUrl); // This webhook returns ExoML with the AI voice script

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
        purpose: purpose || 'offer',
        script: 'AI Voice Agent will speak to customer in Hindi',
      });
    } else {
      return NextResponse.json({ error: 'Exotel API error', details: data }, { status: 500 });
    }

  } catch (err: any) {
    console.error('Calls API Error:', err);
    return NextResponse.json({ error: err.message || 'Call failed' }, { status: 500 });
  }
}
