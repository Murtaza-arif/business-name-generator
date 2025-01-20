import { NextResponse } from 'next/server';

const LAMBDA_URL = 'https://wkra32vijugq6i3asctft2qqrm0ujntl.lambda-url.us-east-1.on.aws/';

interface LambdaResponse {
  generated_text: string;
}

type RowType = string | {
  names?: string;
  name?: string;
};

interface ParsedResponse {
  rows: RowType[];
}

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
    const prompt = `Act as a modern branding expert specializing in viral, trending business names. Generate 6 catchy and contemporary business names based on these keywords: "${truncatedKeywords}".

Follow these trendy naming patterns:
1. Use modern prefixes/suffixes: -ly, -ify, -io, -ai, -tech, -labs
2. Consider popular trends:
   - AI/Tech-inspired names (e.g., using 'AI', 'Tech', 'Smart')
   - Web3/Crypto-style names (removing vowels, using 'X', 'Z')
   - Minimalist single words
   - Compound words (combining two relevant terms)
3. Make it social media friendly:
   - Easy to hashtag
   - Short enough for handles
   - Memorable for viral potential
4. Use these techniques:
   - Intentional misspellings (e.g., Lyft, Fiverr)
   - Letter substitutions (e.g., using 'Z' instead of 'S')
   - Blended words (e.g., Instagram = Instant + Telegram)
5. Keep names under 12 characters when possible
6. Make it easy to pronounce at first glance

Format the response as a JSON object like this: { rows: [ { names: 'business name' } ] }
Only respond with the JSON, no additional text or explanations.`;

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

    const data = await response.json() as LambdaResponse;
    console.log(data);
    
    if (!data.generated_text) {
      throw new Error('Invalid response from Lambda');
    }

    try {
      const parsedData = JSON.parse(data.generated_text.trim().toLowerCase()) as ParsedResponse;
      
      const names = parsedData.rows.map((row: RowType) => {
        if (typeof row === 'string') {
          return row.trim();
        }
        if (typeof row === 'object') {
          if (row.name) {
            return row.name.trim();
          }
          if (row.names) {
            return row.names.trim();
          }
        }
        return '';
      }).filter(name => name !== '');

      if (names.length === 0) {
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
    
  } catch (error) {
    console.error('Error details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate business names';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false
      },
      { status: 500 }
    );
  }
}
