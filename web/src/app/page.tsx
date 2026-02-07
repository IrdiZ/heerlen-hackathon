'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { VoiceAgent } from '@/components/VoiceAgent';
import { PIIForm } from '@/components/PIIForm';
import { FormStatus } from '@/components/FormStatus';
import { Transcript } from '@/components/Transcript';
import { FormTemplateSelector, TemplateIndicator } from '@/components/FormTemplateSelector';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ProgressTracker } from '@/components/ProgressTracker';
import { DevPanel } from '@/components/dev';
import { useLocalPII } from '@/hooks/useLocalPII';
import { useExtension } from '@/hooks/useExtension';
import { useRoadmap } from '@/hooks/useRoadmap';
import { swapPlaceholders } from '@/lib/placeholders';
import { FormTemplate, getTemplateById, createFillMapFromTemplate } from '@/lib/form-templates';
import { CreateRoadmapParams, UpdateRoadmapParams } from '@/lib/roadmap-types';

type AppState = 'landing' | 'active';

interface Message {
  role: string;
  content: string;
  timestamp: Date;
}

// Animated button with ripple effect
function AnimatedButton({ 
  children, 
  onClick, 
  className = '',
  variant = 'primary',
  size = 'md'
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}) {
  const baseClasses = "relative overflow-hidden transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-lg hover:shadow-xl",
    secondary: "bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-400",
    ghost: "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-gray-400"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-lg",
    md: "px-4 py-2.5 rounded-lg",
    lg: "px-10 py-4 text-lg rounded-full"
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <motion.span
        className="absolute inset-0 bg-white/20"
        initial={{ scale: 0, opacity: 0.5 }}
        whileTap={{ scale: 4, opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{ borderRadius: '50%', transformOrigin: 'center' }}
      />
      {children}
    </motion.button>
  );
}

// Feature card with hover effects
function FeatureCard({ emoji, title, description, delay = 0 }: { 
  emoji: string; 
  title: string; 
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-400 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {emoji}
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </motion.div>
  );
}

