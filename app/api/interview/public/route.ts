import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json(
      { error: 'Public interview feature is currently under maintenance' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error in public interview API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
