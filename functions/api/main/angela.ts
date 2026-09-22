type Context = { request: Request; env: Record<string, string | undefined> };

const allowed = new Set(['https://journeyexpertltd.com', 'https://www.journeyexpertltd.com']);
const cors = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
});
const reply = (origin: string, data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: cors(origin) });

const bnFallback = (q: string) => {
  const text = q.toLowerCase();
  if (/যোগাযোগ|ফোন|নাম্বার|ঠিকানা|অফিস|contact/.test(text)) return 'Journey Expert Ltd.-এর অফিস: ১৮৯/এ (২য় তলা), আব্দুল মতিন কমপ্লেক্স, হাজী মরণ আলী রোড, নাবিস্কো মোড়, তেজগাঁও, ঢাকা-১২১৫। WhatsApp/হটলাইন: +8801926400400, টেলিফোন: +8802 9830404।';
  if (/টিকিট|ফ্লাইট|ফেয়ার|ভাড়া/.test(text)) return 'আমরা এয়ার টিকিট, ফেয়ার কোটেশন, বুকিং, রিইস্যু ও রিফান্ড সহায়তা দিই। সঠিক লাইভ ভাড়া জানতে গন্তব্য, যাত্রার তারিখ, যাত্রীর সংখ্যা এবং একমুখী না রিটার্ন—এই তথ্যগুলো লিখুন।';
  if (/ভিসা|visa/.test(text)) return 'আমরা ট্যুরিস্ট, বিজনেস, মেডিকেল ও স্টুডেন্ট ভিসার ডকুমেন্ট প্রস্তুতিতে সহায়তা করি। ভিসার সিদ্ধান্ত সংশ্লিষ্ট দূতাবাসের। দেশ, ভিসার ধরন ও ভ্রমণের সম্ভাব্য তারিখ লিখুন।';
  if (/হজ|ওমরাহ|উমরাহ/.test(text)) return 'আমরা হজ ও ওমরাহ প্যাকেজ, ফ্লাইট, হোটেল ও প্রয়োজনীয় ভ্রমণ সহায়তা দিই। যাত্রীর সংখ্যা এবং সম্ভাব্য মাস লিখুন; যাচাইকৃত প্যাকেজের জন্য +8801926400400 নম্বরে যোগাযোগ করুন।';
  if (/স্টাডি|পড়াশোনা|বিশ্ববিদ্যাল|স্কলারশিপ/.test(text)) return 'JEL Study Abroad উচ্চশিক্ষার কাউন্সেলিং, বিশ্ববিদ্যালয় ও কোর্স নির্বাচন, অ্যাডমিশন, স্কলারশিপ, SOP এবং স্টুডেন্ট ভিসার ডকুমেন্টে সহায়তা করে। আপনার যোগ্যতা ও পছন্দের দেশ লিখুন।';
  return 'আমি অ্যাঞ্জেলা, Journey Expert Ltd.-এর AI সহকারী। এয়ার টিকিট, ভিসা, ট্যুর, হোটেল, হজ-ওমরাহ, মেডিকেল ও হালাল ট্যুরিজম, ইন্স্যুরেন্স, কর্পোরেট ট্রাভেল এবং স্টাডি অ্যাব্রোড সম্পর্কে সাহায্য করতে পারি। আপনি কোন সেবা সম্পর্কে জানতে চান?';
};
const enFallback = (q: string) => {
  const text = q.toLowerCase();
  if (/contact|phone|number|address|office/.test(text)) return 'Journey Expert Ltd. is at 189/A (2nd floor), Abdul Motin Complex, Hazi Moron Ali Road, Nabisco Mor, Tejgaon, Dhaka-1215. WhatsApp/hotline: +8801926400400; telephone: +8802 9830404.';
  if (/ticket|flight|fare/.test(text)) return 'We assist with air tickets, fare quotations, booking, reissue and refunds. For a verified live fare, share the destination, travel date, passenger count, and whether the trip is one-way or return.';
  if (/visa/.test(text)) return 'We assist with document preparation for tourist, business, medical and student visas. Visa decisions belong to the relevant authority. Share the country, visa type and intended travel date.';
  if (/hajj|umrah/.test(text)) return 'We assist with Hajj and Umrah packages, flights, hotels and related travel support. Share the passenger count and preferred month, or contact +8801926400400 for a verified package.';
  if (/study|university|scholarship/.test(text)) return 'JEL Study Abroad helps with counselling, university and course selection, admissions, scholarships, SOPs and student-visa documents. Share your qualification and preferred country.';
  return "I am Angela, Journey Expert Ltd.'s AI assistant. I can help with air tickets, visas, tours, hotels, Hajj and Umrah, medical and halal tourism, insurance, corporate travel and study abroad. Which service do you need?";
};

export async function onRequest({ request, env }: Context): Promise<Response> {
  const origin = request.headers.get('origin') || '';
  if (!allowed.has(origin)) return Response.json({ error: 'origin_not_allowed' }, { status: 403 });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
  if (request.method !== 'POST') return reply(origin, { error: 'method_not_allowed' }, 405);
  let body: any;
  try { body = await request.json(); } catch { return reply(origin, { error: 'invalid_json' }, 400); }
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 2500) : '';
  if (!message) return reply(origin, { error: 'message_required' }, 400);
  const language = body?.language === 'en' ? 'en' : 'bn';
  const fallback = language === 'bn' ? bnFallback(message) : enFallback(message);
  const key = (env.GEMINI_API_KEY || env.GEMINI_TTS_API_KEY)?.trim();
  if (!key) return reply(origin, { reply: fallback, language, mode: 'verified-fallback' });

  const instruction = `You are Angela, the official AI assistant of Journey Expert Ltd., Bangladesh. Services: air ticketing, fare quotation, booking/reissue/refund support, tourist/business/medical/student visa document assistance, tours, hotels, Hajj and Umrah, halal tourism, medical tourism, travel insurance, corporate travel, meet and greet, and JEL Study Abroad. Office: 189/A (2nd floor), Abdul Motin Complex, Hazi Moron Ali Road, Nabisco Mor, Tejgaon, Dhaka-1215. WhatsApp/hotline +8801926400400; telephone +8802 9830404. Never invent live fares, availability, partnerships, visa rules, prices or guarantees. Ask at most one useful follow-up question. Never request passwords, OTPs, payment details or passport numbers. The language selector is authoritative. ${language === 'bn' ? 'Reply only in natural Bengali script, keeping unavoidable proper names unchanged.' : 'Reply only in English.'}`;
  try {
    const model = env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', signal: AbortSignal.timeout(6500),
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: message }] }], systemInstruction: { parts: [{ text: instruction }] }, generationConfig: { temperature: 0.2, maxOutputTokens: 500 } }),
    });
    if (!response.ok) return reply(origin, { reply: fallback, language, mode: 'verified-fallback' });
    const data: any = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('').trim();
    const invalid = !answer || (language === 'bn' && !/[\u0980-\u09FF]/.test(answer)) || (language === 'en' && /[\u0980-\u09FF]/.test(answer));
    return reply(origin, { reply: invalid ? fallback : answer.slice(0, 1800), language, mode: invalid ? 'verified-fallback' : 'ai' });
  } catch {
    return reply(origin, { reply: fallback, language, mode: 'verified-fallback' });
  }
}
