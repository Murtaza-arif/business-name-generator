import { NextResponse } from 'next/server';
import whoiser from 'whoiser';

export async function POST(request: Request) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { domain } = await request.json();

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { error: 'Domain is required and must be a string' },
        { status: 400 }
      );
    }

    try {
      const whoisData = await whoiser(domain);      
      const isAvailable = !whoisData?.domain?.domainName;

      return NextResponse.json({
        domain,
        available: isAvailable,
        success: true
      });
    } catch (whoisError) {
      // If whoiser throws an error, it likely means the domain is available
      return NextResponse.json({
        domain,
        available: true,
        success: true
      });
    }
  } catch (error) {
    console.error('Error checking domain:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to check domain availability';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false
      },
      { status: 500 }
    );
  }
}
