type Context = { request: Request; env: Record<string, string | undefined> };

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
});

const clean = (value: unknown, max: number) => typeof value === 'string'
  ? value.replace(/\s+/g, ' ').trim().slice(0, max)
  : '';

export async function onRequest({ request, env }: Context): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'origin_not_allowed' }, 403);
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) return json({ error: 'json_required' }, 415);

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > 12_000) return json({ error: 'payload_too_large' }, 413);
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return json({ error: 'invalid_json' }, 400); }

  const preferredCountry = clean(body.preferredCountry, 80);
  const educationLevel = clean(body.educationLevel, 80);
  const budgetRange = clean(body.budgetRange, 80);
  const interestArea = clean(body.interestArea, 100);
  const gpa = clean(body.gpa, 60);
  if (!interestArea || !gpa) return json({ error: 'subject_and_result_required' }, 400);
  if (!env.GEMINI_API_KEY) return json({ error: 'course_planning_temporarily_unavailable', retryable: true }, 503);

  const instruction = `You are a cautious study-planning assistant for JEL Study Abroad in Bangladesh.
Suggest exactly three real university programs only as preliminary research starting points for this student profile:
- Country: ${preferredCountry || 'Open'}
- Study level: ${educationLevel || 'Open'}
- Budget direction: ${budgetRange || 'Not decided'}
- Subject: ${interestArea}
- Academic result: ${gpa}

Never claim live seats, guaranteed admission, visa probability, permanent-residency pathways, confirmed JEL partnerships, acceptance rates, scholarships or current fees. Never invent a university or program. Every reason must state that official requirements, fee and intake availability require verification. If duration or fee is uncertain, write "Verify on official university website".

Return JSON only as an array of three objects with string fields: courseName, university, country, duration, approxTuition, reason.`;

  const model = env.GEMINI_MODEL || 'gemini-3.8-flash';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: instruction }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.15, maxOutputTokens: 1100 },
      }),
    });
    if (!response.ok) return json({ error: 'course_planning_temporarily_unavailable', retryable: true }, 503);
    const provider: any = await response.json();
    const text = provider?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('').trim();
    if (!text) return json({ error: 'course_planning_empty_response', retryable: true }, 503);
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return json({ error: 'course_planning_invalid_response', retryable: true }, 503);
    return json(parsed.slice(0, 3));
  } catch {
    return json({ error: 'course_planning_temporarily_unavailable', retryable: true }, 503);
  } finally {
    clearTimeout(timer);
  }
}
