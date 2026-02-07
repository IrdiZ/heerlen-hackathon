'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & DATA
// ============================================================================

interface DocumentItem {
  id: string;
  name: string;
  description: string;
  whereToGet: string;
  link?: string;
  estimatedTime: string;
  cost?: string;
  apostilleRequired?: boolean;
  expiresInMonths?: number;
  group: 'home-country' | 'netherlands' | 'medical';
}

interface DocumentState {
  checked: boolean;
  uploadedFile?: string;
  obtainedDate?: Date;
}

const DOCUMENTS: DocumentItem[] = [
  // From your home country
  {
    id: 'birth-cert',
    name: 'Birth Certificate',
    description: 'Official birth certificate from your country of origin',
    whereToGet: 'Civil Registry Office in your home country',
    link: 'https://www.government.nl/topics/legalisation-of-documents',
    estimatedTime: '1-4 weeks',
    cost: '€10-50',
    apostilleRequired: true,
    group: 'home-country',
  },
  {
    id: 'diploma',
    name: 'Educational Diplomas',
    description: 'University degrees or professional certificates',
    whereToGet: 'Your educational institution',
    link: 'https://www.nuffic.nl/en/subjects/credential-evaluation',
    estimatedTime: '1-2 weeks',
    cost: '€25-100',
    apostilleRequired: true,
    group: 'home-country',
  },
  {
    id: 'police-clearance',
    name: 'Police Clearance Certificate',
    description: 'Criminal record check from your country',
    whereToGet: 'Police department or Ministry of Justice',
    link: 'https://ind.nl/en/required-documents',
    estimatedTime: '2-6 weeks',
    cost: '€15-75',
    apostilleRequired: true,
    expiresInMonths: 3,
    group: 'home-country',
  },
  {
    id: 'marriage-cert',
    name: 'Marriage Certificate',
    description: 'If applicable - apostilled marriage certificate',
    whereToGet: 'Civil Registry Office',
    estimatedTime: '1-2 weeks',
    cost: '€10-30',
    apostilleRequired: true,
    group: 'home-country',
  },
  {
    id: 'passport',
    name: 'Valid Passport',
    description: 'With at least 6 months validity remaining',
    whereToGet: 'Embassy or passport office in your country',
    estimatedTime: '1-6 weeks',
    cost: '€50-150',
    group: 'home-country',
  },
  // From Netherlands
  {
    id: 'admission-letter',
    name: 'University Admission Letter',
    description: 'Official acceptance letter from your Dutch institution',
    whereToGet: 'Your Dutch university admissions office',
    link: 'https://www.studyinholland.nl',
    estimatedTime: '1-4 weeks',
    group: 'netherlands',
  },
  {
    id: 'housing-contract',
    name: 'Housing Contract',
    description: 'Rental agreement or proof of accommodation',
    whereToGet: 'Landlord or housing corporation',
    estimatedTime: '1-2 weeks',
    cost: '€0-100 (deposit separate)',
    group: 'netherlands',
  },
  {
    id: 'employment-contract',
    name: 'Employment Contract',
    description: 'If working - signed employment agreement',
    whereToGet: 'Your Dutch employer',
    estimatedTime: 'Same day - 1 week',
    group: 'netherlands',
  },
  {
    id: 'proof-of-funds',
    name: 'Proof of Sufficient Funds',
    description: 'Bank statements showing financial means',
    whereToGet: 'Your bank (statements from last 3 months)',
    estimatedTime: '1-3 days',
    group: 'netherlands',
  },
  {
    id: 'health-insurance',
    name: 'Health Insurance Proof',
    description: 'Dutch basic health insurance (zorgverzekering)',
    whereToGet: 'Dutch insurance providers (Zilveren Kruis, CZ, VGZ)',
    link: 'https://www.independer.nl/zorgverzekering',
    estimatedTime: '1-3 days',
    cost: '€120-150/month',
    group: 'netherlands',
  },
  // Medical
  {
    id: 'tb-test',
    name: 'TB Test Certificate',
    description: 'Required if from TB-risk country',
    whereToGet: 'GGD (Municipal Health Service) in the Netherlands',
    link: 'https://www.ggd.nl',
    estimatedTime: '1-2 weeks',
    cost: '€0-100',
    expiresInMonths: 6,
    group: 'medical',
  },
  {
    id: 'vaccination-record',
    name: 'Vaccination Records',
    description: 'Proof of vaccinations (COVID, standard immunizations)',
    whereToGet: 'Your doctor or health authority',
    estimatedTime: '1-5 days',
    group: 'medical',
  },
  {
    id: 'medical-report',
    name: 'Medical Fitness Report',
    description: 'If required for your visa type',
    whereToGet: 'Approved medical examiner',
    estimatedTime: '1-2 weeks',
    cost: '€100-250',
    group: 'medical',
  },
];

