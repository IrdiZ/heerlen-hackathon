import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/captures - List all captures
export async function GET() {
  try {
    const captures = await prisma.capture.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    // Parse JSON fields
    const parsed = captures.map(c => ({
      ...c,
      fields: JSON.parse(c.fields),
      headings: c.headings ? JSON.parse(c.headings) : [],
      buttons: c.buttons ? JSON.parse(c.buttons) : [],
    }));
    
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Failed to fetch captures:', error);
    return NextResponse.json({ error: 'Failed to fetch captures' }, { status: 500 });
  }
}

// POST /api/captures - Save a new capture
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const capture = await prisma.capture.create({
      data: {
        url: body.url,
        title: body.title || 'Untitled',
        fields: JSON.stringify(body.fields || []),
        headings: body.headings ? JSON.stringify(body.headings) : null,
        mainContent: body.mainContent || null,
        pageDescription: body.pageDescription || null,
        buttons: body.buttons ? JSON.stringify(body.buttons) : null,
      },
    });
    
    return NextResponse.json({
      ...capture,
      fields: body.fields || [],
      headings: body.headings || [],
      buttons: body.buttons || [],
    });
  } catch (error) {
    console.error('Failed to save capture:', error);
    return NextResponse.json({ error: 'Failed to save capture' }, { status: 500 });
  }
}

// DELETE /api/captures - Delete all captures
export async function DELETE() {
  try {
    await prisma.capture.deleteMany();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete captures:', error);
    return NextResponse.json({ error: 'Failed to delete captures' }, { status: 500 });
  }
}
