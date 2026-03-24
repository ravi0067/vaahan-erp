import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Exotel hits this webhook when the customer picks up the call
// We return ExoML (like TwiML) that tells Exotel what to say
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const companyName = url.searchParams.get('company') || 'VaahanERP';
    const purpose = url.searchParams.get('purpose') || 'offer';
    const customerName = url.searchParams.get('name') || 'Sir';
    const offerDetails = url.searchParams.get('offer') || '';
    const lang = url.searchParams.get('lang') || 'hi-IN';

    // Generate the voice script based on purpose
    const script = generateScript(companyName, purpose, customerName, offerDetails);

    // Return ExoML response
    const exoml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female" language="${lang}">${script}</Say>
  <Say voice="female" language="${lang}">Agar aapko koi aur jaankari chahiye toh hum aapko WhatsApp par bhi bhej denge. Dhanyavaad, aapka din shubh ho!</Say>
</Response>`;

    return new NextResponse(exoml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (err) {
    console.error('Call Flow Error:', err);
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female" language="hi-IN">Namaste, humne aapko ek important update dene ke liye call kiya tha. Kripya humse sampark karein. Dhanyavaad.</Say>
</Response>`;
    return new NextResponse(fallback, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

// Also handle GET (Exotel sometimes uses GET for webhooks)
export async function GET(request: NextRequest) {
  return POST(request);
}

function generateScript(company: string, purpose: string, name: string, offer: string): string {
  const greeting = `Namaste ${name}, mai ${company} se bol rahi hoon.`;

  switch (purpose) {
    case 'insurance_expiry':
      return `${greeting} Aapki gaadi ki insurance ki expiry date nazdeek aa rahi hai. Hum aapko yaad dilana chahte the ki samay par insurance renew karna bahut zaroori hai. Agar aap chahein toh hum aapke liye best rate par insurance renew karva sakte hain. ${offer ? offer : 'Abhi renew karvayen aur special discount paayein.'}`;

    case 'service_due':
      return `${greeting} Aapki gaadi ki service due ho gayi hai. Regular service se aapki gaadi ki performance aur life dono badhti hai. ${offer ? offer : 'Abhi service book karein aur free checkup ka fayda uthaayein.'} Kya hum aapke liye appointment fix kar dein?`;

    case 'offer':
    case 'promotion':
      return `${greeting} Humne aapke liye ek khaas offer lekar call kiya hai. ${offer ? offer : 'Is samay humare yahan bahut achhe offers chal rahe hain, jaise exchange bonus, low EMI options, aur free accessories.'} Yeh offer sirf seema samay ke liye hai, toh jaldi se humare showroom par aayen!`;

    case 'followup':
      return `${greeting} Aapne hamare showroom mein gaadi ke baare mein puchha tha. Hum jaanna chahte the ki kya aapne koi faisla kiya hai? Agar koi sawaal ho toh hum madad karne ke liye taiyaar hain. ${offer ? offer : 'Aaj booking karein toh special discount milega.'}`;

    case 'delivery':
      return `${greeting} Badhai ho! Aapki gaadi delivery ke liye taiyaar hai. Kripya apne documents lekar humare showroom par aayen. ${offer ? offer : 'Hum aapka intezaar kar rahe hain!'}`;

    case 'payment_reminder':
      return `${greeting} Yeh ek gentle reminder hai ki aapki booking ka baaki payment pending hai. Kripya jaldi se payment complete karein taaki hum aapki delivery process aage badha sakein. ${offer ? offer : 'Koi bhi samasya ho toh humse sampark karein.'}`;

    case 'birthday':
      return `${greeting} Aapko janamdin ki bahut bahut badhaiyan! Is khaas din par humare paas aapke liye ek special birthday offer hai. ${offer ? offer : 'Showroom par aayen aur exclusive birthday discount ka fayda uthaayein!'}`;

    case 'custom':
      return `${greeting} ${offer || 'Humne aapko ek important update dene ke liye call kiya hai. Kripya humare showroom se sampark karein.'}`;

    default:
      return `${greeting} ${offer ? offer : 'Humne aapko ek important jaankari dene ke liye call kiya hai. Aapke liye humare paas kuch khaas hai. Humare showroom par aayen ya humse WhatsApp par sampark karein.'}`;
  }
}
