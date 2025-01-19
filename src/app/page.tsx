'use client';

import { useState } from 'react';

export default function Home() {
  const [keywords, setKeywords] = useState('');
  const [businessNames, setBusinessNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate business names');
      }
      
      if (!data.success || !data.names) {
        throw new Error('Invalid response from server');
      }
      
      setBusinessNames(data.names);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      console.error('Error:', err);
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
                <div className="font-semibold">{name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
