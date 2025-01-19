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
    const prompt = `Act as a creative business naming expert. Generate 6 unique and memorable business names based on these keywords: "${truncatedKeywords}".

Follow these guidelines:
1. Create names that are distinctive and stand out in the market
2. Use creative wordplay, alliteration, or clever combinations
3. Consider modern naming trends but avoid being too trendy
4. Make names easy to spell and remember
5. Each name should be 1-3 words maximum
6. Avoid generic or overused terms

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
      console.log(parsedData);
      
      const names = parsedData.rows.map((row: RowType) => {
        console.log(row, typeof row);
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