// Scroll-triggered fade-in wrapper
function FadeInOnScroll({ children, className = '', delay = 0 }: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Page transition variants
const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

// Stagger children animation
const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const t = useTranslations();
  const [appState, setAppState] = useState<AppState>('landing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showPIIForm, setShowPIIForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  
  const { piiData, updateField, clearAll, loadDemo, getFilledCount, totalFields } = useLocalPII();
  const { isConnected, formSchema: extensionFormSchema, captureHistory, lastFillResults, error, requestFormSchema, fillForm, clearSchema, selectCapture } = useExtension();
  const { roadmap, createRoadmap, setStepStatus, updateNotes, clearRoadmap, getProgress } = useRoadmap();
  const [showRoadmap, setShowRoadmap] = useState(false);

  // Allow VoiceAgent to set schema directly (for when agent captures via tool)
  const [voiceAgentSchema, setVoiceAgentSchema] = useState<typeof extensionFormSchema | null>(null);

  // Clear voiceAgentSchema when extension captures new data (so new capture shows)
  useEffect(() => {
    if (extensionFormSchema && extensionFormSchema.fields?.length > 0) {
      setVoiceAgentSchema(null);
    }
  }, [extensionFormSchema]);

  // Use the most recently captured schema (extension capture clears voice capture above)
  const formSchema = voiceAgentSchema || extensionFormSchema;

  // Auto-show roadmap when loaded from localStorage on first active
  useEffect(() => {
    if (roadmap && appState === 'active' && !showRoadmap) {
      setShowRoadmap(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]); // Only trigger on appState change, not on every roadmap/showRoadmap change

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

  // Handle schema captured by VoiceAgent tool
  const handleFormCaptured = useCallback((schema: any) => {
    console.log('[Page] VoiceAgent captured schema:', schema);
    setVoiceAgentSchema(schema);
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

  const handleCreateRoadmap = useCallback(async (params: CreateRoadmapParams): Promise<string> => {
    const result = createRoadmap(params);
    setShowRoadmap(true); // Auto-show roadmap when created
    handleMessage({
      role: 'system',
      content: `📍 Roadmap created: "${result.name}" with ${result.steps.length} steps`
    });
    return `Created "${result.name}" with ${result.steps.length} steps. The roadmap is now visible on the page.`;
  }, [createRoadmap, handleMessage]);

  const handleUpdateRoadmap = useCallback(async (params: UpdateRoadmapParams): Promise<string> => {
    if (params.status) {
      setStepStatus(params.stepId, params.status);
      return `Step ${params.stepId} marked as ${params.status}`;
    }
    return 'Updated';
  }, [setStepStatus]);

  // Landing page
  if (appState === 'landing') {
    return (
      <AnimatePresence mode="wait">
        <motion.main
          key="landing"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen bg-slate-950 text-white relative overflow-hidden"
        >
          {/* Gradient mesh background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/20 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[150px]" />
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

          {/* Header */}
          <header className="relative z-10 flex justify-between items-center px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              <span className="font-bold text-lg">Welkom.ai</span>
            </div>
            <LanguageSwitcher />
          </header>

          {/* Hero content */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 pb-20">
            <motion.div 
              className="max-w-4xl text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm mb-8"
              >
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                AI-powered immigration assistant
              </motion.div>

              {/* Main headline */}
              <motion.h1 
                className="text-5xl sm:text-7xl font-bold mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t('landing.tagline').split(' ').slice(0, 2).join(' ')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
                  {t('landing.tagline').split(' ').slice(2).join(' ')}
                </span>
              </motion.h1>

              <motion.p 
                className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Navigate Dutch bureaucracy with ease. Speak any language, get instant help with forms, visas, and documents.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  onClick={() => setAppState('active')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
                >
                  {t('landing.startButton')} →
                </motion.button>
                <button className="px-8 py-4 text-lg font-medium text-slate-300 hover:text-white transition-colors">
                  Learn more
                </button>
              </motion.div>

              {/* Feature cards */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-xl mb-4">🗣️</div>
                  <h3 className="font-semibold text-white mb-1">{t('landing.features.language.title')}</h3>
                  <p className="text-sm text-slate-400">{t('landing.features.language.description')}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-xl mb-4">📋</div>
                  <h3 className="font-semibold text-white mb-1">{t('landing.features.forms.title')}</h3>
                  <p className="text-sm text-slate-400">{t('landing.features.forms.description')}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-xl mb-4">🔒</div>
                  <h3 className="font-semibold text-white mb-1">{t('landing.features.privacy.title')}</h3>
                  <p className="text-sm text-slate-400">{t('landing.features.privacy.description')}</p>
                </div>
              </motion.div>

              {/* Trust indicators */}
              <motion.p 
                className="mt-10 text-sm text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                🇳🇱 Built for the Netherlands • 🔐 {t('landing.noAccount')}
              </motion.p>
            </motion.div>
          </div>
        </motion.main>
      </AnimatePresence>
    );
  }

  // Active conversation view
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key="active"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen bg-gray-50"
      >
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border-b px-4 sm:px-6 py-4 shadow-sm sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <motion.span 
                className="text-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              >
                🌍
              </motion.span>
              <h1 className="text-xl font-bold text-gray-800">{t('landing.title')}</h1>
            </motion.div>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-end">
              <AnimatePresence>
                {selectedTemplate && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <TemplateIndicator
                      template={selectedTemplate}
                      onClick={() => setSelectedTemplate(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatedButton
                onClick={() => setShowTemplates(!showTemplates)}
                variant={showTemplates ? 'secondary' : 'secondary'}
                size="sm"
                className={showTemplates ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : ''}
              >
                📋 {t('header.templates')}
              </AnimatedButton>
              <AnimatedButton
                onClick={() => setShowPIIForm(!showPIIForm)}
                variant="secondary"
                size="sm"
                className={showPIIForm ? 'bg-orange-100 text-orange-700 hover:bg-blue-200' : ''}
              >
                🔒 {t('header.personalDetails')} ({getFilledCount()}/{totalFields})
              </AnimatedButton>
              <AnimatedButton
                onClick={() => setShowRoadmap(!showRoadmap)}
                variant="secondary"
                size="sm"
                className={
                  showRoadmap
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : roadmap
                      ? 'bg-green-50 text-green-600 hover:bg-green-100'
                      : ''
                }
              >
                📍 {t('header.roadmap')} {roadmap ? `(${getProgress()}%)` : ''}
              </AnimatedButton>
              <LanguageSwitcher />
              <AnimatedButton
                onClick={() => setAppState('landing')}
                variant="ghost"
                size="sm"
              >
                ← {t('header.back')}
              </AnimatedButton>
            </div>
          </div>
        </motion.header>

        {/* Roadmap Section (shows when toggled) */}
        <AnimatePresence>
          {showRoadmap && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-0">
                {roadmap ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <ProgressTracker
                      roadmap={roadmap}
                      onSetStatus={setStepStatus}
                      onUpdateNotes={updateNotes}
                      onClear={clearRoadmap}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-lg p-8 text-center"
                  >
                    <motion.div 
                      className="text-5xl mb-4"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      📍
                    </motion.div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('roadmap.empty')}</h2>
                    <p className="text-gray-500">{t('roadmap.emptyDescription')}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left: Voice Agent + Transcript */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Voice control */}
              <FadeInOnScroll>
                <motion.div 
                  className="bg-white rounded-xl shadow-lg p-6 sm:p-8"
                  whileHover={{ 
                    boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <VoiceAgent
                    onFormSchemaRequest={handleFormSchemaRequest}
                    onFormCaptured={handleFormCaptured}
                    onFillForm={handleFillForm}
                    onMessage={handleMessage}
                    onCreateRoadmap={handleCreateRoadmap}
                    onUpdateRoadmap={handleUpdateRoadmap}
                    currentSchema={formSchema}
                  />
                </motion.div>
              </FadeInOnScroll>

              {/* Transcript */}
              <FadeInOnScroll delay={0.1}>
                <motion.div 
                  className="bg-white rounded-xl shadow-lg h-80 sm:h-96"
                  whileHover={{ 
                    boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="px-4 py-3 border-b">
                    <h2 className="font-semibold text-gray-800">{t('transcript.title')}</h2>
                  </div>
                  <div className="h-[calc(100%-52px)]">
                    <Transcript messages={messages} />
                  </div>
                </motion.div>
              </FadeInOnScroll>
            </div>

            {/* Right: Form Status + Templates + PII Form */}
            <div className="space-y-4 sm:space-y-6">
              {/* Form Status */}
              <FadeInOnScroll delay={0.2}>
                <FormStatus
                  schema={formSchema}
                  fillResults={lastFillResults}
                  onClear={clearSchema}
                  isConnected={isConnected}
                  error={error}
                  captureHistory={captureHistory}
                  onSelectCapture={selectCapture}
                />
              </FadeInOnScroll>

              {/* Template-based Fill Button */}
              <AnimatePresence>
                {selectedTemplate && formSchema && formSchema.fields.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <motion.button
                      onClick={handleTemplateBasedFill}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 15px 35px -10px rgba(124, 58, 237, 0.4)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="relative w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      {/* Shimmer effect */}
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          ✨
                        </motion.span>
                        <span>{t('templates.autoFillWith', { template: selectedTemplate.nameEN })}</span>
                      </span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Templates (collapsible with animation) */}
              <AnimatePresence>
                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <FormTemplateSelector
                      piiData={piiData}
                      currentUrl={formSchema?.url}
                      onSelectTemplate={handleTemplateSelect}
                      selectedTemplateId={selectedTemplate?.id}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PII Form (collapsible with animation) */}
              <AnimatePresence>
                {showPIIForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <PIIForm
                      piiData={piiData}
                      onUpdate={updateField}
                      onClear={clearAll}
                      onLoadDemo={loadDemo}
                      filledCount={getFilledCount()}
                      totalFields={totalFields}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>

        {/* Developer Panel */}
        <DevPanel
          piiData={piiData as unknown as Record<string, unknown>}
          formSchema={formSchema as unknown as Record<string, unknown> | null}
          lastFillResults={lastFillResults}
          extensionConnected={isConnected}
        />
      </motion.main>
    </AnimatePresence>
  );
}
