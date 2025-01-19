import { NextResponse } from 'next/server';

const LAMBDA_URL = 'https://wkra32vijugq6i3asctft2qqrm0ujntl.lambda-url.us-east-1.on.aws/';

export async function POST(request: Request) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { keywords } = await request.json();

    if (!keywords || typeof keywords !== 'string') {
      return NextResponse.json(
        { error: 'Keywords are required and must be a string' },
        { status: 400 }
      );
    }

    // Truncate keywords if too long
    const truncatedKeywords = keywords.slice(0, 100);

    // Create a prompt that will generate business names
    const prompt = `Generate 6 unique and creative business names based on these keywords: ${truncatedKeywords}. \n The names should be memorable and suitable for domain names. output should be in given json format. { rows: [ { names: '' }, { names: '' }] }, only respond in valid json format.`;

    const response = await fetch(LAMBDA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Lambda API Error:', errorData);
      throw new Error('Failed to generate business names');
    }

    const data = await response.json();
    console.log(data);
    
    if (!data.generated_text) {
      throw new Error('Invalid response from Lambda');
    }

    try {
      const parsedData = JSON.parse(data.generated_text.trim().toLowerCase());
      console.log(parsedData);
      
      const names = parsedData.rows.map((name: any) => {
        console.log(name, typeof name);
        if (typeof name === 'string') {
          return name.trim();
        }
        if (typeof name === 'object' && name.name) {
          return name.name.trim();
        }
        if (typeof name === 'object' && name.names) {
          return name.names.trim();
        }
        return '';
      });

      if (!Array.isArray(names) || names.length === 0) {
        throw new Error('No valid business names in response');
      }

      return NextResponse.json({ 
        names,
        success: true 
      });
    } catch (parseError) {
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse business names from response');
    }
    
  } catch (error: any) {
    console.error('Error details:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate business names',
        success: false
      },
      { status: error.status || 500 }
    );
  }
}
