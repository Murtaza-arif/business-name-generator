'use client';

import { useState, FormEvent } from 'react';

interface GenerateResponse {
  names: string[];
  success: boolean;
  error?: string;
}

interface DomainCheckResponse {
  domain: string;
  available: boolean;
  success: boolean;
  error?: string;
}

export default function Home() {
  const [keywords, setKeywords] = useState('');
  const [businessNames, setBusinessNames] = useState<Array<{name: string; domainStatus?: {available: boolean | null; checking: boolean}}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDomainAvailability = async (name: string) => {
    const domainName = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
    
    try {
      const response = await fetch('/api/check-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: domainName }),
      });
      
      const data = await response.json() as DomainCheckResponse;
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check domain');
      }
      
      return data.available;
    } catch (error) {
      console.error('Error checking domain:', error);
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setBusinessNames([]);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords }),
      });
      
      const data = await response.json() as GenerateResponse;
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate business names');
      }
      
      if (!data.success || !data.names) {
        throw new Error('Invalid response from server');
      }
      
      const namesWithDomainStatus = await Promise.all(data.names.map(async (name) => {
        const domainStatus = { available: await checkDomainAvailability(name), checking: false };
        return { name, domainStatus };
      }));
      
      setBusinessNames(namesWithDomainStatus);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      setError(errorMessage);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 md:p-24 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
          AI Business Name Generator
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Enter keywords, industry, or a brief description of your business to generate unique business names
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <textarea
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., sustainable eco-friendly coffee shop, modern design"
            className="w-full text-black p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px] resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !keywords.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? 'Generating Names...' : 'Generate Business Names'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {businessNames.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Generated Business Names:</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {businessNames.map((name, index) => (
              <div
                key={index}
                className="p-4 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="font-semibold">{name.name}</div>
                {name.domainStatus && (
                  <div className="text-sm mt-2">
                    <a
                      href={`https://www.namecheap.com/domains/registration/results/?domain=${name.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`underline hover:underline ${name.domainStatus.available === true ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                    >
                      {name.domainStatus.available === true ? 'Domain Available' : name.domainStatus.available === false ? 'Domain Not Available' : 'Domain Status Unknown'}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
