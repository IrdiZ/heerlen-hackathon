'use client';

import { useState } from 'react';
import { lookupVehicle, RDWVehicleEnriched, GovAPIError } from '@/lib/gov-apis';

interface VehicleLookupProps {
  onClose?: () => void;
}

export function VehicleLookup({ onClose }: VehicleLookupProps) {
  const [kenteken, setKenteken] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<RDWVehicleEnriched | null>(null);
  const [error, setError] = useState<GovAPIError | null>(null);

  const handleLookup = async () => {
    if (!kenteken.trim()) return;
    
    setLoading(true);
    setError(null);
    setVehicle(null);

    const result = await lookupVehicle(kenteken);
    
    setLoading(false);
    
    if (result.success) {
      setVehicle(result.data);
    } else {
      setError(result.error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  const formatKenteken = (value: string) => {
    // Auto-format as user types (add dashes)
    const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (clean.length <= 6) {
      // Standard format: XX-XX-XX or XX-XXX-X etc.
      const parts = clean.match(/.{1,2}/g) || [];
      return parts.join('-');
    }
    return clean;
  };

  const apkStatusBadge = (status: RDWVehicleEnriched['apkStatus']) => {
    switch (status) {
      case 'valid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ APK Valid
          </span>
        );
      case 'expiring-soon':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⚠️ Expires Soon
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ✗ APK Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ? Unknown
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <span className="text-xl">🚗</span>
          <h3 className="font-semibold">RDW Vehicle Lookup</h3>
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

      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <p className="text-sm text-gray-600 mb-3">
          Check vehicle information and APK status using the Dutch license plate (kenteken).
          Great for verifying a used car before purchase!
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={kenteken}
            onChange={(e) => setKenteken(formatKenteken(e.target.value))}
            onKeyPress={handleKeyPress}
            placeholder="e.g., AB-123-CD"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent uppercase font-mono text-lg"
            maxLength={11}
          />
          <button
            onClick={handleLookup}
            disabled={loading || !kenteken.trim()}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching...
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div>
              <p className="font-medium text-red-800">{error.message}</p>
              {error.details && (
                <p className="text-sm text-red-600 mt-1">{error.details}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {vehicle && (
        <div className="p-4 space-y-4">
          {/* Vehicle Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-800">
                  {vehicle.merk}
                </span>
                <span className="text-lg text-gray-600">
                  {vehicle.handelsbenaming}
                </span>
              </div>
              <div className="font-mono text-sm text-gray-500 mt-1">
                Kenteken: {vehicle.kenteken}
              </div>
            </div>
            {apkStatusBadge(vehicle.apkStatus)}
          </div>

          {/* APK Status Card */}
          <div className={`rounded-lg p-4 ${
            vehicle.apkStatus === 'valid' ? 'bg-green-50 border border-green-200' :
            vehicle.apkStatus === 'expiring-soon' ? 'bg-yellow-50 border border-yellow-200' :
            vehicle.apkStatus === 'expired' ? 'bg-red-50 border border-red-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📋</span>
              <span className="font-medium">APK (Vehicle Inspection)</span>
            </div>
            <p className="text-sm">
              <strong>Expiry Date:</strong> {vehicle.apkExpiryFormatted}
            </p>
            {vehicle.apkStatus === 'expired' && (
              <p className="text-sm text-red-700 mt-2">
                ⚠️ This vehicle cannot legally be driven until APK is renewed!
              </p>
            )}
            {vehicle.apkStatus === 'expiring-soon' && (
              <p className="text-sm text-yellow-700 mt-2">
                💡 APK expires soon. Schedule an inspection at an RDW-approved garage.
              </p>
            )}
          </div>

          {/* Vehicle Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Color</span>
              <p className="font-medium text-gray-800 capitalize">{vehicle.kleur?.toLowerCase() || 'Unknown'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Body Type</span>
              <p className="font-medium text-gray-800 capitalize">{vehicle.inrichting?.toLowerCase() || 'Unknown'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500 uppercase tracking-wide">First Registered</span>
              <p className="font-medium text-gray-800">{vehicle.firstRegistrationFormatted}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Vehicle Age</span>
              <p className="font-medium text-gray-800">{vehicle.ageYears} years</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Seats</span>
              <p className="font-medium text-gray-800">{vehicle.aantal_zitplaatsen || 'Unknown'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Fuel Type</span>
              <p className="font-medium text-gray-800 capitalize">{vehicle.brandstof_omschrijving?.toLowerCase() || 'Unknown'}</p>
            </div>
          </div>

          {/* Tips for buyers */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Tips for Used Car Buyers:</p>
                <ul className="list-disc list-inside space-y-1 text-orange-700">
                  <li>Always verify the APK is valid before purchase</li>
                  <li>Check if the vehicle age matches what the seller claims</li>
                  <li>Vehicles over 4 years old need annual APK inspection</li>
                  <li>Consider getting a BOVAG inspection for extra security</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data source */}
          <p className="text-xs text-gray-400 text-center">
            Data from RDW Open Data (opendata.rdw.nl) • CC-0 License
          </p>
        </div>
      )}

      {/* Empty State */}
      {!vehicle && !error && !loading && (
        <div className="p-8 text-center text-gray-500">
          <span className="text-4xl mb-3 block">🔍</span>
          <p>Enter a Dutch license plate to look up vehicle information</p>
          <p className="text-sm mt-1">Example: AB-123-CD</p>
        </div>
      )}
    </div>
  );
}

export default VehicleLookup;
