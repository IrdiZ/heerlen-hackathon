import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/captures/[id] - Get a single capture
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const capture = await prisma.capture.findUnique({
      where: { id },
    });
    
    if (!capture) {
      return NextResponse.json({ error: 'Capture not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      ...capture,
      fields: JSON.parse(capture.fields),
      headings: capture.headings ? JSON.parse(capture.headings) : [],
      buttons: capture.buttons ? JSON.parse(capture.buttons) : [],
    });
  } catch (error) {
    console.error('Failed to fetch capture:', error);
    return NextResponse.json({ error: 'Failed to fetch capture' }, { status: 500 });
  }
}

// DELETE /api/captures/[id] - Delete a single capture
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.capture.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete capture:', error);
    return NextResponse.json({ error: 'Failed to delete capture' }, { status: 500 });
  }
}
