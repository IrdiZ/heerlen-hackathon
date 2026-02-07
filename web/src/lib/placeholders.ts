// Placeholder tokens for PII - never sent to server with real values

export const PLACEHOLDERS = {
  FIRST_NAME: '[FIRST_NAME]',
  LAST_NAME: '[LAST_NAME]',
  DOB: '[DOB]',
  BIRTH_PLACE: '[BIRTH_PLACE]',
  NATIONALITY: '[NATIONALITY]',
  GENDER: '[GENDER]',
  STREET: '[STREET]',
  HOUSE_NUMBER: '[HOUSE_NUMBER]',
  POSTCODE: '[POSTCODE]',
  CITY: '[CITY]',
  PHONE: '[PHONE]',
  EMAIL: '[EMAIL]',
  BSN: '[BSN]',
  IBAN: '[IBAN]',
  DOCUMENT_NUMBER: '[DOCUMENT_NUMBER]',
  MOVE_DATE: '[MOVE_DATE]',
} as const;

export type PlaceholderKey = keyof typeof PLACEHOLDERS;
export type PlaceholderValue = typeof PLACEHOLDERS[PlaceholderKey];

// Map placeholder tokens to PII field keys
export const PLACEHOLDER_TO_FIELD: Record<PlaceholderValue, string> = {
  '[FIRST_NAME]': 'firstName',
  '[LAST_NAME]': 'lastName',
  '[DOB]': 'dateOfBirth',
  '[BIRTH_PLACE]': 'birthPlace',
  '[NATIONALITY]': 'nationality',
  '[GENDER]': 'gender',
  '[STREET]': 'street',
  '[HOUSE_NUMBER]': 'houseNumber',
  '[POSTCODE]': 'postcode',
  '[CITY]': 'city',
  '[PHONE]': 'phone',
  '[EMAIL]': 'email',
  '[BSN]': 'bsn',
  '[IBAN]': 'iban',
  '[DOCUMENT_NUMBER]': 'documentNumber',
  '[MOVE_DATE]': 'moveDate',
};

// Swap placeholders for real values
export function swapPlaceholders(
  fillMap: Record<string, string>,
  piiData: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [fieldId, placeholder] of Object.entries(fillMap)) {
    const piiKey = PLACEHOLDER_TO_FIELD[placeholder as PlaceholderValue];
    if (piiKey && piiData[piiKey]) {
      result[fieldId] = piiData[piiKey];
    } else {
      // If no mapping found, keep placeholder (shouldn't happen)
      result[fieldId] = placeholder;
    }
  }
  
  return result;
}

// Nationality mapping for Dutch dropdowns
export const NATIONALITY_MAP: Record<string, string[]> = {
  'Egyptian': ['Egyptische', 'Egypte', 'Egypt', 'EG'],
  'Turkish': ['Turkse', 'Turkije', 'Turkey', 'TR'],
  'Moroccan': ['Marokkaanse', 'Marokko', 'Morocco', 'MA'],
  'Syrian': ['Syrische', 'Syrië', 'Syria', 'SY'],
  'Polish': ['Poolse', 'Polen', 'Poland', 'PL'],
  'Ukrainian': ['Oekraïense', 'Oekraïne', 'Ukraine', 'UA'],
  'German': ['Duitse', 'Duitsland', 'Germany', 'DE'],
  'Dutch': ['Nederlandse', 'Nederland', 'Netherlands', 'NL'],
};

export function findNationalityMatch(nationality: string, options: string[]): string | null {
  const variants = NATIONALITY_MAP[nationality] || [nationality];
  const lowerOptions = options.map(o => o.toLowerCase());
  
  for (const variant of variants) {
    const idx = lowerOptions.findIndex(o => 
      o.includes(variant.toLowerCase()) || variant.toLowerCase().includes(o)
    );
    if (idx !== -1) return options[idx];
  }
  
  return null;
}
