'use client';

import { useEffect, useState } from 'react';
import {
  getCachedOfflineData,
  OfflineData,
  OfflineStep,
  OfflineFAQ,
  EmergencyContact,
} from '@/lib/offline-data';

export default function OfflinePage() {
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [activeTab, setActiveTab] = useState<'steps' | 'faqs' | 'emergency'>('steps');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Load cached data
    const cached = getCachedOfflineData();
    setOfflineData(cached);

    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Redirect to home after brief delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Offline Banner */}
      <div className={`sticky top-0 z-50 px-4 py-3 text-center text-sm font-medium transition-colors ${
        isOnline 
          ? 'bg-green-600 text-white' 
          : 'bg-orange-500 text-white'
      }`}>
        {isOnline ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            You&apos;re back online! Redirecting...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
            </svg>
            You&apos;re offline - Viewing cached content
          </span>
        )}
      </div>

      {/* Header */}
      <header className="px-6 py-8 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 text-5xl">🌍</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            MigrantAI
          </h1>
          <p className="mt-2 text-gray-400">
            Essential information available offline
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-12 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
        <div className="mx-auto max-w-4xl flex justify-center gap-1 p-2">
          <TabButton 
            active={activeTab === 'steps'} 
            onClick={() => setActiveTab('steps')}
            icon="📋"
            label="Steps"
          />
          <TabButton 
            active={activeTab === 'faqs'} 
            onClick={() => setActiveTab('faqs')}
            icon="❓"
            label="FAQs"
          />
          <TabButton 
            active={activeTab === 'emergency'} 
            onClick={() => setActiveTab('emergency')}
            icon="🆘"
            label="Emergency"
          />
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {!offlineData ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📵</div>
            <h2 className="text-xl font-semibold mb-2">No cached data available</h2>
            <p className="text-gray-400">
              Visit MigrantAI while online to cache essential information for offline use.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'steps' && (
              <StepsSection 
                steps={offlineData.steps} 
                expandedStep={expandedStep}
                onToggle={(id) => setExpandedStep(expandedStep === id ? null : id)}
              />
            )}
            {activeTab === 'faqs' && (
              <FAQsSection faqs={offlineData.faqs} />
            )}
            {activeTab === 'emergency' && (
              <EmergencySection contacts={offlineData.emergencyContacts} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-4 text-center text-sm text-gray-500">
        {offlineData && (
          <p>Last updated: {new Date(offlineData.lastUpdated).toLocaleDateString()}</p>
        )}
        <p className="mt-1">
          Go online for full AI-powered assistance
        </p>
      </footer>
    </div>
  );
}

function TabButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: string; 
  label: string; 
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
        active 
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function StepsSection({ 
  steps, 
  expandedStep, 
  onToggle 
}: { 
  steps: OfflineStep[]; 
  expandedStep: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Immigration Steps</h2>
      {steps.map((step, index) => (
        <div 
          key={step.id}
          className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden"
        >
          <button
            onClick={() => onToggle(step.id)}
            className="w-full px-4 py-4 flex items-center gap-4 text-left hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.timeline}</p>
            </div>
            <svg 
              className={`w-5 h-5 transition-transform ${expandedStep === step.id ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedStep === step.id && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-700 pt-4">
              <p className="text-gray-300">{step.description}</p>
              
              <div>
                <h4 className="font-medium text-orange-400 mb-2">📄 Required Documents</h4>
                <ul className="space-y-1">
                  {step.documents.map((doc, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                      <span className="text-green-400">✓</span> {doc}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-orange-400 mb-2">💡 Tips</h4>
                <ul className="space-y-1">
                  {step.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-yellow-400">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FAQsSection({ faqs }: { faqs: OfflineFAQ[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  // Group by category
  const categories = Array.from(new Set(faqs.map(f => f.category)));
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
      {categories.map(category => (
        <div key={category}>
          <h3 className="text-sm font-medium text-orange-400 uppercase tracking-wider mb-3">
            {category}
          </h3>
          <div className="space-y-2">
            {faqs
              .filter(f => f.category === category)
              .map((faq, index) => {
                const globalIndex = faqs.indexOf(faq);
                return (
                  <div 
                    key={index}
                    className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedIndex(expandedIndex === globalIndex ? null : globalIndex)}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-700/50 transition-colors"
                    >
                      <span className="text-orange-400">Q:</span>
                      <span className="flex-grow font-medium">{faq.question}</span>
                      <svg 
                        className={`w-5 h-5 transition-transform flex-shrink-0 ${expandedIndex === globalIndex ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedIndex === globalIndex && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-700">
                        <p className="text-gray-300 flex items-start gap-2">
                          <span className="text-green-400 font-medium">A:</span>
                          <span>{faq.answer}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmergencySection({ contacts }: { contacts: EmergencyContact[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Emergency Contacts</h2>
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
        <p className="text-red-300 text-sm flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          For life-threatening emergencies, always call <strong className="text-white">112</strong>
        </p>
      </div>
      
      <div className="grid gap-3">
        {contacts.map((contact, index) => (
          <a
            key={index}
            href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
            className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 flex items-center gap-4 hover:bg-gray-700/50 transition-colors active:scale-98"
          >
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold">{contact.name}</h3>
              <p className="text-sm text-gray-400">{contact.description}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-mono text-orange-400">{contact.phone}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