const GROUP_INFO = {
  'home-country': {
    title: 'From Your Country',
    icon: '🏠',
    description: 'Documents to obtain before leaving',
  },
  netherlands: {
    title: 'From Netherlands',
    icon: '🇳🇱',
    description: 'Documents from Dutch institutions',
  },
  medical: {
    title: 'Medical Documents',
    icon: '🏥',
    description: 'Health-related requirements',
  },
};

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================

function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);
  
  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        color: ['#f97316', '#fb923c', '#fed7aa', '#ffffff', '#22c55e'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 1500);
      return () => clearTimeout(timer);
    }
  }, [active]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
          animate={{ 
            y: [0, -80, 150], 
            x: [0, p.x], 
            opacity: [1, 1, 0],
            rotate: [0, 360, 720],
            scale: [1, 1.2, 0.5]
          }}
          transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2"
          style={{ backgroundColor: p.color }}
        >
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: p.color }} />
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// PROGRESS RING COMPONENT
// ============================================================================

function ProgressRing({ progress, size = 180 }: { progress: number; size?: number }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className="text-4xl font-bold text-white"
          key={progress}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          {progress}%
        </motion.span>
        <span className="text-sm text-gray-400">Complete</span>
      </div>
    </div>
  );
}

// ============================================================================
// DOCUMENT CARD COMPONENT  
// ============================================================================

interface DocumentCardProps {
  doc: DocumentItem;
  state: DocumentState;
  onToggle: () => void;
  onUpload: (fileName: string) => void;
  index: number;
}

