"use client";

import { useState } from "react";

export default function DemoForm() {
  const [formData, setFormData] = useState({
    voornaam: "",
    achternaam: "",
    geboortedatum: "",
    geboorteplaats: "",
    nationaliteit: "",
    geslacht: "",
    straatnaam: "",
    huisnummer: "",
    postcode: "",
    woonplaats: "",
    telefoonnummer: "",
    email: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo form - no submission
    console.log("Form data (demo only):", formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Government header bar */}
      <div className="bg-[#154273] h-2"></div>
      
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#154273] rounded flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#154273]">Gemeente Heerlen</h1>
              <p className="text-gray-600 text-sm">Burgerzaken</p>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-[#154273] pb-2">
            Registratieformulier Basisregistratie Personen (BRP)
          </h2>
          <p className="text-gray-600 mt-3 text-sm">
            Vul alle velden in om u te registreren bij de gemeente. Alle velden met een * zijn verplicht.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#154273] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#154273] text-white rounded-full text-sm flex items-center justify-center">1</span>
              Persoonsgegevens
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Voornaam */}
              <div>
                <label htmlFor="voornaam" className="block text-sm font-medium text-gray-700 mb-1">
                  Voornaam <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="voornaam"
                  name="voornaam"
                  value={formData.voornaam}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#154273] focus:border-transparent transition-colors"
                  placeholder="Uw voornaam"
                />
              </div>

              {/* Achternaam */}
              <div>
                <label htmlFor="achternaam" className="block text-sm font-medium text-gray-700 mb-1">
                  Achternaam <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="achternaam"
                  name="achternaam"
                  value={formData.achternaam}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#154273] focus:border-transparent transition-colors"
                  placeholder="Uw achternaam"
                />
              </div>

              {/* Geboortedatum */}
              <div>
                <label htmlFor="geboortedatum" className="block text-sm font-medium text-gray-700 mb-1">
                  Geboortedatum <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="geboortedatum"
                  name="geboortedatum"
                  value={formData.geboortedatum}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#154273] focus:border-transparent transition-colors"
                />
              </div>

              {/* Geboorteplaats */}
              <div>
                <label htmlFor="geboorteplaats" className="block text-sm font-medium text-gray-700 mb-1">
                  Geboorteplaats <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="geboorteplaats"
                  name="geboorteplaats"
                  value={formData.geboorteplaats}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#154273] focus:border-transparent transition-colors"
                  placeholder="Plaats van geboorte"
                />
              </div>

              {/* Nationaliteit */}
              <div>
                <label htmlFor="nationaliteit" className="block text-sm font-medium text-gray-700 mb-1">
                  Nationaliteit <span className="text-red-500">*</span>
                </label>
                <select
                  id="nationaliteit"
                  name="nationaliteit"
                  value={formData.nationaliteit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#154273] focus:border-transparent transition-colors bg-white"
                >
                  <option value="">Selecteer nationaliteit</option>
                  <option value="nederlandse">Nederlandse</option>
                  <option value="turkse">Turkse</option>
                  <option value="marokkaanse">Marokkaanse</option>
                  <option value="egyptische">Egyptische</option>
                  <option value="poolse">Poolse</option>
                  <option value="oekraiense">Oekraïense</option>
                  <option value="syrische">Syrische</option>
                  <option value="afghaanse">Afghaanse</option>
                  <option value="eritrese">Eritrese</option>
                  <option value="somalische">Somalische</option>
                  <option value="iraakse">Iraakse</option>
                  <option value="iraanse">Iraanse</option>
                  <option value="chinese">Chinese</option>
                  <option value="indiase">Indiase</option>
                  <option value="anders">Anders</option>
                </select>
              </div>

              {/* Geslacht */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geslacht <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 mt-2" id="geslacht">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="geslacht"
                      value="man"
                      checked={formData.geslacht === "man"}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#154273] focus:ring-[#154273]"
                    />
                    <span className="text-gray-700">Man</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="geslacht"
                      value="vrouw"
                      checked={formData.geslacht === "vrouw"}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#154273] focus:ring-[#154273]"
                    />
                    <span className="text-gray-700">Vrouw</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="geslacht"
                      value="onbekend"
                      checked={formData.geslacht === "onbekend"}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#154273] focus:ring-[#154273]"
                    />
                    <span className="text-gray-700">Onbekend</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Address Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#154273] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#154273] text-white rounded-full text-sm flex items-center justify-center">2</span>
              Adresgegevens
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Straatnaam */}
              <div className="md:col-span-1">
                <label htmlFor="straatnaam" className="block text-sm font-medium text-gray-700 mb-1">
                  Straatnaam <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="straatnaam"
                  name="straatnaam"
                  value={formData.straatnaam}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#154273] focus:border-transparent transition-colors"
                  placeholder="Naam van de straat"
                />
              </div>

              {/* Huisnummer */}
              <div>
                <label htmlFor="huisnummer" className="block text-sm font-medium text-gray-700 mb-1">
                  Huisnummer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="huisnummer"
                  name="huisnummer"
                  value={formData.huisnummer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#154273] focus:border-transparent transition-colors"
                  placeholder="Nr."
                />
              </div>

              {/* Postcode */}
              <div>
                <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postcode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postcode"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#154273] focus:border-transparent transition-colors"
                  placeholder="1234 AB"
                />
              </div>

              {/* Woonplaats */}
              <div>
                <label htmlFor="woonplaats" className="block text-sm font-medium text-gray-700 mb-1">
                  Woonplaats <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="woonplaats"
                  name="woonplaats"
                  value={formData.woonplaats}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#154273] focus:border-transparent transition-colors"
                  placeholder="Uw woonplaats"
                />
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#154273] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#154273] text-white rounded-full text-sm flex items-center justify-center">3</span>
              Contactgegevens
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Telefoonnummer */}
              <div>
                <label htmlFor="telefoonnummer" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefoonnummer <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="telefoonnummer"
                  name="telefoonnummer"
                  value={formData.telefoonnummer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#154273] focus:border-transparent transition-colors"
                  placeholder="06 12345678"
                />
              </div>

              {/* E-mailadres */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mailadres <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#154273] focus:border-transparent transition-colors"
                  placeholder="uw.email@voorbeeld.nl"
                />
              </div>
            </div>
          </section>

          {/* Submit Button (Demo) */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setFormData({
                voornaam: "",
                achternaam: "",
                geboortedatum: "",
                geboorteplaats: "",
                nationaliteit: "",
                geslacht: "",
                straatnaam: "",
                huisnummer: "",
                postcode: "",
                woonplaats: "",
                telefoonnummer: "",
                email: "",
              })}
            >
              Formulier wissen
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#154273] text-white rounded-md hover:bg-[#1a5490] transition-colors font-medium"
            >
              Versturen
            </button>
          </div>

          {/* Demo Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p className="text-amber-800 text-sm">
              ⚠️ <strong>Demo formulier</strong> - Dit formulier is alleen voor test- en demonstratiedoeleinden. 
              Gegevens worden niet verzonden of opgeslagen.
            </p>
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© 2025 Gemeente Heerlen - MigrantAI Hackathon Demo</p>
        </footer>
      </div>
    </div>
  );
}
