'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { VoiceAgent } from '@/components/VoiceAgent';
import { PIIForm } from '@/components/PIIForm';
import { FormStatus } from '@/components/FormStatus';
import { Transcript } from '@/components/Transcript';
import { FormTemplateSelector, TemplateIndicator } from '@/components/FormTemplateSelector';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLocalPII } from '@/hooks/useLocalPII';
import { useExtension } from '@/hooks/useExtension';
import { swapPlaceholders } from '@/lib/placeholders';
import { FormTemplate, getTemplateById, createFillMapFromTemplate } from '@/lib/form-templates';

type AppState = 'landing' | 'active';

interface Message {
  role: string;
  content: string;
  timestamp: Date;
}

export default function Home() {
  const t = useTranslations();
  const [appState, setAppState] = useState<AppState>('landing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showPIIForm, setShowPIIForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  
  const { piiData, updateField, clearAll, loadDemo, getFilledCount, totalFields } = useLocalPII();
  const { isConnected, formSchema, lastFillResults, error, requestFormSchema, fillForm, clearSchema } = useExtension();

  // Auto-select template when form schema is captured with a detected template
  useEffect(() => {
    if (formSchema?.detectedTemplate && !selectedTemplate) {
      const template = getTemplateById(formSchema.detectedTemplate.id);
      if (template) {
        setSelectedTemplate(template);
        setShowTemplates(true);
      }
    }
  }, [formSchema, selectedTemplate]);

  const handleMessage = useCallback((msg: { role: string; content: string }) => {
    setMessages(prev => [...prev, { ...msg, timestamp: new Date() }]);
  }, []);

  const handleFormSchemaRequest = useCallback(async () => {
    const schema = await requestFormSchema();
    if (schema) {
      let message = `Form captured: ${schema.fields.length} fields detected on "${schema.title}"`;
      
      // If template was auto-detected, mention it
      if (schema.detectedTemplate) {
        message += ` (Template detected: ${schema.detectedTemplate.nameEN})`;
      }
      
      handleMessage({ role: 'system', content: message });
    }
  }, [requestFormSchema, handleMessage]);

  const handleTemplateSelect = useCallback((template: FormTemplate) => {
    setSelectedTemplate(template);
    handleMessage({
      role: 'system',
      content: `Template selected: ${template.nameEN} (${template.nameNL})`
    });
  }, [handleMessage]);

  const handleTemplateBasedFill = useCallback(async () => {
    if (!selectedTemplate || !formSchema) return;
    
    // Create fill map from template and actual form fields
    const formFieldIds = formSchema.fields.map(f => f.id);
    const fillMap = createFillMapFromTemplate(selectedTemplate, formFieldIds);
    
    // Swap placeholders for real PII values
    const realValues = swapPlaceholders(fillMap, piiData as unknown as Record<string, string>);
    
    // Send to extension to fill
    const results = await fillForm(realValues);
    
    const filled = results.filter(r => r.status === 'filled').length;
    const failed = results.filter(r => r.status !== 'filled').length;
    
    handleMessage({
      role: 'system',
      content: `Template-based fill complete: ${filled} fields filled${failed > 0 ? `, ${failed} failed` : ''}`
    });
  }, [selectedTemplate, formSchema, piiData, fillForm, handleMessage]);

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
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in">
        {/* Language Switcher - Top Right */}
        <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
          <LanguageSwitcher />
        </div>

        <div className="max-w-2xl text-center">
          {/* Logo / Title */}
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              🌍 {t('landing.title')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              {t('landing.tagline')}
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 transition-transform">
              <div className="text-3xl mb-3">🗣️</div>
              <h3 className="font-semibold text-gray-800">{t('landing.features.language.title')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('landing.features.language.description')}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 transition-transform">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-semibold text-gray-800">{t('landing.features.forms.title')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('landing.features.forms.description')}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 transition-transform">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold text-gray-800">{t('landing.features.privacy.title')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('landing.features.privacy.description')}</p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setAppState('active')}
            className="px-10 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 transform hover:scale-105 active:scale-100 shadow-xl hover:shadow-2xl"
          >
            {t('landing.startButton')}
          </button>

          <p className="mt-6 text-sm text-gray-500">
            {t('landing.noAccount')}
          </p>
        </div>
      </main>
    );
  }

  // Active conversation view
  return (
    <main className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Header */}
      <header className="bg-white border-b px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            <h1 className="text-xl font-bold text-gray-800">{t('landing.title')}</h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-end">
            {selectedTemplate && (
              <TemplateIndicator
                template={selectedTemplate}
                onClick={() => setSelectedTemplate(null)}
              />
            )}
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md ${
                showTemplates 
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📋 {t('header.templates')}
            </button>
            <button
              onClick={() => setShowPIIForm(!showPIIForm)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md ${
                showPIIForm 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🔒 {t('header.personalDetails')} ({getFilledCount()}/{totalFields})
            </button>
            <LanguageSwitcher />
            <button
              onClick={() => setAppState('landing')}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-100"
            >
              ← {t('header.back')}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left: Voice Agent + Transcript */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Voice control */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 sm:p-8">
              <VoiceAgent
                onFormSchemaRequest={handleFormSchemaRequest}
                onFillForm={handleFillForm}
                onMessage={handleMessage}
              />
            </div>

            {/* Transcript */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-80 sm:h-96">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-800">{t('transcript.title')}</h2>
              </div>
              <div className="h-[calc(100%-52px)]">
                <Transcript messages={messages} />
              </div>
            </div>
          </div>

          {/* Right: Form Status + Templates + PII Form */}
          <div className="space-y-4 sm:space-y-6">
            {/* Form Status */}
            <FormStatus
              schema={formSchema}
              fillResults={lastFillResults}
              onClear={clearSchema}
              isConnected={isConnected}
              error={error}
            />

            {/* Template-based Fill Button */}
            {selectedTemplate && formSchema && formSchema.fields.length > 0 && (
              <button
                onClick={handleTemplateBasedFill}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>✨</span>
                <span>{t('templates.autoFillWith', { template: selectedTemplate.nameEN })}</span>
              </button>
            )}

            {/* Form Templates (collapsible with animation) */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showTemplates ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0'}`}>
              {showTemplates && (
                <FormTemplateSelector
                  piiData={piiData}
                  currentUrl={formSchema?.url}
                  onSelectTemplate={handleTemplateSelect}
                  selectedTemplateId={selectedTemplate?.id}
                />
              )}
            </div>

            {/* PII Form (collapsible with animation) */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showPIIForm ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0'}`}>
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
      </div>
    </main>
  );
}
