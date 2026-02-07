'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

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

// ============================================================================
// REALISTIC DUTCH COST DATA (2024)
// ============================================================================

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
    name: 'Highly Skilled Migrant (Kennismigrant)',
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
    name: 'Orientation Year (Zoekjaar)',
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
  {
    name: 'Intra-Corporate Transfer',
    nameNL: 'Overplaatsing binnen een onderneming',
    fee: 360,
    processingTime: '2 weeks',
    description: 'For employees transferred within multinational companies',
  },
  {
    name: 'Long-term Resident EU',
    nameNL: 'Langdurig Ingezetene EU',
    fee: 192,
    processingTime: '6 months',
    description: 'After 5 years of legal residence',
  },
];

// Zorgtoeslag thresholds for 2024
const ZORGTOESLAG = {
  maxIncomeSingle: 38520,
  maxIncomeCouple: 48224,
  maxBenefit: 1605, // per year
  incomeThreshold: 25000, // start reducing above this
};

// Initial settlement costs
const SETTLEMENT_COSTS = {
  depositMonths: 2, // Typical deposit is 1-3 months
  healthInsuranceMonthly: 140, // Basic package average
  bankAccountFee: 0,
  bsnRegistrationFee: 0, // Free
  municipalityRegistration: 0, // Free
  temporaryHousingPerWeek: 600,
  movingCosts: 500,
  furnitureBasic: 2000,
  emergencyFund: 1000,
};

// ============================================================================
// COMPONENTS
// ============================================================================

