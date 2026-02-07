'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

interface CityData {
  name: string;
  region: string;
  rent: { studio: number; oneBedroom: number; twoBedroom: number };
  utilities: number;
  transport: number;
  groceries: number;
  internet: number;
}

interface VisaType {
  name: string;
  nameNL: string;
  fee: number;
  processingTime: string;
  description: string;
}

interface CurrencyRates {
  EUR: number;
  USD: number;
  GBP: number;
  ALL: number; // Albanian Lek
  MKD: number; // Macedonian Denar
  RSD: number; // Serbian Dinar
  UAH: number; // Ukrainian Hryvnia
}

// ============================================================================
// REALISTIC DUTCH COST DATA (2024)
// ============================================================================

const CURRENCY_RATES: CurrencyRates = {
  EUR: 1,
  USD: 1.09,
  GBP: 0.86,
  ALL: 102.5, // Albanian Lek
  MKD: 61.5,  // Macedonian Denar
  RSD: 117.2, // Serbian Dinar
  UAH: 40.5,  // Ukrainian Hryvnia
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  ALL: 'L',
  MKD: 'ден',
  RSD: 'дин',
  UAH: '₴',
};

const CITIES: CityData[] = [
  {
    name: 'Amsterdam',
    region: 'Noord-Holland',
    rent: { studio: 1450, oneBedroom: 1800, twoBedroom: 2400 },
    utilities: 180,
    transport: 100,
    groceries: 350,
    internet: 45,
  },
  {
    name: 'Rotterdam',
    region: 'Zuid-Holland',
    rent: { studio: 1100, oneBedroom: 1400, twoBedroom: 1900 },
    utilities: 170,
    transport: 95,
    groceries: 320,
    internet: 42,
  },
  {
    name: 'The Hague',
    region: 'Zuid-Holland',
    rent: { studio: 1150, oneBedroom: 1450, twoBedroom: 2000 },
    utilities: 175,
    transport: 95,
    groceries: 330,
    internet: 42,
  },
  {
    name: 'Utrecht',
    region: 'Utrecht',
    rent: { studio: 1200, oneBedroom: 1500, twoBedroom: 2100 },
    utilities: 170,
    transport: 90,
    groceries: 330,
    internet: 42,
  },
  {
    name: 'Eindhoven',
    region: 'Noord-Brabant',
    rent: { studio: 950, oneBedroom: 1200, twoBedroom: 1600 },
    utilities: 160,
    transport: 80,
    groceries: 300,
    internet: 40,
  },
  {
    name: 'Groningen',
    region: 'Groningen',
    rent: { studio: 850, oneBedroom: 1050, twoBedroom: 1400 },
    utilities: 155,
    transport: 70,
    groceries: 290,
    internet: 38,
  },
  {
    name: 'Maastricht',
    region: 'Limburg',
    rent: { studio: 800, oneBedroom: 1000, twoBedroom: 1350 },
    utilities: 150,
    transport: 65,
    groceries: 280,
    internet: 38,
  },
  {
    name: 'Heerlen',
    region: 'Limburg',
    rent: { studio: 650, oneBedroom: 800, twoBedroom: 1050 },
    utilities: 145,
    transport: 60,
    groceries: 270,
    internet: 35,
  },
  {
    name: 'Tilburg',
    region: 'Noord-Brabant',
    rent: { studio: 900, oneBedroom: 1100, twoBedroom: 1450 },
    utilities: 155,
    transport: 75,
    groceries: 295,
    internet: 38,
  },
  {
    name: 'Leiden',
    region: 'Zuid-Holland',
    rent: { studio: 1050, oneBedroom: 1350, twoBedroom: 1800 },
    utilities: 165,
    transport: 85,
    groceries: 320,
    internet: 40,
  },
];

