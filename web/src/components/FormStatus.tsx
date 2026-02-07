'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { FormSchema, FillResult } from '@/hooks/useExtension';

interface FormStatusProps {
  schema: FormSchema | null;
  fillResults: FillResult[];
  onClear: () => void;
  isConnected: boolean;
  error: string | null;
  captureHistory?: FormSchema[];
  onSelectCapture?: (index: number) => void;
  onRemoveCapture?: (index: number) => void;
}

// Shimmer loading skeleton component
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

// Animated icon wrapper
function PulsingIcon({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${color}`}
    >
      {children}
    </motion.div>
  );
}

export function FormStatus({ schema, fillResults, onClear, isConnected, error, captureHistory = [], onSelectCapture, onRemoveCapture }: FormStatusProps) {
  const t = useTranslations('formStatus');

  // Error state with shake animation
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <motion.div 
          initial={{ x: 0 }}
          animate={{ x: [0, -5, 5, -5, 5, 0] }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-red-600"
        >
          <motion.svg 
            className="w-5 h-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </motion.svg>
          <span className="font-medium">{t('error')}</span>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-sm text-red-700"
        >
          {error}
        </motion.p>
      </motion.div>
    );
  }

  // Empty state with pulsing icon
  if (!schema) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{ scale: 1.01, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
        className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center transition-all duration-300"
      >
        <PulsingIcon color={isConnected ? 'bg-green-100' : 'bg-yellow-100'}>
          {isConnected ? (
            <motion.svg 
              className="w-6 h-6 text-green-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </motion.svg>
          ) : (
            <motion.svg 
              className="w-6 h-6 text-yellow-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </motion.svg>
          )}
        </PulsingIcon>
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-semibold text-gray-800 mt-3"
        >
          {isConnected ? t('extensionConnected') : t('extensionNotDetected')}
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-500 mt-1"
        >
          {isConnected ? t('captureHint') : t('installHint')}
        </motion.p>
      </motion.div>
    );
  }

  const filledFields = fillResults.filter(r => r.status === 'filled').length;
  const failedFields = fillResults.filter(r => r.status !== 'filled').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Capture History Carousel */}
      <AnimatePresence>
        {captureHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-2 border-b"
          >
            <div className="flex items-center gap-2 mb-2">
              <motion.span 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                className="text-xs font-medium text-gray-500"
              >
                📚 Captures ({captureHistory.length})
              </motion.span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory">
              {captureHistory.map((capture, i) => {
                const isActive = capture.url === schema?.url && capture.capturedAt === schema?.capturedAt;
                return (
                  <motion.div
                    key={capture.capturedAt || i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative snap-start shrink-0"
                  >
                    {/* Remove button */}
                    {onRemoveCapture && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveCapture(i);
                        }}
                        whileHover={{ scale: 1.2, backgroundColor: '#ef4444' }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute -top-1 -right-1 z-10 w-5 h-5 bg-gray-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-colors"
                        title="Remove capture"
                      >
                        ×
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => onSelectCapture?.(i)}
                      whileHover={{ 
                        scale: 1.05, 
                        y: -2,
                        boxShadow: "0 8px 20px -5px rgba(0,0,0,0.15)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        w-40 p-2 rounded-lg text-left transition-all duration-200
                        ${isActive 
                          ? 'bg-orange-500 text-white shadow-lg ring-2 ring-blue-300' 
                          : 'bg-white text-gray-700 shadow border border-gray-200'
                        }
                      `}
                    >
                      <div className={`text-xs font-medium truncate ${isActive ? 'text-white' : 'text-gray-800'}`}>
                        {capture.title?.slice(0, 25) || 'Untitled'}
                        {capture.title && capture.title.length > 25 ? '...' : ''}
                      </div>
                      <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                        {capture.fields?.length || 0} fields
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                        {capture.capturedAt ? new Date(capture.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between"
      >
        <div>
          <h3 className="font-semibold text-gray-800 truncate max-w-xs">{schema.title || t('formCaptured')}</h3>
          <p className="text-xs text-gray-500 truncate max-w-xs">{schema.url}</p>
          {schema.capturedAt && (
            <p className="text-xs text-gray-400">
              {new Date(schema.capturedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        <motion.button
          onClick={onClear}
          whileHover={{ scale: 1.05, color: '#374151' }}
          whileTap={{ scale: 0.95 }}
          className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
        >
          {t('clear')}
        </motion.button>
      </motion.div>

      {/* Page context (headings, description) */}
      <AnimatePresence>
        {(schema.headings?.length || schema.pageDescription) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-gray-50 border-b text-xs space-y-1"
          >
            {schema.pageDescription && (
              <p className="text-gray-600 italic">{schema.pageDescription.slice(0, 150)}...</p>
            )}
            {schema.headings && schema.headings.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {schema.headings.slice(0, 5).map((h, i) => (
                  <motion.span 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05, backgroundColor: '#d1d5db' }}
                    className="bg-gray-200 px-2 py-0.5 rounded text-gray-700 cursor-default transition-colors duration-200"
                  >
                    {h.text?.slice(0, 30)}{h.text && h.text.length > 30 ? '...' : ''}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fill results summary */}
      <AnimatePresence>
        {fillResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="px-4 py-3 bg-orange-50 border-b flex items-center gap-4"
          >
            <span className="text-sm font-medium text-orange-800">{t('fillResults')}:</span>
            {filledFields > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="text-sm text-green-600 flex items-center gap-1"
              >
                <motion.svg 
                  className="w-4 h-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
                {filledFields} {t('filled')}
              </motion.span>
            )}
            {failedFields > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
                className="text-sm text-red-600 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {failedFields} {t('failed')}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fields list */}
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-start font-medium text-gray-600">{t('field')}</th>
              <th className="px-4 py-2 text-start font-medium text-gray-600">{t('type')}</th>
              <th className="px-4 py-2 text-start font-medium text-gray-600">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schema.fields.map((field, i) => {
              const result = fillResults.find(r => r.field === field.id);
              return (
                <motion.tr 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="transition-colors duration-150"
                >
                  <td className="px-4 py-2 text-gray-800">{field.label}</td>
                  <td className="px-4 py-2 text-gray-500">{field.type}</td>
                  <td className="px-4 py-2">
                    {result ? (
                      result.status === 'filled' ? (
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-green-600 inline-flex items-center gap-1"
                        >
                          <motion.span
                            initial={{ rotate: -180 }}
                            animate={{ rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            ✓
                          </motion.span> 
                          {t('filled')}
                        </motion.span>
                      ) : (
                        <motion.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-600"
                        >
                          ✗ {t('failed')}
                        </motion.span>
                      )
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Field count */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500"
      >
        {t('fieldsDetected', { count: schema.fields.length })}
      </motion.div>
    </motion.div>
  );
}

// Export skeleton for loading states
export function FormStatusSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
