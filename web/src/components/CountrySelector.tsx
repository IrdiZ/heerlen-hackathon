'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Country {
  code: string;
  name: string;
  flag: string;
  users: number;
  estimatedTime: string;
  challenges: string[];
  route: string;
}

const countries: Country[] = [
  {
    code: 'AL',
    name: 'Albania',
    flag: '🇦🇱',
    users: 1247,
    estimatedTime: '3-6 months',
    challenges: ['Work visa required', 'Diploma recognition', 'Dutch integration exam'],
    route: 'MVV → VVR → Integration'
  },
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    users: 3891,
    estimatedTime: '4-8 months',
    challenges: ['Work visa required', 'Language certificate', 'Proof of income'],
    route: 'MVV → VVR → BSN Registration'
  },
  {
    code: 'RS',
    name: 'Serbia',
    flag: '🇷🇸',
    users: 892,
    estimatedTime: '3-5 months',
    challenges: ['Visa-free entry 90 days', 'Work permit needed', 'Housing registration'],
    route: 'Tourist Entry → Work Permit → VVR'
  },
  {
    code: 'UA',
    name: 'Ukraine',
    flag: '🇺🇦',
    users: 8234,
    estimatedTime: '1-3 months',
    challenges: ['Temporary protection status', 'Document translation', 'BSN registration'],
    route: 'Temporary Protection → Registration → Integration'
  },
  {
    code: 'MA',
    name: 'Morocco',
    flag: '🇲🇦',
    users: 5621,
    estimatedTime: '4-7 months',
    challenges: ['MVV required', 'Integration abroad exam', 'Sponsor requirements'],
    route: 'MVV → VVR → Civic Integration'
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    users: 2156,
    estimatedTime: '3-6 months',
    challenges: ['Work visa required', 'Document apostille', 'Health insurance'],
    route: 'MVV → VVR → BSN → DigiD'
  }
];

interface CountrySelectorProps {
  onSelect?: (country: Country) => void;
  onStartJourney?: (country: Country) => void;
}

export function CountrySelector({ onSelect, onStartJourney }: CountrySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const handleSelect = (country: Country) => {
    setSelectedCountry(country);
    onSelect?.(country);
  };

  const handleStartJourney = () => {
    if (selectedCountry) {
      onStartJourney?.(selectedCountry);
    }
  };

  return (
    <div className="w-full">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Where are you from?
        </h2>
        <p className="text-slate-400">
          Select your country to see your personalized journey to the Netherlands
        </p>
      </motion.div>

      {/* Flag grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4 mb-8"
      >
        {countries.map((country, index) => (
          <motion.button
            key={country.code}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.05, type: 'spring', stiffness: 300 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(country)}
            onMouseEnter={() => setHoveredCountry(country.code)}
            onMouseLeave={() => setHoveredCountry(null)}
            className={`
              relative group p-3 sm:p-4 rounded-2xl transition-all duration-300 cursor-pointer
              backdrop-blur-sm border
              ${selectedCountry?.code === country.code
                ? 'bg-orange-500/20 border-orange-500 shadow-lg shadow-orange-500/30'
                : 'bg-white/5 border-white/10 hover:border-orange-500/50 hover:bg-white/10'
              }
            `}
          >
            {/* Selected glow effect */}
            {selectedCountry?.code === country.code && (
              <motion.div
                layoutId="selectedGlow"
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/20 to-amber-500/20"
                initial={false}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            {/* Flag with wave animation on hover */}
            <motion.div
              className="text-4xl sm:text-5xl mb-2 relative z-10"
              animate={hoveredCountry === country.code ? {
                rotate: [0, -5, 5, -5, 5, 0],
                transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.5 }
              } : { rotate: 0 }}
              style={{ transformOrigin: 'left center' }}
            >
              <span className="filter drop-shadow-lg">{country.flag}</span>
            </motion.div>

            {/* Country name */}
            <p className={`
              text-xs sm:text-sm font-medium truncate relative z-10 transition-colors
              ${selectedCountry?.code === country.code ? 'text-orange-300' : 'text-slate-300 group-hover:text-white'}
            `}>
              {country.name}
            </p>

            {/* Selection checkmark */}
            <AnimatePresence>
              {selectedCountry?.code === country.code && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}

        {/* More coming soon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.0, type: 'spring', stiffness: 300 }}
          className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center opacity-60"
        >
          <motion.div
            className="text-3xl sm:text-4xl mb-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            🌍
          </motion.div>
          <p className="text-xs text-slate-400 text-center">More soon...</p>
        </motion.div>
      </motion.div>

      {/* User stat for selected country */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="text-center mb-6"
          >
            <motion.p
              className="text-orange-400 font-medium"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              key={selectedCountry.code}
            >
              <span className="text-2xl">{selectedCountry.flag}</span>
              {' '}
              <span className="text-white font-bold">{selectedCountry.users.toLocaleString()}</span>
              {' '}
              people from {selectedCountry.name} used Welkom.ai
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected country details card */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative overflow-hidden"
          >
            {/* Glass card */}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8">
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/20 via-transparent to-amber-500/20 opacity-50" />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <motion.span
                    className="text-5xl"
                    animate={{ 
                      rotate: [0, -3, 3, -3, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                    style={{ transformOrigin: 'left center' }}
                  >
                    {selectedCountry.flag}
                  </motion.span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {selectedCountry.name} → Netherlands
                    </h3>
                    <p className="text-slate-400">
                      Your immigration journey
                    </p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {/* Route */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-orange-400 mb-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span className="text-sm font-medium">Route</span>
                    </div>
                    <p className="text-white font-semibold text-sm">{selectedCountry.route}</p>
                  </div>

                  {/* Estimated time */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">Timeline</span>
                    </div>
                    <p className="text-white font-semibold text-sm">{selectedCountry.estimatedTime}</p>
                  </div>

                  {/* Users */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-medium">Community</span>
                    </div>
                    <p className="text-white font-semibold text-sm">{selectedCountry.users.toLocaleString()} helped</p>
                  </div>
                </div>

                {/* Challenges preview */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    Key challenges we&apos;ll help you with
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCountry.challenges.map((challenge, index) => (
                      <motion.span
                        key={challenge}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm rounded-full"
                      >
                        {challenge}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <motion.button
                  onClick={handleStartJourney}
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -10px rgba(249, 115, 22, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-3 group"
                >
                  <span>Start your journey</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CountrySelector;
