'use client';

import { useState, useMemo } from 'react';
import {
  FORM_TEMPLATES,
  FormTemplate,
  CATEGORY_LABELS,
  getRequiredPIIFields,
  detectTemplateByUrl,
} from '@/lib/form-templates';
import { PLACEHOLDER_TO_FIELD, PlaceholderValue } from '@/lib/placeholders';
import { PIIData } from '@/hooks/useLocalPII';

interface FormTemplateSelectorProps {
  piiData: PIIData;
  currentUrl?: string;
  onSelectTemplate: (template: FormTemplate) => void;
  selectedTemplateId?: string;
}

// Map placeholder keys to human-readable labels
const PII_FIELD_LABELS: Record<string, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  dateOfBirth: 'Date of Birth',
  birthPlace: 'Birth Place',
  nationality: 'Nationality',
  gender: 'Gender',
  street: 'Street',
  houseNumber: 'House Number',
  postcode: 'Postcode',
  city: 'City',
  phone: 'Phone',
  email: 'Email',
  bsn: 'BSN',
  iban: 'IBAN',
  documentNumber: 'Document Number',
  moveDate: 'Move Date',
};

export function FormTemplateSelector({
  piiData,
  currentUrl,
  onSelectTemplate,
  selectedTemplateId,
}: FormTemplateSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);

  // Auto-detect template based on URL
  const detectedTemplate = useMemo(() => {
    if (currentUrl) {
      return detectTemplateByUrl(currentUrl);
    }
    return null;
  }, [currentUrl]);

  // Group templates by category
  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, FormTemplate[]> = {};
    for (const template of FORM_TEMPLATES) {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category].push(template);
    }
    return grouped;
  }, []);

  // Get current selected template
  const selectedTemplate = useMemo(() => {
    return FORM_TEMPLATES.find(t => t.id === selectedTemplateId);
  }, [selectedTemplateId]);

  // Check which required fields are filled for selected template
  const fieldStatus = useMemo(() => {
    if (!selectedTemplate) return { filled: [], missing: [] };

    const requiredFields = getRequiredPIIFields(selectedTemplate);
    const filled: string[] = [];
    const missing: string[] = [];

    for (const field of requiredFields) {
      if (piiData[field as keyof PIIData]?.trim()) {
        filled.push(field);
      } else {
        missing.push(field);
      }
    }

    return { filled, missing };
  }, [selectedTemplate, piiData]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">📋 Form Templates</h2>
          <p className="text-sm text-gray-500">Select a form type to auto-fill</p>
        </div>
      </div>

      {/* Auto-detected template banner */}
      {detectedTemplate && detectedTemplate.id !== selectedTemplateId && (
        <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-primary-600">🔍</span>
              <span className="text-sm text-primary-800">
                Detected: <strong>{detectedTemplate.nameEN}</strong>
              </span>
            </div>
            <button
              onClick={() => onSelectTemplate(detectedTemplate)}
              className="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Use this template
            </button>
          </div>
        </div>
      )}

      {/* Template dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Form Type
        </label>
        <select
          value={selectedTemplateId || ''}
          onChange={(e) => {
            const template = FORM_TEMPLATES.find(t => t.id === e.target.value);
            if (template) onSelectTemplate(template);
          }}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
        >
          <option value="">Choose a form template...</option>
          {Object.entries(templatesByCategory).map(([category, templates]) => (
            <optgroup
              key={category}
              label={`${CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS].icon} ${CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS].en}`}
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.nameEN}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Selected template details */}
      {selectedTemplate && (
        <div className="space-y-4">
          {/* Template header */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {CATEGORY_LABELS[selectedTemplate.category].icon} {selectedTemplate.nameEN}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{selectedTemplate.nameNL}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                selectedTemplate.category === 'government' ? 'bg-purple-100 text-purple-700' :
                selectedTemplate.category === 'finance' ? 'bg-green-100 text-green-700' :
                selectedTemplate.category === 'healthcare' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {CATEGORY_LABELS[selectedTemplate.category].en}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{selectedTemplate.description}</p>
          </div>

          {/* Field status */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">Required Fields Status</h4>
            
            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{fieldStatus.filled.length} of {fieldStatus.filled.length + fieldStatus.missing.length} fields ready</span>
                <span>
                  {fieldStatus.missing.length === 0 ? (
                    <span className="text-green-600 font-medium">✓ Ready to fill!</span>
                  ) : (
                    <span className="text-amber-600">{fieldStatus.missing.length} missing</span>
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    fieldStatus.missing.length === 0 ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${(fieldStatus.filled.length / (fieldStatus.filled.length + fieldStatus.missing.length)) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Missing fields */}
            {fieldStatus.missing.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-amber-700 font-medium">Missing fields:</p>
                <div className="flex flex-wrap gap-2">
                  {fieldStatus.missing.map(field => (
                    <span
                      key={field}
                      className="px-2 py-1 text-xs bg-amber-50 text-amber-700 rounded-full border border-amber-200"
                    >
                      {PII_FIELD_LABELS[field] || field}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Filled fields */}
            {fieldStatus.filled.length > 0 && (
              <div className="space-y-1 mt-3">
                <p className="text-sm text-green-700 font-medium">Ready:</p>
                <div className="flex flex-wrap gap-2">
                  {fieldStatus.filled.map(field => (
                    <span
                      key={field}
                      className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded-full border border-green-200"
                    >
                      ✓ {PII_FIELD_LABELS[field] || field}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tips section */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowTips(!showTips)}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">
                💡 Tips & Required Documents
              </span>
              <span className="text-gray-500">{showTips ? '▲' : '▼'}</span>
            </button>
            
            {showTips && (
              <div className="p-4 space-y-4">
                {/* Tips */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Tips:</h5>
                  <ul className="space-y-2">
                    {selectedTemplate.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-primary-500 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Required documents */}
                {selectedTemplate.requiredDocuments && selectedTemplate.requiredDocuments.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Required Documents:</h5>
                    <ul className="space-y-2">
                      {selectedTemplate.requiredDocuments.map((doc, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-amber-500 mt-0.5">📄</span>
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Browse all templates */}
      {!selectedTemplate && (
        <div className="mt-6 space-y-4">
          <h3 className="font-medium text-gray-700">Browse by Category</h3>
          {Object.entries(templatesByCategory).map(([category, templates]) => (
            <div key={category} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-700">
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS].icon}{' '}
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS].en}
                </span>
                <span className="text-gray-500">
                  {templates.length} templates {expandedCategory === category ? '▲' : '▼'}
                </span>
              </button>
              
              {expandedCategory === category && (
                <div className="divide-y">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => onSelectTemplate(template)}
                      className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors"
                    >
                      <div className="font-medium text-gray-800">{template.nameEN}</div>
                      <div className="text-sm text-gray-500">{template.nameNL}</div>
                      <div className="text-xs text-gray-400 mt-1">{template.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact template badge for the main UI
export function TemplateIndicator({
  template,
  onClick,
}: {
  template: FormTemplate;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors"
    >
      {CATEGORY_LABELS[template.category].icon}
      <span>{template.nameEN}</span>
      {onClick && <span className="text-blue-400">×</span>}
    </button>
  );
}
