'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceAgent } from '@/components/VoiceAgent';

import { FormStatus } from '@/components/FormStatus';
import { Transcript } from '@/components/Transcript';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ProgressTracker } from '@/components/ProgressTracker';
import { DevPanel } from '@/components/dev';
import { CountrySelector } from '@/components/CountrySelector';
import { useLocalPII } from '@/hooks/useLocalPII';
import { useExtension } from '@/hooks/useExtension';
import { useRoadmap } from '@/hooks/useRoadmap';
import { swapPlaceholders } from '@/lib/placeholders';
import { CreateRoadmapParams, UpdateRoadmapParams } from '@/lib/roadmap-types';
import { isRTL, type Locale } from '@/i18n/config';

type AppState = 'landing' | 'active';

interface Message {
  role: string;
  content: string;
  timestamp: Date;
}

// Panel types for the active view
type ActivePanel = 'forms' | 'roadmap' | null;

export default function Home() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const rtl = isRTL(locale);
  const [appState, setAppState] = useState<AppState>('landing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  const { piiData } = useLocalPII();
  const { isConnected, formSchema: extensionFormSchema, captureHistory, lastFillResults, error, requestFormSchema, fillForm, clearSchema, selectCapture, removeCapture } = useExtension();
  const { roadmap, createRoadmap, setStepStatus, updateNotes, clearRoadmap, getProgress } = useRoadmap();

  const [voiceAgentSchema, setVoiceAgentSchema] = useState<typeof extensionFormSchema | null>(null);

  useEffect(() => {
    if (extensionFormSchema && extensionFormSchema.fields?.length > 0) {
      setVoiceAgentSchema(null);
    }
  }, [extensionFormSchema]);

  const formSchema = voiceAgentSchema || extensionFormSchema;

  // Auto-show roadmap panel when loaded
  useEffect(() => {
    if (roadmap && appState === 'active' && activePanel === null) {
      setActivePanel('roadmap');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);

  // Debug: expose roadmap test on window for console testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__testRoadmap = () => {
        const testParams: CreateRoadmapParams = {
          name: 'Test Roadmap - Turkey to Netherlands',
          steps: [
            { title: 'Employer submits IND application', description: 'Your employer files the HSM residence permit application.', estimatedTime: '2-4 weeks', sources: [{ label: 'IND Official', url: 'https://ind.nl/en/residence-permits/work/highly-skilled-migrant' }] },
            { title: 'Receive IND approval', description: 'IND processes and approves the application.', estimatedTime: '2-3 weeks', sources: [{ label: 'IND Processing', url: 'https://ind.nl/en' }] },
            { title: 'Apply for MVV at consulate', description: 'Book appointment at Dutch consulate, bring passport and approval letter.', estimatedTime: '1-2 weeks', sources: [{ label: 'MVV Info', url: 'https://ind.nl/en/short-stay/the-provisional-residence-permit-mvv' }] },
            { title: 'Register at gemeente', description: 'Register address at municipality within 5 days. Get BSN.', estimatedTime: '1-2 weeks', sources: [{ label: 'BRP Registration', url: 'https://www.government.nl/topics/registration-with-a-municipality-brp' }] },
            { title: 'Collect residence permit', description: 'Pick up VVR card at IND desk.', estimatedTime: '1-2 weeks', sources: [{ label: 'IND Desks', url: 'https://ind.nl/en/service-and-contact/ind-desks' }] },
            { title: 'Open bank account', description: 'Open Dutch bank account with BSN and passport.', estimatedTime: '1-2 weeks', sources: [{ label: 'Banking Guide', url: 'https://www.iamexpat.nl/expat-info/banking-netherlands' }] },
            { title: 'Get health insurance', description: 'Mandatory within 4 months. Basic package ~€130/month.', estimatedTime: '1 day', sources: [{ label: 'Health Insurance', url: 'https://www.rijksoverheid.nl/onderwerpen/zorgverzekering' }] },
          ],
        };
        const result = createRoadmap(testParams);
        setActivePanel('roadmap');
        setAppState('active');
        console.log('[TestRoadmap] Created:', result);
        return result;
      };
      console.log('[Welkom.ai] Debug: type __testRoadmap() in console to test roadmap pipeline');
    }
  }, [createRoadmap]);

  const handleMessage = useCallback((msg: { role: string; content: string }) => {
    setMessages(prev => [...prev, { ...msg, timestamp: new Date() }]);
  }, []);

  const handleFormCaptured = useCallback((schema: any) => {
    setVoiceAgentSchema(schema);
  }, []);

  const handleFormSchemaRequest = useCallback(async () => {
    const schema = await requestFormSchema();
    if (schema) {
      let message = `Form captured: ${schema.fields.length} fields detected on "${schema.title}"`;
      if (schema.detectedTemplate) {
        message += ` (Template detected: ${schema.detectedTemplate.nameEN})`;
      }
      handleMessage({ role: 'system', content: message });
    }
  }, [requestFormSchema, handleMessage]);

  const handleFillForm = useCallback(async (fieldMappings: Record<string, string>) => {
    const realValues = swapPlaceholders(fieldMappings, piiData as unknown as Record<string, string>);
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
    setActivePanel('roadmap');
    handleMessage({
      role: 'system',
      content: `Roadmap created: "${result.name}" with ${result.steps.length} steps`
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

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  // ─── Landing ───
  if (appState === 'landing') {
    return (
      <AnimatePresence mode="wait">
        <motion.main
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="welkom-landing"
        >
          {/* Subtle ambient light */}
          <div className="landing-ambient">
            <div className="landing-ambient-orb landing-ambient-orb--warm" />
            <div className="landing-ambient-orb landing-ambient-orb--cool" />
          </div>

          {/* Grain overlay */}
          <div className="grain-overlay" />

          {/* Nav */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="landing-nav"
          >
            <div className="landing-logo">
              <div className="landing-logo-dot" />
              <span>welkom.ai</span>
            </div>
            <LanguageSwitcher />
          </motion.nav>

          {/* Hero */}
          <div className="landing-hero">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="landing-hero-text"
            >
              <h1 className="landing-title">
                <span className="landing-title-line">{t('landing.heroLine1')}</span>
                <span className="landing-title-line landing-title-accent">{t('landing.heroLine2')}</span>
              </h1>
              <p className="landing-subtitle">
                {t('landing.subtitle')}
              </p>
            </motion.div>

            {/* Orb */}
            <motion.div
              className="landing-orb-wrapper"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="landing-orb">
                <div className="landing-orb-ring landing-orb-ring--outer" />
                <div className="landing-orb-ring landing-orb-ring--inner" />
                <div className="landing-orb-core" />
                <div className="landing-orb-glow" />
              </div>
            </motion.div>

            {/* Country Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="landing-countries"
            >
              <CountrySelector onStartJourney={() => setAppState('active')} />
            </motion.div>

            {/* Features - minimal pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="landing-features"
            >
              {[
                { label: t('landing.features.language.title'), icon: '~' },
                { label: t('landing.features.forms.title'), icon: '/' },
                { label: t('landing.features.privacy.title'), icon: '*' },
              ].map((f, i) => (
                <motion.div
                  key={f.label}
                  className="landing-pill"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                >
                  <span className="landing-pill-icon">{f.icon}</span>
                  <span>{f.label}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="landing-trust"
            >
              {t('landing.noAccount')}
            </motion.p>
          </div>
        </motion.main>
      </AnimatePresence>
    );
  }

  // ─── Active (App) ───
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key="active"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="welkom-app"
      >
        {/* Grain overlay */}
        <div className="grain-overlay" />

        {/* ─── Toolbar (left edge) ─── */}
        <motion.aside
          initial={{ opacity: 0, x: rtl ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="app-toolbar"
        >
          {/* Logo */}
          <button
            onClick={() => setAppState('landing')}
            className="toolbar-logo"
            title={t('toolbar.backToHome')}
          >
            <div className="toolbar-logo-dot" />
          </button>

          {/* Nav items */}
          <div className="toolbar-nav">
            <ToolbarButton
              active={activePanel === 'forms'}
              onClick={() => togglePanel('forms')}
              label={t('toolbar.forms')}
              badge={formSchema ? formSchema.fields.length : undefined}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              active={activePanel === 'roadmap'}
              onClick={() => togglePanel('roadmap')}
              label={t('toolbar.roadmap')}
              badge={roadmap ? `${getProgress()}%` : undefined}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </ToolbarButton>

          </div>

          {/* Bottom section */}
          <div className="toolbar-bottom">
            <ToolbarButton
              active={showTranscript}
              onClick={() => setShowTranscript(prev => !prev)}
              label={t('toolbar.chat')}
              badge={messages.length > 0 ? messages.length : undefined}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </ToolbarButton>
          </div>
        </motion.aside>

        {/* ─── Center: Voice Agent ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`app-center ${activePanel ? 'app-center--shifted' : ''} ${showTranscript ? 'app-center--transcript-open' : ''}`}
        >
          <div className="app-center-lang">
            <LanguageSwitcher />
          </div>

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

        {/* ─── Right Panel (slides in) ─── */}
        <AnimatePresence>
          {activePanel && (
            <motion.aside
              key="panel"
              initial={{ opacity: 0, x: rtl ? -40 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: rtl ? -40 : 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="app-panel"
            >
              <div className="app-panel-header">
                <h2 className="app-panel-title">
                  {activePanel === 'forms' && t('panels.capturedForms')}
                  {activePanel === 'roadmap' && t('panels.roadmap')}
                </h2>
                <button
                  onClick={() => setActivePanel(null)}
                  className="app-panel-close"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="app-panel-content">
                {activePanel === 'forms' && (
                  <FormStatus
                    schema={formSchema}
                    fillResults={lastFillResults}
                    onClear={clearSchema}
                    isConnected={isConnected}
                    error={error}
                    captureHistory={captureHistory}
                    onSelectCapture={selectCapture}
                    onRemoveCapture={removeCapture}
                  />
                )}
                {activePanel === 'roadmap' && (
                  roadmap ? (
                    <ProgressTracker
                      roadmap={roadmap}
                      onSetStatus={setStepStatus}
                      onUpdateNotes={updateNotes}
                      onClear={clearRoadmap}
                    />
                  ) : (
                    <div className="panel-empty">
                      <div className="panel-empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12 opacity-30">
                          <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <p className="panel-empty-title">{t('roadmap.empty')}</p>
                      <p className="panel-empty-sub">{t('roadmap.emptyDescription')}</p>
                    </div>
                  )
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ─── Transcript drawer (bottom) ─── */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              key="transcript"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`app-transcript ${activePanel ? 'app-transcript--panel-open' : ''}`}
            >
              <div className="app-transcript-header">
                <span className="app-transcript-title">{t('transcript.title')}</span>
                <button onClick={() => setShowTranscript(false)} className="app-panel-close">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="app-transcript-body">
                <Transcript messages={messages} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

// ─── Toolbar Button ───
function ToolbarButton({
  children,
  active,
  onClick,
  label,
  badge,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number | string;
}) {
  return (
    <button
      onClick={onClick}
      className={`toolbar-btn ${active ? 'toolbar-btn--active' : ''}`}
      title={label}
    >
      <span className="toolbar-btn-icon">{children}</span>
      <span className="toolbar-btn-label">{label}</span>
      {badge !== undefined && (
        <span className="toolbar-btn-badge">{badge}</span>
      )}
    </button>
  );
}
