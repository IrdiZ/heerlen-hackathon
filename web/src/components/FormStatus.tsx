'use client';

import { useTranslations } from 'next-intl';
import { FormSchema, FillResult } from '@/hooks/useExtension';

interface FormStatusProps {
  schema: FormSchema | null;
  fillResults: FillResult[];
  onClear: () => void;
  isConnected: boolean;
  error: string | null;
}

export function FormStatus({ schema, fillResults, onClear, isConnected, error }: FormStatusProps) {
  const t = useTranslations('formStatus');

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-red-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{t('error')}</span>
        </div>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${isConnected ? 'bg-green-100' : 'bg-yellow-100'}`}>
          {isConnected ? (
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>
        <h3 className="font-semibold text-gray-800">
          {isConnected ? t('extensionConnected') : t('extensionNotDetected')}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {isConnected ? t('captureHint') : t('installHint')}
        </p>
      </div>
    );
  }

  const filledFields = fillResults.filter(r => r.status === 'filled').length;
  const failedFields = fillResults.filter(r => r.status !== 'filled').length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 truncate max-w-xs">{schema.title || t('formCaptured')}</h3>
          <p className="text-xs text-gray-500 truncate max-w-xs">{schema.url}</p>
        </div>
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {t('clear')}
        </button>
      </div>

      {/* Fill results summary */}
      {fillResults.length > 0 && (
        <div className="px-4 py-3 bg-blue-50 border-b flex items-center gap-4">
          <span className="text-sm font-medium text-blue-800">{t('fillResults')}:</span>
          {filledFields > 0 && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {filledFields} {t('filled')}
            </span>
          )}
          {failedFields > 0 && (
            <span className="text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {failedFields} {t('failed')}
            </span>
          )}
        </div>
      )}

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
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-800">{field.label}</td>
                  <td className="px-4 py-2 text-gray-500">{field.type}</td>
                  <td className="px-4 py-2">
                    {result ? (
                      result.status === 'filled' ? (
                        <span className="text-green-600">✓ {t('filled')}</span>
                      ) : (
                        <span className="text-red-600">✗ {t('failed')}</span>
                      )
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Field count */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
        {t('fieldsDetected', { count: schema.fields.length })}
      </div>
    </div>
  );
}