function DocumentCard({ doc, state, onToggle, onUpload, index }: DocumentCardProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleCheck = () => {
    if (!state.checked) {
      setShowConfetti(true);
    }
    onToggle();
  };

  const isExpiringSoon = doc.expiresInMonths && state.checked && state.obtainedDate && 
    (new Date().getTime() - state.obtainedDate.getTime()) > (doc.expiresInMonths - 1) * 30 * 24 * 60 * 60 * 1000;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onUpload(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file.name);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative rounded-xl border-2 transition-all duration-300 overflow-hidden ${
        state.checked 
          ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/50' 
          : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 hover:border-orange-500/50'
      }`}
    >
      <Confetti active={showConfetti} />
      
      {/* Expiry Warning Banner */}
      {isExpiringSoon && (
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center gap-2"
        >
          <span className="text-amber-400">⚠️</span>
          <span className="text-amber-300 text-sm font-medium">
            Expires soon! Valid for only {doc.expiresInMonths} months
          </span>
        </motion.div>
      )}

      <div className="p-5">
        <div className="flex gap-4">
          {/* Checkbox */}
          <button
            onClick={handleCheck}
            className="flex-shrink-0 mt-1"
          >
            <motion.div 
              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                state.checked 
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400' 
                  : 'border-gray-500 hover:border-orange-400'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence>
                {state.checked && (
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className={`font-semibold text-lg transition-all duration-300 ${
                  state.checked ? 'text-green-300 line-through opacity-70' : 'text-white'
                }`}>
                  {doc.name}
                </h4>
                <p className="text-gray-400 text-sm mt-1">{doc.description}</p>
              </div>
              
              {/* Badges */}
              <div className="flex flex-col gap-2 items-end flex-shrink-0">
                {doc.apostilleRequired && (
                  <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30">
                    📜 Apostille Required
                  </span>
                )}
                {doc.expiresInMonths && (
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-medium rounded-full border border-amber-500/30">
                    ⏰ Valid {doc.expiresInMonths}mo
                  </span>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-orange-400">📍</span>
                <div>
                  <span className="text-gray-500 text-xs block">Where to get</span>
                  {doc.link ? (
                    <a 
                      href={doc.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 underline underline-offset-2"
                    >
                      {doc.whereToGet}
                    </a>
                  ) : (
                    <span>{doc.whereToGet}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-orange-400">⏱️</span>
                <div>
                  <span className="text-gray-500 text-xs block">Est. time</span>
                  <span>{doc.estimatedTime}</span>
                </div>
              </div>
              {doc.cost && (
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-orange-400">💰</span>
                  <div>
                    <span className="text-gray-500 text-xs block">Cost</span>
                    <span>{doc.cost}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Zone */}
            <div 
              className={`mt-4 border-2 border-dashed rounded-lg p-3 transition-all duration-300 cursor-pointer ${
                isDragOver 
                  ? 'border-orange-400 bg-orange-500/10' 
                  : state.uploadedFile
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
              {state.uploadedFile ? (
                <div className="flex items-center gap-2 text-green-300">
                  <span>📄</span>
                  <span className="text-sm truncate">{state.uploadedFile}</span>
                  <span className="text-green-400">✓</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <span>📁</span>
                  <span className="text-sm">Drop file or click to upload (demo)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// DOCUMENT GROUP COMPONENT
// ============================================================================

interface DocumentGroupProps {
  groupKey: 'home-country' | 'netherlands' | 'medical';
  docs: DocumentItem[];
  states: Record<string, DocumentState>;
  onToggle: (id: string) => void;
  onUpload: (id: string, fileName: string) => void;
  startIndex: number;
}

function DocumentGroup({ groupKey, docs, states, onToggle, onUpload, startIndex }: DocumentGroupProps) {
  const info = GROUP_INFO[groupKey];
  const completedCount = docs.filter(d => states[d.id]?.checked).length;
  const progress = Math.round((completedCount / docs.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{info.icon}</span>
          <div>
            <h3 className="text-xl font-bold text-white">{info.title}</h3>
            <p className="text-gray-400 text-sm">{info.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-2xl font-bold text-orange-400">{completedCount}</span>
            <span className="text-gray-500">/{docs.length}</span>
          </div>
          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {docs.map((doc, i) => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            state={states[doc.id] || { checked: false }}
            onToggle={() => onToggle(doc.id)}
            onUpload={(fileName) => onUpload(doc.id, fileName)}
            index={startIndex + i}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DocumentChecklist() {
  const [states, setStates] = useState<Record<string, DocumentState>>(() => {
    // Initialize all as unchecked
    const initial: Record<string, DocumentState> = {};
    DOCUMENTS.forEach(doc => {
      initial[doc.id] = { checked: false };
    });
    return initial;
  });

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('doc-checklist-demo');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        Object.keys(parsed).forEach(key => {
          if (parsed[key].obtainedDate) {
            parsed[key].obtainedDate = new Date(parsed[key].obtainedDate);
          }
        });
        setStates(parsed);
      } catch (e) {
        console.error('Failed to load checklist state:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('doc-checklist-demo', JSON.stringify(states));
  }, [states]);

  const handleToggle = useCallback((id: string) => {
    setStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        checked: !prev[id]?.checked,
        obtainedDate: !prev[id]?.checked ? new Date() : undefined,
      }
    }));
  }, []);

  const handleUpload = useCallback((id: string, fileName: string) => {
    setStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        uploadedFile: fileName,
      }
    }));
  }, []);

  const handleReset = useCallback(() => {
    const initial: Record<string, DocumentState> = {};
    DOCUMENTS.forEach(doc => {
      initial[doc.id] = { checked: false };
    });
    setStates(initial);
    localStorage.removeItem('doc-checklist-demo');
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Calculate progress
  const checkedCount = Object.values(states).filter(s => s.checked).length;
  const totalCount = DOCUMENTS.length;
  const progress = Math.round((checkedCount / totalCount) * 100);

  // Group documents
  const homeCountryDocs = DOCUMENTS.filter(d => d.group === 'home-country');
  const netherlandsDocs = DOCUMENTS.filter(d => d.group === 'netherlands');
  const medicalDocs = DOCUMENTS.filter(d => d.group === 'medical');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            📋 Document Checklist
          </h1>
          <p className="text-gray-400 text-lg">
            Track all required documents for your Dutch immigration
          </p>
        </motion.div>

        {/* Progress Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-8 border border-gray-700/50 backdrop-blur"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-shrink-0">
              <ProgressRing progress={progress} />
            </div>
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <motion.span 
                  className="text-5xl font-bold text-white"
                  key={checkedCount}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  {checkedCount}
                </motion.span>
                <span className="text-3xl text-gray-500"> / {totalCount}</span>
                <p className="text-gray-400 mt-1">documents ready</p>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-300 text-sm">Completed: {checkedCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <span className="text-gray-300 text-sm">Remaining: {totalCount - checkedCount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/25"
                >
                  <span>🖨️</span> Print Checklist
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-xl flex items-center gap-2"
                >
                  <span>🔄</span> Reset All
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Document Groups */}
        <div className="space-y-10">
          <DocumentGroup 
            groupKey="home-country"
            docs={homeCountryDocs}
            states={states}
            onToggle={handleToggle}
            onUpload={handleUpload}
            startIndex={0}
          />
          <DocumentGroup 
            groupKey="netherlands"
            docs={netherlandsDocs}
            states={states}
            onToggle={handleToggle}
            onUpload={handleUpload}
            startIndex={homeCountryDocs.length}
          />
          <DocumentGroup 
            groupKey="medical"
            docs={medicalDocs}
            states={states}
            onToggle={handleToggle}
            onUpload={handleUpload}
            startIndex={homeCountryDocs.length + netherlandsDocs.length}
          />
        </div>

        {/* Completion Celebration */}
        <AnimatePresence>
          {progress === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-2xl p-8 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">
                All Documents Ready!
              </h3>
              <p className="text-gray-300">
                Congratulations! You have gathered all required documents.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            .bg-gradient-to-br,
            .bg-gradient-to-r {
              background: white !important;
            }
            button {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

// Export for backwards compatibility with the hook-based version
export type { DocumentItem, DocumentState };