const VISA_TYPES: VisaType[] = [
  {
    name: 'Highly Skilled Migrant',
    nameNL: 'Kennismigrant',
    fee: 210,
    processingTime: '2 weeks',
    description: 'For skilled workers with a job offer from a recognized sponsor',
  },
  {
    name: 'EU Blue Card',
    nameNL: 'Europese Blauwe Kaart',
    fee: 210,
    processingTime: '2 weeks',
    description: 'For highly qualified non-EU workers',
  },
  {
    name: 'Orientation Year',
    nameNL: 'Zoekjaar',
    fee: 192,
    processingTime: '2 weeks',
    description: 'For recent graduates to seek employment',
  },
  {
    name: 'Family Reunification',
    nameNL: 'Gezinshereniging',
    fee: 207,
    processingTime: '3 months',
    description: 'To join a family member already in NL',
  },
  {
    name: 'Self-Employment',
    nameNL: 'Zelfstandig Ondernemer',
    fee: 1474,
    processingTime: '3 months',
    description: 'For entrepreneurs starting a business',
  },
  {
    name: 'Study Visa',
    nameNL: 'Studie',
    fee: 192,
    processingTime: '2 weeks',
    description: 'For international students',
  },
];

const SETTLEMENT_COSTS = {
  depositMonths: 2,
  healthInsuranceMonthly: 140,
  temporaryHousingPerWeek: 600,
  movingCosts: 500,
  furnitureBasic: 2000,
  emergencyFund: 1000,
};

const SAVINGS_TIPS = [
  {
    title: 'Housing Deposits',
    tip: 'Many landlords accept 1-month deposit with a permanent work contract. Negotiate!',
    savings: '€800-1600',
    icon: '🏠',
  },
  {
    title: 'Second-hand Furniture',
    tip: 'Check Marktplaats, Facebook Marketplace, and Kringloop stores for quality used items',
    savings: '€1000-1500',
    icon: '🛋️',
  },
  {
    title: 'Shared Housing',
    tip: 'Consider kamers (rooms) or anti-kraak for first months while you settle',
    savings: '€400-800/mo',
    icon: '👥',
  },
  {
    title: 'Health Insurance',
    tip: 'Compare at Independer.nl - switching insurers yearly can save significantly',
    savings: '€20-50/mo',
    icon: '🏥',
  },
  {
    title: 'Public Transport',
    tip: 'Get OV-chipkaart with Dal Voordeel (40% off outside rush hours) for €5/month',
    savings: '€30-60/mo',
    icon: '🚌',
  },
  {
    title: 'Groceries',
    tip: 'Shop at Lidl, Aldi, or PLUS. Use Too Good To Go app for discounted food',
    savings: '€50-100/mo',
    icon: '🛒',
  },
  {
    title: 'Phone Plans',
    tip: 'Ben, Simyo, or Lebara offer €10-15/mo plans vs €30+ at KPN/T-Mobile',
    savings: '€15-20/mo',
    icon: '📱',
  },
  {
    title: 'Bike Instead of Transit',
    tip: 'Get a second-hand bike (€50-150) - Dutch cities are perfectly flat!',
    savings: '€50-100/mo',
    icon: '🚴',
  },
];

// ============================================================================
// HOOKS
// ============================================================================

function useAnimatedNumber(value: number, duration: number = 1500) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const difference = value - startValue;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startValue + difference * easeOutQuart;
      
      setDisplayValue(Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return displayValue;
}

function useConfetti() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);

  const triggerConfetti = useCallback(() => {
    const colors = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#22c55e', '#3b82f6'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 3000);
  }, []);

  return { particles, triggerConfetti };
}

// ============================================================================
// COMPONENTS
// ============================================================================

