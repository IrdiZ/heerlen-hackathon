'use client';

import { useState, useEffect, useCallback } from 'react';

export interface PIIData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  birthPlace: string;
  nationality: string;
  gender: string;
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;
  phone: string;
  email: string;
  bsn: string;
  iban: string;
  documentNumber: string;
  moveDate: string;
}

const STORAGE_KEY = 'migrantai_pii';

const emptyPII: PIIData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  birthPlace: '',
  nationality: '',
  gender: '',
  street: '',
  houseNumber: '',
  postcode: '',
  city: '',
  phone: '',
  email: '',
  bsn: '',
  iban: '',
  documentNumber: '',
  moveDate: '',
};

// Demo data for quick testing
export const DEMO_PII: PIIData = {
  firstName: 'Ahmed',
  lastName: 'Hassan',
  dateOfBirth: '1990-01-05',
  birthPlace: 'Cairo',
  nationality: 'Egyptian',
  gender: 'Male',
  street: 'Keizersgracht',
  houseNumber: '42',
  postcode: '1015 AA',
  city: 'Amsterdam',
  phone: '06-12345678',
  email: 'ahmed.hassan@example.com',
  bsn: '',
  iban: '',
  documentNumber: 'AB1234567',
  moveDate: '2024-02-01',
};

export function useLocalPII() {
  const [piiData, setPiiData] = useState<PIIData>(emptyPII);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setPiiData(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored PII:', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(piiData));
    }
  }, [piiData, isLoaded]);

  const updateField = useCallback((field: keyof PIIData, value: string) => {
    setPiiData(prev => ({ ...prev, [field]: value }));
  }, []);

  const clearAll = useCallback(() => {
    setPiiData(emptyPII);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const loadDemo = useCallback(() => {
    setPiiData(DEMO_PII);
  }, []);

  const getFilledCount = useCallback(() => {
    return Object.values(piiData).filter(v => v.trim() !== '').length;
  }, [piiData]);

  return {
    piiData,
    setPiiData,
    updateField,
    clearAll,
    loadDemo,
    isLoaded,
    getFilledCount,
    totalFields: Object.keys(emptyPII).length,
  };
}
