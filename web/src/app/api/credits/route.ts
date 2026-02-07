import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
      headers: {
        'xi-api-key': apiKey,
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!res.ok) {
      throw new Error(`ElevenLabs API error: ${res.status}`);
    }

    const data = await res.json();
    
    return NextResponse.json({
      remaining: data.character_limit - data.character_count,
      total: data.character_limit,
      used: data.character_count,
      tier: data.tier,
      resetsAt: data.next_character_count_reset_unix,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
