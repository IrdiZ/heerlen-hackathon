'use client';

import { useState, useEffect } from 'react';
import {
  getCostOfLiving,
  getMigrationStats,
  getRegionalTips,
  CBSCostOfLiving,
  CBSMigrationData,
} from '@/lib/gov-apis';

interface RegionalStatsProps {
  regionName?: string;
  showMigration?: boolean;
  showTips?: boolean;
  onClose?: () => void;
}

// Popular regions for quick selection
const QUICK_REGIONS = [
  'Heerlen',
  'Maastricht',
  'Amsterdam',
  'Rotterdam',
  'Utrecht',
  'Eindhoven',
];

export function RegionalStats({
  regionName: initialRegion,
  showMigration = true,
  showTips = true,
  onClose,
}: RegionalStatsProps) {
  const [regionName, setRegionName] = useState(initialRegion || 'Heerlen');
  const [loading, setLoading] = useState(false);
  const [costData, setCostData] = useState<CBSCostOfLiving | null>(null);
  const [migrationData, setMigrationData] = useState<CBSMigrationData | null>(null);
  const [tips, setTips] = useState<string[]>([]);

  const loadData = async (region: string) => {
    setLoading(true);
    
    try {
      const [costResult, migrationResult, tipsResult] = await Promise.all([
        getCostOfLiving(region),
        showMigration ? getMigrationStats() : Promise.resolve(null),
        showTips ? getRegionalTips(region) : Promise.resolve([]),
      ]);

      if (costResult.success) {
        setCostData(costResult.data);
      }
      
      if (migrationResult && migrationResult.success) {
        setMigrationData(migrationResult.data);
      }
      
      if (tipsResult) {
        setTips(tipsResult);
      }
    } catch (error) {
      console.error('Error loading regional stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(regionName);
  }, [regionName]);

  const handleRegionChange = (newRegion: string) => {
    setRegionName(newRegion);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('nl-NL').format(value);
  };

  // Compare to national average
  const nlAverageRent = 1100;
  const nlAverageHousePrice = 350000;

  const rentComparison = costData
    ? ((costData.averageRent - nlAverageRent) / nlAverageRent) * 100
    : 0;
  const priceComparison = costData
    ? ((costData.averageHousePrice - nlAverageHousePrice) / nlAverageHousePrice) * 100
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <span className="text-xl">📊</span>
          <h3 className="font-semibold">Regional Statistics</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Region Selector */}
      <div className="p-4 border-b border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a city/region:
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => handleRegionChange(region)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                regionName === region
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={regionName}
          onChange={(e) => setRegionName(e.target.value)}
          placeholder="Or type a city name..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          onBlur={() => loadData(regionName)}
          onKeyPress={(e) => e.key === 'Enter' && loadData(regionName)}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading statistics...</p>
        </div>
      )}

      {/* Stats Content */}
      {!loading && costData && (
        <div className="p-4 space-y-4">
          {/* Cost of Living Section */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>🏠</span>
              Cost of Living in {costData.regionName}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Rent Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Average Rent</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    rentComparison < 0
                      ? 'bg-green-100 text-green-700'
                      : rentComparison > 20
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {rentComparison >= 0 ? '+' : ''}{rentComparison.toFixed(0)}% vs NL avg
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {formatCurrency(costData.averageRent)}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  NL Average: {formatCurrency(nlAverageRent)}/mo
                </p>
              </div>

              {/* House Price Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Average House Price</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    priceComparison < 0
                      ? 'bg-green-100 text-green-700'
                      : priceComparison > 20
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {priceComparison >= 0 ? '+' : ''}{priceComparison.toFixed(0)}% vs NL avg
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {formatCurrency(costData.averageHousePrice)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  NL Average: {formatCurrency(nlAverageHousePrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Migration Stats */}
          {showMigration && migrationData && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>🌍</span>
                Netherlands Migration ({migrationData.year})
              </h4>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatNumber(migrationData.immigration)}
                    </p>
                    <p className="text-xs text-gray-500">Immigration</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-500">
                      {formatNumber(migrationData.emigration)}
                    </p>
                    <p className="text-xs text-gray-500">Emigration</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${
                      migrationData.balance > 0 ? 'text-orange-600' : 'text-orange-600'
                    }`}>
                      {migrationData.balance > 0 ? '+' : ''}{formatNumber(migrationData.balance)}
                    </p>
                    <p className="text-xs text-gray-500">Net Balance</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3 text-center">
                  You're joining a community of newcomers! The Netherlands welcomes thousands of immigrants each year.
                </p>
              </div>
            </div>
          )}

          {/* Regional Tips */}
          {showTips && tips.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>💡</span>
                Tips for {costData.regionName}
              </h4>
              
              <div className="space-y-2">
                {tips.map((tip, index) => (
                  <div
                    key={index}
                    className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800"
                  >
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data source */}
          <p className="text-xs text-gray-400 text-center pt-2">
            Data from CBS Open Data (opendata.cbs.nl) • Last updated: {costData.lastUpdated}
          </p>
        </div>
      )}
    </div>
  );
}

// Compact tip component for embedding in other views
export function RegionalTip({ regionName }: { regionName: string }) {
  const [tip, setTip] = useState<string | null>(null);

  useEffect(() => {
    getRegionalTips(regionName).then((tips) => {
      if (tips.length > 0) {
        // Pick a random tip
        setTip(tips[Math.floor(Math.random() * tips.length)]);
      }
    });
  }, [regionName]);

  if (!tip) return null;

  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg text-sm text-orange-800">
      {tip}
    </div>
  );
}

// Cost comparison badge for quick display
export function CostBadge({ regionName }: { regionName: string }) {
  const [data, setData] = useState<{ rent: number; comparison: string } | null>(null);

  useEffect(() => {
    getCostOfLiving(regionName).then((result) => {
      if (result.success) {
        const nlAvg = 1100;
        const diff = ((result.data.averageRent - nlAvg) / nlAvg) * 100;
        let comparison = 'average';
        if (diff < -15) comparison = 'affordable';
        else if (diff > 15) comparison = 'expensive';
        
        setData({ rent: result.data.averageRent, comparison });
      }
    });
  }, [regionName]);

  if (!data) return null;

  const colors = {
    affordable: 'bg-green-100 text-green-700 border-green-300',
    average: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    expensive: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[data.comparison as keyof typeof colors]}`}>
      🏠 €{data.rent}/mo ({data.comparison})
    </span>
  );
}

export default RegionalStats;
