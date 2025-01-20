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
      const verisignData = whoisData['whois.verisign-grs.com'];
      
      if (verisignData && typeof verisignData === 'object' && 'Domain Status' in verisignData) {
        const domainStatus = Array.isArray(verisignData['Domain Status']) 
          ? verisignData['Domain Status']
          : [];
        const isAvailable = domainStatus.length === 0;

        return NextResponse.json({
          domain,
          available: isAvailable,
          success: true
        });
      }

      // If we don't get expected data structure, assume domain might be available
      return NextResponse.json({
        domain,
        available: true,
        success: true
      });
    } catch (whoisError) {
      console.log('Error checking domain with whoiser:', whoisError);
      
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