function Confetti({ particles }: { particles: Array<{ id: number; x: number; color: string; delay: number }> }) {
  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ y: -20, x: `${particle.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ 
            y: '100vh', 
            opacity: 0,
            rotate: Math.random() > 0.5 ? 360 : -360,
          }}
          transition={{ 
            duration: 2.5 + Math.random(), 
            delay: particle.delay,
            ease: 'easeIn',
          }}
          className="absolute w-3 h-3"
          style={{ backgroundColor: particle.color, borderRadius: Math.random() > 0.5 ? '50%' : '0' }}
        />
      ))}
    </div>
  );
}

function Header() {
  return (
    <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🌍</span>
            <h1 className="text-xl font-bold text-white">MigrantAI</h1>
          </Link>
          <span className="text-gray-500">|</span>
          <span className="text-slate-300 font-medium">💰 Cost Calculator</span>
        </div>
        <Link
          href="/"
          className="text-slate-400 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5"
        >
          ← Back to Home
        </Link>
      </div>
    </header>
  );
}

function GlassCard({ children, className = '', gradient = false }: { children: React.ReactNode; className?: string; gradient?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl ${
        gradient 
          ? 'bg-gradient-to-br from-orange-500/20 via-slate-900/80 to-slate-900/90' 
          : 'bg-slate-900/70'
      } ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function AnimatedCostDisplay({ amount, label, sublabel, currency = 'EUR', showChange = false }: { 
  amount: number; 
  label: string; 
  sublabel?: string; 
  currency?: string;
  showChange?: boolean;
}) {
  const animatedValue = useAnimatedNumber(amount);
  const rate = CURRENCY_RATES[currency as keyof CurrencyRates] || 1;
  const symbol = CURRENCY_SYMBOLS[currency] || '€';
  const convertedAmount = Math.round(animatedValue * rate);

  return (
    <motion.div 
      className="flex justify-between items-center py-4 px-5 border-b border-white/5 hover:bg-white/5 transition-colors rounded-lg"
      whileHover={{ x: 4 }}
    >
      <div>
        <span className="text-slate-200 font-medium">{label}</span>
        {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
      </div>
      <motion.span 
        className="font-mono text-lg text-white font-semibold"
        key={convertedAmount}
        initial={{ scale: 1.2, color: '#f97316' }}
        animate={{ scale: 1, color: '#ffffff' }}
        transition={{ duration: 0.3 }}
      >
        {symbol}{convertedAmount.toLocaleString('nl-NL')}
      </motion.span>
    </motion.div>
  );
}

function AnimatedProgressBar({ value, max, color = 'orange', label }: { value: number; max: number; color?: string; label: string }) {
  const percentage = (value / max) * 100;
  
  const colorClasses: Record<string, string> = {
    orange: 'from-orange-500 to-orange-400',
    green: 'from-green-500 to-emerald-400',
    blue: 'from-blue-500 to-cyan-400',
    purple: 'from-purple-500 to-pink-400',
    red: 'from-red-500 to-rose-400',
  };

  return (
    <div className="flex items-center gap-4">
      <span className="w-28 text-sm text-slate-400">{label}</span>
      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <span className="w-16 text-sm text-slate-300 text-right font-mono">€{value}</span>
    </div>
  );
}

function CurrencySelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const currencies = Object.keys(CURRENCY_RATES);
  
  return (
    <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-1">
      {currencies.map((curr) => (
        <button
          key={curr}
          onClick={() => onChange(curr)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            value === curr 
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {curr}
        </button>
      ))}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-5 py-4 font-medium text-sm transition-all duration-200 ${
        active
          ? 'text-orange-400'
          : 'text-slate-400 hover:text-white'
      }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400"
        />
      )}
    </button>
  );
}

function CollapsibleTips() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  return (
    <GlassCard className="p-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-lg font-semibold text-white">Money-Saving Tips</h3>
            <p className="text-sm text-slate-400">Click to reveal insider tips that could save you €1000+</p>
          </div>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl text-orange-400"
        >
          ⌄
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              {SAVINGS_TIPS.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setExpandedTip(expandedTip === index ? null : index)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    expandedTip === index 
                      ? 'bg-orange-500/20 border border-orange-500/30' 
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{tip.icon}</span>
                      <span className="font-medium text-white">{tip.title}</span>
                    </div>
                    <span className="text-green-400 font-mono text-sm">{tip.savings}</span>
                  </div>
                  <AnimatePresence>
                    {expandedTip === index && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-sm text-slate-400 mt-3"
                      >
                        {tip.tip}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function VisaComparisonChart({ selectedVisa }: { selectedVisa: string | null }) {
  const maxFee = Math.max(...VISA_TYPES.map(v => v.fee));

  return (
    <div className="space-y-3">
      {VISA_TYPES.map((visa, index) => (
        <motion.div
          key={visa.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative ${selectedVisa === visa.name ? 'scale-[1.02]' : ''} transition-transform`}
        >
          <div className="flex items-center gap-4">
            <span className="w-40 text-sm text-slate-300 truncate">{visa.name}</span>
            <div className="flex-1 h-8 bg-slate-800 rounded-lg overflow-hidden relative">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-lg ${
                  selectedVisa === visa.name 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-400' 
                    : 'bg-gradient-to-r from-slate-600 to-slate-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${(visa.fee / maxFee) * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
              />
              <span className="absolute inset-0 flex items-center justify-end pr-3 text-sm font-mono text-white">
                €{visa.fee}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ShareButton({ costs }: { costs: { total: number; breakdown: Record<string, number> } }) {
  const [copied, setCopied] = useState(false);

  const generateShareUrl = () => {
    const params = new URLSearchParams({
      total: costs.total.toString(),
      ...Object.fromEntries(Object.entries(costs.breakdown).map(([k, v]) => [k, v.toString()])),
    });
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/calculator?${params.toString()}`;
  };

  const handleShare = async () => {
    const url = generateShareUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Netherlands Migration Cost Estimate',
          text: `Total estimated cost: €${costs.total.toLocaleString('nl-NL')}`,
          url,
        });
      } catch {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.button
      onClick={handleShare}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-shadow"
    >
      {copied ? (
        <>
          <span>✓</span>
          <span>Link Copied!</span>
        </>
      ) : (
        <>
          <span>📤</span>
          <span>Share Estimate</span>
        </>
      )}
    </motion.button>
  );
}

// ============================================================================
// TAB: TOTAL JOURNEY COST
// ============================================================================

function TotalJourneyCostTab() {
  const [selectedCity, setSelectedCity] = useState<string>('Heerlen');
  const [apartmentType, setApartmentType] = useState<'studio' | 'oneBedroom' | 'twoBedroom'>('oneBedroom');
  const [selectedVisa, setSelectedVisa] = useState<string>('Highly Skilled Migrant');
  const [isAlbanian, setIsAlbanian] = useState(false);
  const [currency, setCurrency] = useState('EUR');
  const [calculated, setCalculated] = useState(false);
  const { particles, triggerConfetti } = useConfetti();

  const city = CITIES.find(c => c.name === selectedCity) || CITIES[7];
  const visa = VISA_TYPES.find(v => v.name === selectedVisa) || VISA_TYPES[0];
  const monthlyRent = city.rent[apartmentType];

  // Cost calculations
  const governmentFees = {
    visaFee: visa.fee,
    mvvFee: 210, // Entry visa if needed
    total: visa.fee + 210,
  };

  const travelCosts = {
    flights: 250, // Average one-way to NL
    skopjeTrip: isAlbanian ? 150 : 0, // Kosovo/Albania visa in Skopje
    localTransport: 50,
    total: 250 + (isAlbanian ? 150 : 0) + 50,
  };

  const documentCosts = {
    apostille: 100,
    translations: 150, // ~4-5 documents
    certificates: 50,
    photos: 20,
    total: 100 + 150 + 50 + 20,
  };

  const livingCostsFirstMonth = {
    deposit: monthlyRent * 2,
    firstRent: monthlyRent,
    healthInsurance: 140,
    groceries: city.groceries,
    transport: city.transport,
    utilities: city.utilities,
    total: monthlyRent * 3 + 140 + city.groceries + city.transport + city.utilities,
  };

  const grandTotal = governmentFees.total + travelCosts.total + documentCosts.total + livingCostsFirstMonth.total;

  const handleCalculate = () => {
    setCalculated(true);
    triggerConfetti();
  };

  const categories = [
    { name: 'Government Fees', amount: governmentFees.total, color: 'orange', icon: '🛂' },
    { name: 'Travel Costs', amount: travelCosts.total, color: 'blue', icon: '✈️' },
    { name: 'Document Costs', amount: documentCosts.total, color: 'purple', icon: '📄' },
    { name: 'First Month Living', amount: livingCostsFirstMonth.total, color: 'green', icon: '🏠' },
  ];

  return (
    <div className="space-y-6">
      <Confetti particles={particles} />

      {/* Configuration */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          Configure Your Journey
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Destination City</label>
            <select
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setCalculated(false); }}
              className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {CITIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Apartment Type</label>
            <select
              value={apartmentType}
              onChange={(e) => { setApartmentType(e.target.value as typeof apartmentType); setCalculated(false); }}
              className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="studio">Studio</option>
              <option value="oneBedroom">1 Bedroom</option>
              <option value="twoBedroom">2 Bedroom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Visa Type</label>
            <select
              value={selectedVisa}
              onChange={(e) => { setSelectedVisa(e.target.value); setCalculated(false); }}
              className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
            >
              {VISA_TYPES.map(v => (
                <option key={v.name} value={v.name}>{v.name} (€{v.fee})</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-3 cursor-pointer bg-slate-800/50 p-3 rounded-xl border border-white/10">
              <input
                type="checkbox"
                checked={isAlbanian}
                onChange={(e) => { setIsAlbanian(e.target.checked); setCalculated(false); }}
                className="w-5 h-5 rounded border-slate-600 text-orange-500 focus:ring-orange-500 bg-slate-700"
              />
              <div>
                <span className="text-sm text-white">Kosovo/Albania</span>
                <p className="text-xs text-slate-500">Includes Skopje trip</p>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <CurrencySelector value={currency} onChange={setCurrency} />
          <motion.button
            onClick={handleCalculate}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
          >
            🧮 Calculate Total Cost
          </motion.button>
        </div>
      </GlassCard>

      <AnimatePresence>
        {calculated && (
          <>
            {/* Grand Total Hero Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard gradient className="p-8 text-center">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Total Journey Cost</p>
                <motion.h2 
                  className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  {CURRENCY_SYMBOLS[currency]}{useAnimatedNumber(Math.round(grandTotal * (CURRENCY_RATES[currency as keyof CurrencyRates] || 1))).toLocaleString('nl-NL')}
                </motion.h2>
                <p className="text-slate-400 mt-3">
                  For moving to {selectedCity} with {visa.name}
                </p>
                <div className="mt-6 flex justify-center">
                  <ShareButton costs={{ total: grandTotal, breakdown: { gov: governmentFees.total, travel: travelCosts.total, docs: documentCosts.total, living: livingCostsFirstMonth.total } }} />
                </div>
              </GlassCard>
            </motion.div>

            {/* Category Breakdown Visual */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Cost Distribution
              </h3>
              <div className="space-y-4">
                {categories.map((cat, index) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <AnimatedProgressBar
                      value={cat.amount}
                      max={grandTotal}
                      color={cat.color}
                      label={`${cat.icon} ${cat.name}`}
                    />
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* Detailed Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Government Fees */}
              <GlassCard className="p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  🛂 Government Fees
                </h4>
                <AnimatedCostDisplay label="Visa/Permit Fee" amount={governmentFees.visaFee} sublabel={visa.name} currency={currency} />
                <AnimatedCostDisplay label="MVV Entry Visa" amount={governmentFees.mvvFee} sublabel="If required" currency={currency} />
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-400 font-medium">Subtotal</span>
                    <span className="text-xl font-bold text-orange-400 font-mono">
                      {CURRENCY_SYMBOLS[currency]}{Math.round(governmentFees.total * (CURRENCY_RATES[currency as keyof CurrencyRates] || 1)).toLocaleString('nl-NL')}
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Travel Costs */}
              <GlassCard className="p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  ✈️ Travel Costs
                </h4>
                <AnimatedCostDisplay label="Flight to Netherlands" amount={travelCosts.flights} sublabel="One-way estimate" currency={currency} />
                {isAlbanian && (
                  <AnimatedCostDisplay label="Skopje Visa Trip" amount={travelCosts.skopjeTrip} sublabel="Bus + accommodation" currency={currency} />
                )}
                <AnimatedCostDisplay label="Local Transport" amount={travelCosts.localTransport} sublabel="Airport to city" currency={currency} />
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-400 font-medium">Subtotal</span>
                    <span className="text-xl font-bold text-blue-400 font-mono">
                      {CURRENCY_SYMBOLS[currency]}{Math.round(travelCosts.total * (CURRENCY_RATES[currency as keyof CurrencyRates] || 1)).toLocaleString('nl-NL')}
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Document Costs */}
              <GlassCard className="p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  📄 Document Costs
                </h4>
                <AnimatedCostDisplay label="Apostille" amount={documentCosts.apostille} sublabel="Document legalization" currency={currency} />
                <AnimatedCostDisplay label="Sworn Translations" amount={documentCosts.translations} sublabel="~4-5 documents" currency={currency} />
                <AnimatedCostDisplay label="Certificates" amount={documentCosts.certificates} sublabel="Birth, degree, etc." currency={currency} />
                <AnimatedCostDisplay label="Passport Photos" amount={documentCosts.photos} sublabel="Biometric format" currency={currency} />
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400 font-medium">Subtotal</span>
                    <span className="text-xl font-bold text-purple-400 font-mono">
                      {CURRENCY_SYMBOLS[currency]}{Math.round(documentCosts.total * (CURRENCY_RATES[currency as keyof CurrencyRates] || 1)).toLocaleString('nl-NL')}
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* First Month Living */}
              <GlassCard className="p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  🏠 First Month Living ({city.name})
                </h4>
                <AnimatedCostDisplay label="Security Deposit" amount={livingCostsFirstMonth.deposit} sublabel="2 months rent" currency={currency} />
                <AnimatedCostDisplay label="First Month Rent" amount={livingCostsFirstMonth.firstRent} sublabel={apartmentType} currency={currency} />
                <AnimatedCostDisplay label="Health Insurance" amount={livingCostsFirstMonth.healthInsurance} sublabel="Mandatory" currency={currency} />
                <AnimatedCostDisplay label="Groceries" amount={livingCostsFirstMonth.groceries} currency={currency} />
                <AnimatedCostDisplay label="Transport" amount={livingCostsFirstMonth.transport} currency={currency} />
                <AnimatedCostDisplay label="Utilities" amount={livingCostsFirstMonth.utilities} currency={currency} />
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-medium">Subtotal</span>
                    <span className="text-xl font-bold text-green-400 font-mono">
                      {CURRENCY_SYMBOLS[currency]}{Math.round(livingCostsFirstMonth.total * (CURRENCY_RATES[currency as keyof CurrencyRates] || 1)).toLocaleString('nl-NL')}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Savings Tips */}
            <CollapsibleTips />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// TAB: VISA COMPARISON
// ============================================================================

function VisaComparisonTab() {
  const [selectedVisa, setSelectedVisa] = useState<string | null>(null);
  const [currency, setCurrency] = useState('EUR');

  const selectedVisaData = VISA_TYPES.find(v => v.name === selectedVisa);

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Visa Fee Comparison
          </h3>
          <CurrencySelector value={currency} onChange={setCurrency} />
        </div>
        <VisaComparisonChart selectedVisa={selectedVisa} />
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">🛂 Visa Types (Click for Details)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VISA_TYPES.map((visa, index) => (
            <motion.div
              key={visa.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedVisa(selectedVisa === visa.name ? null : visa.name)}
              className={`p-5 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                selectedVisa === visa.name
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-white">{visa.name}</h4>
                <span className="font-mono font-bold text-orange-400">
                  {CURRENCY_SYMBOLS[currency]}{Math.round(visa.fee * (CURRENCY_RATES[currency as keyof CurrencyRates] || 1))}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-2">{visa.nameNL}</p>
              <AnimatePresence>
                {selectedVisa === visa.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-sm text-slate-300">{visa.description}</p>
                      <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                        <span>⏱️</span>
                        Processing: <span className="font-medium text-white">{visa.processingTime}</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {selectedVisaData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard gradient className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">📋 Additional Costs for {selectedVisaData.name}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'MVV Entry Visa', amount: 210 },
                { label: 'Legalization', amount: 50 },
                { label: 'Translation/page', amount: 35 },
                { label: 'TB Test', amount: 90 },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-orange-400 font-mono">
                    {CURRENCY_SYMBOLS[currency]}{Math.round(item.amount * (CURRENCY_RATES[currency as keyof CurrencyRates] || 1))}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// TAB: CITY COMPARISON
// ============================================================================

function CityComparisonTab() {
  const [selectedCities, setSelectedCities] = useState<string[]>(['Heerlen', 'Amsterdam', 'Rotterdam']);
  const [apartmentType, setApartmentType] = useState<'studio' | 'oneBedroom' | 'twoBedroom'>('oneBedroom');
  const [currency, setCurrency] = useState('EUR');

  const toggleCity = (cityName: string) => {
    if (selectedCities.includes(cityName)) {
      if (selectedCities.length > 1) {
        setSelectedCities(selectedCities.filter(c => c !== cityName));
      }
    } else if (selectedCities.length < 4) {
      setSelectedCities([...selectedCities, cityName]);
    }
  };

  const comparedCities = CITIES.filter(c => selectedCities.includes(c.name));
  
  const getMonthlyTotal = (city: CityData) => {
    return city.rent[apartmentType] + city.utilities + city.groceries + city.transport + city.internet + SETTLEMENT_COSTS.healthInsuranceMonthly;
  };

  const lowestTotal = Math.min(...comparedCities.map(getMonthlyTotal));
  const highestTotal = Math.max(...comparedCities.map(getMonthlyTotal));
  const rate = CURRENCY_RATES[currency as keyof CurrencyRates] || 1;

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">🏙️</span>
            Select Cities (max 4)
          </h3>
          <CurrencySelector value={currency} onChange={setCurrency} />
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {CITIES.map(city => (
            <motion.button
              key={city.name}
              onClick={() => toggleCity(city.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCities.includes(city.name)
                  ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {city.name}
            </motion.button>
          ))}
        </div>
        
        <select
          value={apartmentType}
          onChange={(e) => setApartmentType(e.target.value as typeof apartmentType)}
          className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-orange-500"
        >
          <option value="studio">Studio</option>
          <option value="oneBedroom">1 Bedroom</option>
          <option value="twoBedroom">2 Bedroom</option>
        </select>
      </GlassCard>

      {/* Visual Bar Comparison */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">📊 Monthly Cost Comparison</h3>
        <div className="space-y-4">
          {comparedCities
            .sort((a, b) => getMonthlyTotal(a) - getMonthlyTotal(b))
            .map((city, index) => {
              const total = getMonthlyTotal(city);
              const isLowest = total === lowestTotal;
              const savings = (highestTotal - total) * 12;
              
              return (
                <motion.div
                  key={city.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-32 flex items-center gap-2">
                      <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '4️⃣'}</span>
                      <span className="text-white font-medium">{city.name}</span>
                    </div>
                    <div className="flex-1 h-10 bg-slate-800 rounded-xl overflow-hidden relative">
                      <motion.div
                        className={`absolute inset-y-0 left-0 rounded-xl ${
                          isLowest 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                            : 'bg-gradient-to-r from-slate-600 to-slate-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(total / highestTotal) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-4">
                        <span className="text-white font-mono font-semibold z-10">
                          {CURRENCY_SYMBOLS[currency]}{Math.round(total * rate).toLocaleString('nl-NL')}/mo
                        </span>
                        {isLowest && <span className="text-xs bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full z-10">Cheapest</span>}
                      </div>
                    </div>
                    <div className="w-36 text-right">
                      <span className="text-green-400 text-sm font-mono">
                        {savings > 0 ? `Save ${CURRENCY_SYMBOLS[currency]}${Math.round(savings * rate).toLocaleString('nl-NL')}/yr` : '—'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </GlassCard>

      {/* Detailed Table */}
      <GlassCard className="p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Category</th>
              {comparedCities.map(city => (
                <th key={city.name} className="px-4 py-3 text-center text-sm font-semibold text-white">
                  {city.name}
                  <span className="block text-xs font-normal text-slate-500">{city.region}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { icon: '🏠', label: 'Rent', getValue: (c: CityData) => c.rent[apartmentType] },
              { icon: '💡', label: 'Utilities', getValue: (c: CityData) => c.utilities },
              { icon: '🛒', label: 'Groceries', getValue: (c: CityData) => c.groceries },
              { icon: '🚌', label: 'Transport', getValue: (c: CityData) => c.transport },
              { icon: '📱', label: 'Internet', getValue: (c: CityData) => c.internet },
              { icon: '🏥', label: 'Health Insurance', getValue: () => SETTLEMENT_COSTS.healthInsuranceMonthly },
            ].map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-white/5' : ''}>
                <td className="px-4 py-3 text-sm text-slate-300">{row.icon} {row.label}</td>
                {comparedCities.map(city => (
                  <td key={city.name} className="px-4 py-3 text-center font-mono text-white">
                    {CURRENCY_SYMBOLS[currency]}{Math.round(row.getValue(city) * rate)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t-2 border-orange-500/50 bg-gradient-to-r from-orange-500/10 to-transparent">
              <td className="px-4 py-4 text-sm font-semibold text-orange-400">📊 TOTAL</td>
              {comparedCities.map(city => {
                const total = getMonthlyTotal(city);
                const isLowest = total === lowestTotal;
                return (
                  <td key={city.name} className={`px-4 py-4 text-center font-mono font-bold text-lg ${isLowest ? 'text-green-400' : 'text-white'}`}>
                    {CURRENCY_SYMBOLS[currency]}{Math.round(total * rate)}
                    {isLowest && <span className="block text-xs text-green-400">💚 Best</span>}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

type TabType = 'journey' | 'visa' | 'cities';

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<TabType>('journey');

  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'journey':
        return <TotalJourneyCostTab />;
      case 'visa':
        return <VisaComparisonTab />;
      case 'cities':
        return <CityComparisonTab />;
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        <Header />
        
        {/* Tab Navigation */}
        <div className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex overflow-x-auto">
              <TabButton active={activeTab === 'journey'} onClick={() => setActiveTab('journey')}>
                🧮 Total Journey Cost
              </TabButton>
              <TabButton active={activeTab === 'visa'} onClick={() => setActiveTab('visa')}>
                🛂 Visa Comparison
              </TabButton>
              <TabButton active={activeTab === 'cities'} onClick={() => setActiveTab('cities')}>
                🏙️ City Comparison
              </TabButton>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-6xl mx-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900/50 backdrop-blur-xl border-t border-white/10 mt-12 py-6">
          <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
            <p>💡 All costs are estimates based on 2024 data and may vary.</p>
            <p className="mt-1">Always verify current rates with official sources.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
