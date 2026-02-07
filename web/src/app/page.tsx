'use client';

import { useState, useCallback } from 'react';
import { VoiceAgent } from '@/components/VoiceAgent';
import { PIIForm } from '@/components/PIIForm';
import { FormStatus } from '@/components/FormStatus';
import { Transcript } from '@/components/Transcript';
import { useLocalPII } from '@/hooks/useLocalPII';
import { useExtension } from '@/hooks/useExtension';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { swapPlaceholders } from '@/lib/placeholders';

type AppState = 'landing' | 'active';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [showPIIForm, setShowPIIForm] = useState(false);
  
  const { piiData, updateField, clearAll, loadDemo, getFilledCount, totalFields } = useLocalPII();
  const { isConnected, formSchema, lastFillResults, error, requestFormSchema, fillForm, clearSchema } = useExtension();
  const { messages, addMessage, clearHistory } = useConversationHistory();

  const handleMessage = useCallback((msg: { role: string; content: string }) => {
    addMessage(msg);
  }, [addMessage]);

  const handleFormSchemaRequest = useCallback(async () => {
    const schema = await requestFormSchema();
    if (schema) {
      handleMessage({ 
        role: 'system', 
        content: `Form captured: ${schema.fields.length} fields detected on "${schema.title}"` 
      });
    }
  }, [requestFormSchema, handleMessage]);

  const handleFillForm = useCallback(async (fieldMappings: Record<string, string>) => {
    // Swap placeholders for real PII values locally
    const realValues = swapPlaceholders(fieldMappings, piiData as unknown as Record<string, string>);
    
    // Send to extension to fill
    const results = await fillForm(realValues);
    
    const filled = results.filter(r => r.status === 'filled').length;
    const failed = results.filter(r => r.status !== 'filled').length;
    
    handleMessage({
      role: 'system',
      content: `Form fill complete: ${filled} fields filled${failed > 0 ? `, ${failed} failed` : ''}`
    });
  }, [piiData, fillForm, handleMessage]);

  // Landing page
  if (appState === 'landing') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          {/* Logo / Title */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              🌍 MigrantAI
            </h1>
            <p className="text-xl text-gray-600">
              Your voice, your language, your guide to the Netherlands
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-3">🗣️</div>
              <h3 className="font-semibold text-gray-800">Any Language</h3>
              <p className="text-sm text-gray-500 mt-1">Speak naturally in your native language</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-semibold text-gray-800">Form Filling</h3>
              <p className="text-sm text-gray-500 mt-1">Auto-fill Dutch government forms</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold text-gray-800">Privacy First</h3>
              <p className="text-sm text-gray-500 mt-1">Your data never leaves your browser</p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setAppState('active')}
            className="px-12 py-5 text-xl font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 shadow-xl"
          >
            Start Conversation
          </button>

          <p className="mt-6 text-sm text-gray-500">
            No account needed • Free to use • Works offline for forms
          </p>
        </div>
      </main>
    );
  }

  // Active conversation view
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            <h1 className="text-xl font-bold text-gray-800">MigrantAI</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPIIForm(!showPIIForm)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showPIIForm 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🔒 Personal Details ({getFilledCount()}/{totalFields})
            </button>
            <button
              onClick={clearHistory}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              🗑️ Clear Conversation
            </button>
            <button
              onClick={() => setAppState('landing')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Voice Agent + Transcript */}
          <div className="lg:col-span-2 space-y-6">
            {/* Voice control */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <VoiceAgent
                onFormSchemaRequest={handleFormSchemaRequest}
                onFillForm={handleFillForm}
                onMessage={handleMessage}
              />
            </div>

            {/* Transcript */}
            <div className="bg-white rounded-xl shadow-lg h-96">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-800">Conversation</h2>
              </div>
              <div className="h-[calc(100%-52px)]">
                <Transcript messages={messages} />
              </div>
            </div>
          </div>

          {/* Right: Form Status + PII Form */}
          <div className="space-y-6">
            {/* Form Status */}
            <FormStatus
              schema={formSchema}
              fillResults={lastFillResults}
              onClear={clearSchema}
              isConnected={isConnected}
              error={error}
            />

            {/* PII Form (collapsible) */}
            {showPIIForm && (
              <PIIForm
                piiData={piiData}
                onUpdate={updateField}
                onClear={clearAll}
                onLoadDemo={loadDemo}
                filledCount={getFilledCount()}
                totalFields={totalFields}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