function Header() {
  return (
    <header className="bg-white border-b px-4 sm:px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🌍</span>
            <h1 className="text-xl font-bold text-gray-800">MigrantAI</h1>
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600 font-medium">💰 Cost Calculator</span>
        </div>
        <Link
          href="/"
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200 px-3 py-2 rounded hover:bg-gray-100"
        >
          ← Back to Home
        </Link>
      </div>
    </header>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 font-medium text-sm transition-all duration-200 border-b-2 ${
        active
          ? 'text-blue-600 border-blue-600 bg-blue-50'
          : 'text-gray-600 border-transparent hover:text-gray-800 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

function CostRow({ label, amount, sublabel, highlight }: { label: string; amount: number; sublabel?: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-3 px-4 ${highlight ? 'bg-blue-50 rounded-lg' : 'border-b border-gray-100'}`}>
      <div>
        <span className={highlight ? 'font-semibold text-blue-900' : 'text-gray-700'}>{label}</span>
        {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
      </div>
      <span className={`font-mono ${highlight ? 'font-bold text-blue-900 text-lg' : 'text-gray-900'}`}>
        €{amount.toLocaleString('nl-NL')}
      </span>
    </div>
  );
}

// ============================================================================
// TAB: INITIAL SETTLEMENT
// ============================================================================

function InitialSettlementTab() {
  const [selectedCity, setSelectedCity] = useState<string>('Heerlen');
  const [apartmentType, setApartmentType] = useState<'studio' | 'oneBedroom' | 'twoBedroom'>('oneBedroom');
  const [tempHousingWeeks, setTempHousingWeeks] = useState(2);
  const [includeFurniture, setIncludeFurniture] = useState(true);

  const city = CITIES.find(c => c.name === selectedCity) || CITIES[7];
  const monthlyRent = city.rent[apartmentType];
  const deposit = monthlyRent * SETTLEMENT_COSTS.depositMonths;
  const firstMonthRent = monthlyRent;
  const healthInsurance = SETTLEMENT_COSTS.healthInsuranceMonthly * 3; // 3 months
  const tempHousing = tempHousingWeeks * SETTLEMENT_COSTS.temporaryHousingPerWeek;
  const furniture = includeFurniture ? SETTLEMENT_COSTS.furnitureBasic : 0;
  
  const total = deposit + firstMonthRent + healthInsurance + tempHousing + 
                SETTLEMENT_COSTS.movingCosts + furniture + SETTLEMENT_COSTS.emergencyFund;

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 Your Situation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CITIES.map(c => (
                <option key={c.name} value={c.name}>{c.name} ({c.region})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apartment Type</label>
            <select
              value={apartmentType}
              onChange={(e) => setApartmentType(e.target.value as typeof apartmentType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="studio">Studio (€{city.rent.studio}/mo)</option>
              <option value="oneBedroom">1 Bedroom (€{city.rent.oneBedroom}/mo)</option>
              <option value="twoBedroom">2 Bedroom (€{city.rent.twoBedroom}/mo)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temporary Housing: {tempHousingWeeks} weeks
            </label>
            <input
              type="range"
              min="0"
              max="8"
              value={tempHousingWeeks}
              onChange={(e) => setTempHousingWeeks(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">While searching for permanent housing</p>
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeFurniture}
                onChange={(e) => setIncludeFurniture(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include basic furniture (€{SETTLEMENT_COSTS.furnitureBasic})</span>
            </label>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">💶 Initial Settlement Costs</h3>
        <div className="space-y-1">
          <CostRow label="Security Deposit" amount={deposit} sublabel={`${SETTLEMENT_COSTS.depositMonths} months rent`} />
          <CostRow label="First Month Rent" amount={firstMonthRent} />
          <CostRow label="Health Insurance" amount={healthInsurance} sublabel="First 3 months (mandatory)" />
          {tempHousingWeeks > 0 && (
            <CostRow label="Temporary Housing" amount={tempHousing} sublabel={`${tempHousingWeeks} weeks at €${SETTLEMENT_COSTS.temporaryHousingPerWeek}/week`} />
          )}
          <CostRow label="Moving Costs" amount={SETTLEMENT_COSTS.movingCosts} sublabel="Transport, shipping, etc." />
          {includeFurniture && (
            <CostRow label="Basic Furniture" amount={furniture} sublabel="Bed, desk, essentials" />
          )}
          <CostRow label="Emergency Fund" amount={SETTLEMENT_COSTS.emergencyFund} sublabel="Recommended buffer" />
          <div className="pt-2">
            <CostRow label="TOTAL INITIAL COSTS" amount={total} highlight />
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Money-Saving Tips</h4>
        <ul className="text-sm text-yellow-700 space-y-2">
          <li>• Many landlords accept 1-month deposit if you have a permanent contract</li>
          <li>• Register with gemeente immediately to get your BSN (free) - needed for everything</li>
          <li>• Check Facebook Marketplace and Marktplaats for second-hand furniture</li>
          <li>• IKEA delivers and assembles for reasonable prices</li>
          <li>• Consider shared housing (kamers) to reduce initial costs significantly</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// TAB: MONTHLY COSTS
// ============================================================================

function MonthlyCostsTab() {
  const [selectedCity, setSelectedCity] = useState<string>('Heerlen');
  const [apartmentType, setApartmentType] = useState<'studio' | 'oneBedroom' | 'twoBedroom'>('oneBedroom');
  const [lifestyle, setLifestyle] = useState<'budget' | 'moderate' | 'comfortable'>('moderate');

  const city = CITIES.find(c => c.name === selectedCity) || CITIES[7];
  
  const lifestyleMultipliers = {
    budget: { groceries: 0.8, transport: 0.7, leisure: 100 },
    moderate: { groceries: 1, transport: 1, leisure: 200 },
    comfortable: { groceries: 1.3, transport: 1.2, leisure: 400 },
  };

  const multiplier = lifestyleMultipliers[lifestyle];
  const rent = city.rent[apartmentType];
  const groceries = Math.round(city.groceries * multiplier.groceries);
  const transport = Math.round(city.transport * multiplier.transport);
  const leisure = multiplier.leisure;
  const healthInsurance = SETTLEMENT_COSTS.healthInsuranceMonthly;
  
  const total = rent + city.utilities + groceries + transport + city.internet + healthInsurance + leisure;

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🏠 Your Living Situation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CITIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apartment</label>
            <select
              value={apartmentType}
              onChange={(e) => setApartmentType(e.target.value as typeof apartmentType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="studio">Studio</option>
              <option value="oneBedroom">1 Bedroom</option>
              <option value="twoBedroom">2 Bedroom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lifestyle</label>
            <select
              value={lifestyle}
              onChange={(e) => setLifestyle(e.target.value as typeof lifestyle)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="budget">Budget-conscious</option>
              <option value="moderate">Moderate</option>
              <option value="comfortable">Comfortable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Monthly Expenses in {city.name}</h3>
        <div className="space-y-1">
          <CostRow label="🏠 Rent" amount={rent} sublabel={apartmentType === 'studio' ? 'Studio apartment' : apartmentType === 'oneBedroom' ? '1 bedroom' : '2 bedrooms'} />
          <CostRow label="💡 Utilities" amount={city.utilities} sublabel="Gas, electricity, water" />
          <CostRow label="🛒 Groceries" amount={groceries} sublabel={`${lifestyle} lifestyle`} />
          <CostRow label="🚌 Transport" amount={transport} sublabel="Public transport / bike" />
          <CostRow label="📱 Internet & Phone" amount={city.internet} />
          <CostRow label="🏥 Health Insurance" amount={healthInsurance} sublabel="Mandatory basic package" />
          <CostRow label="🎭 Leisure & Entertainment" amount={leisure} />
          <div className="pt-2">
            <CostRow label="TOTAL MONTHLY" amount={total} highlight />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Annual cost: €{(total * 12).toLocaleString('nl-NL')}
        </p>
      </div>

      {/* Cost breakdown chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Cost Distribution</h3>
        <div className="space-y-3">
          {[
            { label: 'Rent', amount: rent, color: 'bg-blue-500' },
            { label: 'Utilities', amount: city.utilities, color: 'bg-yellow-500' },
            { label: 'Groceries', amount: groceries, color: 'bg-green-500' },
            { label: 'Transport', amount: transport, color: 'bg-purple-500' },
            { label: 'Insurance', amount: healthInsurance, color: 'bg-red-500' },
            { label: 'Other', amount: city.internet + leisure, color: 'bg-gray-500' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-20 text-sm text-gray-600">{item.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-500`}
                  style={{ width: `${(item.amount / total) * 100}%` }}
                />
              </div>
              <span className="w-20 text-sm text-gray-700 text-right">{Math.round((item.amount / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB: VISA FEES
// ============================================================================

function VisaFeesTab() {
  const [selectedVisa, setSelectedVisa] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">🛂 Visa & Permit Fees (2024)</h3>
        <p className="text-sm text-gray-600 mb-6">
          These are IND (Immigration and Naturalization Service) application fees. Additional legalization costs may apply.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VISA_TYPES.map((visa) => (
            <div
              key={visa.name}
              onClick={() => setSelectedVisa(selectedVisa === visa.name ? null : visa.name)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedVisa === visa.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">{visa.name}</h4>
                <span className="font-mono font-bold text-blue-600">€{visa.fee}</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{visa.nameNL}</p>
              {selectedVisa === visa.name && (
                <div className="mt-3 pt-3 border-t border-gray-200 animate-fade-in">
                  <p className="text-sm text-gray-700">{visa.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    ⏱️ Processing time: <span className="font-medium">{visa.processingTime}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional fees */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Additional Costs to Consider</h3>
        <div className="space-y-1">
          <CostRow label="MVV (Entry Visa)" amount={210} sublabel="If required for your nationality" />
          <CostRow label="Legalization of Documents" amount={50} sublabel="Per document, varies by country" />
          <CostRow label="Translation (Sworn)" amount={35} sublabel="Per page, for official documents" />
          <CostRow label="TB Test" amount={90} sublabel="Required for some countries" />
          <CostRow label="Civic Integration Exam" amount={350} sublabel="If applicable to your permit type" />
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Important Information</h4>
        <ul className="text-sm text-blue-700 space-y-2">
          <li>• Fees are paid online before your appointment</li>
          <li>• Processing times are from complete application</li>
          <li>• 30% ruling can be applied for alongside work permits</li>
          <li>• Keep receipts for all visa-related expenses for tax purposes</li>
          <li>• Check IND website for most current fees: <a href="https://ind.nl" target="_blank" rel="noopener noreferrer" className="underline">ind.nl</a></li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// TAB: ZORGTOESLAG
// ============================================================================

function ZorgtoeslagTab() {
  const [annualIncome, setAnnualIncome] = useState(30000);
  const [hasPartner, setHasPartner] = useState(false);
  const [partnerIncome, setPartnerIncome] = useState(0);

  const totalIncome = hasPartner ? annualIncome + partnerIncome : annualIncome;
  const maxIncome = hasPartner ? ZORGTOESLAG.maxIncomeCouple : ZORGTOESLAG.maxIncomeSingle;
  
  const isEligible = totalIncome <= maxIncome;
  
  // Simplified calculation (actual calculation is more complex)
  let estimatedBenefit = 0;
  if (isEligible) {
    const incomeAboveThreshold = Math.max(0, totalIncome - ZORGTOESLAG.incomeThreshold);
    const reduction = incomeAboveThreshold * 0.1; // Simplified 10% reduction per euro above threshold
    estimatedBenefit = Math.max(0, Math.round(ZORGTOESLAG.maxBenefit - reduction));
  }
  
  const monthlyBenefit = Math.round(estimatedBenefit / 12);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">🏥 Zorgtoeslag Eligibility Check</h3>
        <p className="text-sm text-gray-600 mb-6">
          Zorgtoeslag is a healthcare allowance from the Dutch government to help pay for health insurance.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Annual Gross Income (€)
            </label>
            <input
              type="number"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="range"
              min="0"
              max="60000"
              step="1000"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>
          
          <div>
            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPartner}
                onChange={(e) => setHasPartner(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">I have a fiscal partner (toeslagpartner)</span>
            </label>
            
            {hasPartner && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner&apos;s Annual Income (€)
                </label>
                <input
                  type="number"
                  value={partnerIncome}
                  onChange={(e) => setPartnerIncome(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className={`rounded-xl shadow-lg p-6 ${isEligible ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
        <div className="text-center">
          <span className="text-4xl">{isEligible ? '✅' : '❌'}</span>
          <h3 className={`text-xl font-bold mt-2 ${isEligible ? 'text-green-800' : 'text-red-800'}`}>
            {isEligible ? 'You may be eligible!' : 'Not eligible'}
          </h3>
          
          {isEligible ? (
            <div className="mt-4">
              <p className="text-green-700 mb-4">
                Based on a combined income of €{totalIncome.toLocaleString('nl-NL')}
              </p>
              <div className="bg-white rounded-lg p-4 inline-block">
                <p className="text-sm text-gray-600">Estimated annual benefit</p>
                <p className="text-3xl font-bold text-green-600">€{estimatedBenefit.toLocaleString('nl-NL')}</p>
                <p className="text-sm text-gray-500">~€{monthlyBenefit}/month</p>
              </div>
            </div>
          ) : (
            <p className="text-red-700 mt-4">
              Your combined income (€{totalIncome.toLocaleString('nl-NL')}) exceeds the limit of €{maxIncome.toLocaleString('nl-NL')}
            </p>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Requirements for Zorgtoeslag</h3>
        <ul className="space-y-3">
          {[
            { text: 'You have Dutch health insurance (zorgverzekering)', required: true },
            { text: 'You are 18 years or older', required: true },
            { text: 'You have a valid residence permit', required: true },
            { text: 'You are registered in the Netherlands (BRP)', required: true },
            { text: 'Your assets are below €127,582 (single) or €161,329 (partners)', required: true },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5">✓</span>
              <span className="text-gray-700">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Apply link */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <h4 className="font-semibold text-blue-800 mb-2">Ready to Apply?</h4>
        <p className="text-sm text-blue-700 mb-4">
          Apply through Mijn Toeslagen on the Belastingdienst website
        </p>
        <a
          href="https://www.belastingdienst.nl/toeslagen/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Mijn Toeslagen →
        </a>
      </div>
    </div>
  );
}

// ============================================================================
// TAB: CITY COMPARISON
// ============================================================================

function CityComparisonTab() {
  const [selectedCities, setSelectedCities] = useState<string[]>(['Heerlen', 'Maastricht', 'Amsterdam']);
  const [apartmentType, setApartmentType] = useState<'studio' | 'oneBedroom' | 'twoBedroom'>('oneBedroom');

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

  return (
    <div className="space-y-6">
      {/* City selector */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🏙️ Select Cities to Compare (max 4)</h3>
        <div className="flex flex-wrap gap-2">
          {CITIES.map(city => (
            <button
              key={city.name}
              onClick={() => toggleCity(city.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCities.includes(city.name)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Apartment Type</label>
          <select
            value={apartmentType}
            onChange={(e) => setApartmentType(e.target.value as typeof apartmentType)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="studio">Studio</option>
            <option value="oneBedroom">1 Bedroom</option>
            <option value="twoBedroom">2 Bedroom</option>
          </select>
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                {comparedCities.map(city => (
                  <th key={city.name} className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    {city.name}
                    <span className="block text-xs font-normal text-gray-500">{city.region}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700">🏠 Rent ({apartmentType === 'studio' ? 'Studio' : apartmentType === 'oneBedroom' ? '1BR' : '2BR'})</td>
                {comparedCities.map(city => (
                  <td key={city.name} className="px-6 py-4 text-center font-mono">€{city.rent[apartmentType]}</td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">💡 Utilities</td>
                {comparedCities.map(city => (
                  <td key={city.name} className="px-6 py-4 text-center font-mono">€{city.utilities}</td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700">🛒 Groceries</td>
                {comparedCities.map(city => (
                  <td key={city.name} className="px-6 py-4 text-center font-mono">€{city.groceries}</td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">🚌 Transport</td>
                {comparedCities.map(city => (
                  <td key={city.name} className="px-6 py-4 text-center font-mono">€{city.transport}</td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700">📱 Internet</td>
                {comparedCities.map(city => (
                  <td key={city.name} className="px-6 py-4 text-center font-mono">€{city.internet}</td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">🏥 Health Insurance</td>
                {comparedCities.map(() => (
                  <td key={Math.random()} className="px-6 py-4 text-center font-mono">€{SETTLEMENT_COSTS.healthInsuranceMonthly}</td>
                ))}
              </tr>
              <tr className="bg-blue-50 font-semibold">
                <td className="px-6 py-4 text-sm text-blue-900">📊 MONTHLY TOTAL</td>
                {comparedCities.map(city => {
                  const total = getMonthlyTotal(city);
                  const isLowest = total === lowestTotal;
                  return (
                    <td key={city.name} className={`px-6 py-4 text-center font-mono ${isLowest ? 'text-green-600' : 'text-blue-900'}`}>
                      €{total}
                      {isLowest && <span className="block text-xs">💚 Cheapest</span>}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500">Annual Total</td>
                {comparedCities.map(city => (
                  <td key={city.name} className="px-6 py-4 text-center font-mono text-gray-500">€{(getMonthlyTotal(city) * 12).toLocaleString('nl-NL')}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Savings comparison */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h4 className="font-semibold text-green-800 mb-3">💰 Annual Savings Comparison</h4>
        <div className="space-y-2">
          {comparedCities
            .sort((a, b) => getMonthlyTotal(a) - getMonthlyTotal(b))
            .map((city, index) => {
              const total = getMonthlyTotal(city) * 12;
              const cheapestTotal = lowestTotal * 12;
              const extraCost = total - cheapestTotal;
              return (
                <div key={city.name} className="flex items-center justify-between">
                  <span className="text-green-700">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '4️⃣'} {city.name}
                  </span>
                  <span className="font-mono text-green-800">
                    {extraCost === 0 ? 'Base' : `+€${extraCost.toLocaleString('nl-NL')}/year`}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

type TabType = 'settlement' | 'monthly' | 'visa' | 'zorgtoeslag' | 'compare';

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<TabType>('settlement');

  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'settlement':
        return <InitialSettlementTab />;
      case 'monthly':
        return <MonthlyCostsTab />;
      case 'visa':
        return <VisaFeesTab />;
      case 'zorgtoeslag':
        return <ZorgtoeslagTab />;
      case 'compare':
        return <CityComparisonTab />;
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Tab Navigation */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto">
            <TabButton active={activeTab === 'settlement'} onClick={() => setActiveTab('settlement')}>
              🏠 Initial Costs
            </TabButton>
            <TabButton active={activeTab === 'monthly'} onClick={() => setActiveTab('monthly')}>
              📊 Monthly Costs
            </TabButton>
            <TabButton active={activeTab === 'visa'} onClick={() => setActiveTab('visa')}>
              🛂 Visa Fees
            </TabButton>
            <TabButton active={activeTab === 'zorgtoeslag'} onClick={() => setActiveTab('zorgtoeslag')}>
              🏥 Zorgtoeslag
            </TabButton>
            <TabButton active={activeTab === 'compare'} onClick={() => setActiveTab('compare')}>
              🏙️ Compare Cities
            </TabButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 animate-fade-in">
        {renderTabContent}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>💡 All costs are estimates based on 2024 data and may vary.</p>
          <p className="mt-1">Always verify current rates with official sources.</p>
        </div>
      </footer>
    </div>
  );
}
