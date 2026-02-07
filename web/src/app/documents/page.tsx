'use client';

import Link from 'next/link';
import { DocumentChecklist } from '@/components/DocumentChecklist';

export default function DocumentsPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border border-white/10 border-b px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl hover:opacity-80 transition-opacity">
              🌍
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Document Tracker</h1>
              <p className="text-sm text-slate-400">MigrantAI</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-slate-400 hover:text-slate-200 transition-colors px-3 py-2 rounded-lg hover:bg-slate-900"
          >
            ← Back to App
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <DocumentChecklist />

        {/* Info section */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-6">
          <h3 className="font-semibold text-orange-800 mb-2">💡 Tips for Document Collection</h3>
          <ul className="space-y-2 text-sm text-orange-700">
            <li className="flex items-start gap-2">
              <span>📋</span>
              <span>
                <strong>Keep originals and copies:</strong> Always bring both original documents
                and photocopies to appointments.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>🌐</span>
              <span>
                <strong>Apostille/Legalization:</strong> Documents from outside the Netherlands
                often need an apostille or legalization. Check requirements for your home country.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>🔄</span>
              <span>
                <strong>Translation:</strong> Some documents may need certified translation to
                Dutch or English. Check with the receiving agency.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>📱</span>
              <span>
                <strong>Digital backup:</strong> Take photos of all documents and store them
                securely in the cloud.
              </span>
            </li>
          </ul>
        </div>

        {/* Quick links */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl border border-white/10 p-4 hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-white mb-2">🏛️ Gemeente Heerlen</h4>
            <p className="text-sm text-slate-300 mb-3">
              Book appointments and find information for Heerlen municipality.
            </p>
            <a
              href="https://www.heerlen.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 text-sm hover:underline"
            >
              Visit heerlen.nl →
            </a>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl border border-white/10 p-4 hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-white mb-2">🆔 DigiD</h4>
            <p className="text-sm text-slate-300 mb-3">
              Apply for your digital identity for Dutch government services.
            </p>
            <a
              href="https://www.digid.nl/aanvragen"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 text-sm hover:underline"
            >
              Apply for DigiD →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
