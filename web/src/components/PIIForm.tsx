'use client';

import { useTranslations } from 'next-intl';
import { PIIData, DEMO_PII } from '@/hooks/useLocalPII';

interface PIIFormProps {
  piiData: PIIData;
  onUpdate: (field: keyof PIIData, value: string) => void;
  onClear: () => void;
  onLoadDemo: () => void;
  filledCount: number;
  totalFields: number;
}

const FIELD_KEYS: (keyof PIIData)[] = [
  'firstName', 'lastName', 'dateOfBirth', 'birthPlace', 'nationality', 'gender',
  'street', 'houseNumber', 'postcode', 'city',
  'phone', 'email',
  'documentNumber', 'moveDate', 'bsn', 'iban'
];

const FIELD_TYPES: Partial<Record<keyof PIIData, string>> = {
  dateOfBirth: 'date',
  moveDate: 'date',
  email: 'email',
  phone: 'tel',
};

export function PIIForm({ piiData, onUpdate, onClear, onLoadDemo, filledCount, totalFields }: PIIFormProps) {
  const t = useTranslations('piiForm');

  const renderField = (field: keyof PIIData) => {
    const label = t(`fieldLabels.${field}`);
    const type = FIELD_TYPES[field] || 'text';
    const value = piiData[field];

    if (field === 'gender') {
      return (
        <div key={field} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600">{label}</label>
          <select
            value={value}
            onChange={(e) => onUpdate(field, e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
          >
            <option value="">{t('genderOptions.select')}</option>
            <option value="Male">{t('genderOptions.male')}</option>
            <option value="Female">{t('genderOptions.female')}</option>
            <option value="Other">{t('genderOptions.other')}</option>
            <option value="Prefer not to say">{t('genderOptions.preferNot')}</option>
          </select>
        </div>
      );
    }

    return (
      <div key={field} className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => onUpdate(field, e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          placeholder={DEMO_PII[field] ? `e.g., ${DEMO_PII[field]}` : ''}
        />
      </div>
    );
  };

  const primaryFields: (keyof PIIData)[] = ['firstName', 'lastName', 'dateOfBirth', 'birthPlace', 'nationality', 'gender'];
  const addressFields: (keyof PIIData)[] = ['street', 'houseNumber', 'postcode', 'city'];
  const contactFields: (keyof PIIData)[] = ['phone', 'email'];
  const documentFields: (keyof PIIData)[] = ['documentNumber', 'moveDate', 'bsn', 'iban'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">🔒 {t('title')}</h2>
          <p className="text-sm text-gray-500">{t('subtitle')}</p>
        </div>
        <div className="text-sm text-gray-600">
          {filledCount}/{totalFields} {t('fields')}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(filledCount / totalFields) * 100}%` }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={onLoadDemo}
          className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
        >
          {t('loadDemo')}
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          {t('clearAll')}
        </button>
      </div>

      {/* Form sections */}
      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('sections.personalInfo')}</h3>
          <div className="grid grid-cols-2 gap-4">
            {primaryFields.map(renderField)}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('sections.address')}</h3>
          <div className="grid grid-cols-2 gap-4">
            {addressFields.map(renderField)}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('sections.contact')}</h3>
          <div className="grid grid-cols-2 gap-4">
            {contactFields.map(renderField)}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('sections.documents')}</h3>
          <div className="grid grid-cols-2 gap-4">
            {documentFields.map(renderField)}
          </div>
        </section>
      </div>
    </div>
  );
}
