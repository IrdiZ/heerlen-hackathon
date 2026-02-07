'use client';

import { useState } from 'react';
import { useExtension } from '@/hooks/useExtension';

export default function TestExtensionPage() {
  const { isConnected, formSchema, lastFillResults, error, requestFormSchema, fillForm, clearSchema } = useExtension();
  const [testFillData, setTestFillData] = useState('');

  const handleTestFill = async () => {
    try {
      const data = JSON.parse(testFillData);
      await fillForm(data);
    } catch (e) {
      alert('Invalid JSON: ' + (e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Extension Test Page</h1>

        {/* Connection Status */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Extension Connected' : 'Extension Not Connected'}</span>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
              Error: {error}
            </div>
          )}
        </div>

        {/* Capture Form */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Capture Form Schema</h2>
          <button
            onClick={requestFormSchema}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Capture Current Page Form
          </button>
          
          {formSchema && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Captured Schema ({formSchema.fields.length} fields)</h3>
                <button onClick={clearSchema} className="text-sm text-gray-500 hover:text-gray-700">
                  Clear
                </button>
              </div>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-64">
                {JSON.stringify(formSchema, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Fill Form */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Test Form Fill</h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter JSON object with field IDs as keys and values to fill:
          </p>
          <textarea
            value={testFillData}
            onChange={(e) => setTestFillData(e.target.value)}
            placeholder='{"voornaam": "Test", "achternaam": "User"}'
            className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
          />
          <button
            onClick={handleTestFill}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Fill Form
          </button>

          {lastFillResults.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Fill Results</h3>
              <div className="space-y-1">
                {lastFillResults.map((result, i) => (
                  <div key={i} className={`text-sm ${result.status === 'filled' ? 'text-green-600' : 'text-red-600'}`}>
                    {result.field}: {result.status}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sample Form for Testing */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Sample Form (for testing capture)</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input id="firstName" name="firstName" type="text" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input id="lastName" name="lastName" type="text" className="w-full p-2 border rounded" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input id="email" name="email" type="email" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <select id="country" name="country" className="w-full p-2 border rounded">
                <option value="">Select...</option>
                <option value="NL">Netherlands</option>
                <option value="DE">Germany</option>
                <option value="BE">Belgium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="gender" value="male" /> Male
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="gender" value="female" /> Female
                </label>
              </div>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-gray-500 text-sm">
          This page is for testing the extension. Open it, then use the extension popup to capture the form.
        </p>
      </div>
    </div>
  );
}
