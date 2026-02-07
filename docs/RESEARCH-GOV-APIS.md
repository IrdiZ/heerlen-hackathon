# Dutch Government API Integration Research

> **Research Date:** February 7, 2026  
> **Purpose:** Evaluate official Dutch government APIs for potential integration with immigrant assistance tools  
> **Focus:** Heerlen/Limburg immigrant support hackathon project

---

## Executive Summary

The Dutch government provides various APIs through the **developer.overheid.nl** portal (272+ APIs available). However, most sensitive citizen data APIs (IND, MijnOverheid, DigiD) are **restricted to government organizations** with strict compliance requirements. The most accessible APIs for third-party integration are **RDW (vehicle data)** and **CBS (statistics)**, which offer fully public open data. For citizen-facing applications, the recommended approach is to help users navigate existing government portals rather than attempting direct API integration.

---

## API Comparison Table

| API | Availability | Auth Required | Rate Limits | Integration Complexity | Legal Barriers |
|-----|--------------|---------------|-------------|------------------------|----------------|
| **IND** | ❌ None | N/A | N/A | N/A | Not accessible |
| **MijnOverheid** | 🔒 Gov Only | PKIoverheid + OIN | Not public | Very High | Gov orgs only |
| **DigiD** | 🔒 Gov Only | SAML + PKIoverheid | Not public | Very High | Public task required |
| **Belastingdienst** | 🔒 Gov/B2B | PKIoverheid | Varies | High | Certified software only |
| **RDW** | ✅ Public | None (Open Data) | High | Low | CC-0 License |
| **DUO** | ⚠️ Partial | API Key | Not specified | Medium | Education data only |
| **Gemeente APIs** | ⚠️ Varies | Varies | Varies | Medium-High | Per municipality |
| **KVK** | ✅ Public | API Key | Fair use | Low-Medium | Commercial terms |
| **CBS** | ✅ Public | None (OData) | High | Low | Open data |

**Legend:** ✅ Public/Open | ⚠️ Partial/Restricted | 🔒 Government Only | ❌ Not Available

---

## Detailed API Analysis

### 1. IND (Immigratie- en Naturalisatiedienst)

**Website:** https://ind.nl

**API Availability:** ❌ **None for third parties**

The IND does not provide any public API access. All services are accessed through:
- **My IND portal** (web-based, login required)
- Phone appointments: 088 0430 430
- Physical IND desk visits (appointment required)

**Data Available via Portal:**
- Application status tracking
- Personal details on file
- Appointment scheduling
- Document upload

**Integration Options:**
- None for automated access
- Consider providing guidance/links to My IND portal
- Potential for screen scraping (legally problematic, not recommended)

**Recommendation:** Build a guide/explainer for navigating IND services rather than attempting integration.

---

### 2. MijnOverheid (Citizen Portal)

**Website:** https://mijn.overheid.nl  
**Developer Docs:** https://www.logius.nl/domeinen/interactie/mijnoverheid

**API Availability:** 🔒 **Government organizations only**

**APIs Available (for authorized orgs):**
- **Berichtenbox API** - Send digital letters to citizens
- **Lopende Zaken API** - Update case status visible to citizens
- **Delen van MijnGegevens** - Share citizen data

**Technical Requirements:**
- Digikoppeling (ebMS) protocol
- PKIoverheid certificate with OIN
- Diginetwerk connection
- StUF-ZKN message format
- Annual security assessment

**Authentication:**
- PKIoverheid certificate (server-to-server)
- Organisatieidentificatienummer (OIN)
- No citizen-initiated API access

**Legal Requirements:**
- Must be a government organization
- Must execute a "public task" (wettelijke taak)
- Compliance with MijnOverheid voorwaarden

**Recommendation:** Not accessible for hackathon. Focus on helping users understand their Berichtenbox.

---

### 3. DigiD (Digital Identity)

**Website:** https://digid.nl  
**Developer Docs:** https://www.logius.nl/domeinen/toegang/digid

**API Availability:** 🔒 **Authorized organizations only**

**Connection Options:**
- **SAML 3.X** - Primary integration method
- **App2App** - Mobile app integration
- Pre-production + Production environments

**Requirements to Connect:**
1. Execute a "publieke taak" (legal public duty)
2. Legal basis to use BSN (Burgerservicenummer)
3. PKIoverheid certificates
4. Annual ICT security assessment (DigiD audit)
5. Signed agreement with Logius

**Timeline:** ~1 month after compliance is met

**Betrouwbaarheidsniveaus (Trust Levels):**
- Basis (username/password)
- Midden (SMS verification)
- Substantieel (DigiD app)
- Hoog (ID check)

**Legal Considerations:**
- Only government orgs and delegated parties
- Strict security requirements
- Personal liability for breaches

**Recommendation:** Cannot integrate. Help users troubleshoot DigiD issues instead.

---

### 4. Belastingdienst (Tax Authority)

**Website:** https://belastingdienst.nl  
**Developer Portal:** https://odb.belastingdienst.nl

**API Availability:** 🔒 **Certified B2B/Government only**

**Available Integrations:**
- **VAT returns** (BTW-aangifte) - certified software
- **Wage tax** (Loonheffingen) - certified software  
- **DAC7 reporting** - platform operators
- **Various sector-specific** reporting requirements

**For Software Developers:**
- Must register at Support Digital Messaging (SDM)
- Receive specifications and test environment access
- Software certification required

**Technical Standards:**
- XBRL for financial reporting
- SBR (Standard Business Reporting)
- Digipoort connection

**Data Providers:**
- Financial institutions (automatic reporting)
- Employers (wage data)
- Platform operators (DAC7)

**Recommendation:** Not accessible for citizen-facing apps. May help users understand Mijn Belastingdienst portal.

---

### 5. RDW (Vehicle Registration) ✅

**Website:** https://opendata.rdw.nl  
**API Docs:** https://dev.socrata.com/foundry/opendata.rdw.nl/m9d7-ebf2

**API Availability:** ✅ **Fully Public Open Data**

**This is the most accessible Dutch government API!**

**Available Datasets:**
- **Gekentekende voertuigen** - All registered vehicles by license plate
- **Typegoedkeuringen** - Vehicle type approvals
- **Keuringen** - Vehicle inspections (APK data)
- **Terugroepacties** - Vehicle recalls
- **Parkeerdata** - Parking information (static & dynamic)
- **Erkende bedrijven** - Authorized garages

**Technical Details:**
- **Protocol:** SODA (Socrata Open Data API)
- **Format:** JSON, CSV, XML
- **Authentication:** None required
- **Rate Limits:** High (generous for open data)
- **License:** CC-0 (no restrictions)

**Example Query:**
```
GET https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=AB123CD
```

**Data Fields:**
- License plate, brand, model, color
- First registration date, import date
- Technical specifications (weight, emissions)
- APK expiry date
- Fuel type, CO2 emissions

**Recommendation:** ✅ **Excellent for integration.** Could help immigrants check vehicle information, APK status, or verify used car purchases.

---

### 6. DUO (Education Executive Agency)

**Website:** https://duo.nl  
**Open Data:** https://duo.nl/open_onderwijsdata

**API Availability:** ⚠️ **Partial - Education data only**

**Public Open Data:**
- School listings and locations
- Student numbers per school
- Graduation rates
- Educational statistics

**Student Finance (Studiefinanciering):**
- No public API
- Access only via Mijn DUO portal (DigiD login)
- Shows grant/loan status, OV-chipkaart, etc.

**developer.overheid.nl listing:** DUO has some APIs registered but primarily for government/education sector use.

**Recommendation:** Can use open education data. Cannot access personal student finance info.

---

### 7. Gemeente APIs (Municipal)

**Portal:** https://developer.overheid.nl/apis?thema=gemeente

**API Availability:** ⚠️ **Varies by municipality**

**Standardized APIs (VNG/GEMMA):**
- **Zaakgericht Werken** - Case management
- **Haal Centraal BRP** - Personal data (gov only)
- **Raadsinformatie** - Council information
- **BAG** - Addresses and buildings

**Amsterdam Example:**
- Waste container locations
- Parking data
- Geographic/area data
- Many datasets on data.amsterdam.nl

**Authentication:** Varies
- Open data: None
- Government APIs: PKIoverheid + OIN

**Key Initiative: Haal Centraal**
- Modern REST APIs for government data
- BRP (persons), BAG (addresses), BRK (cadastre)
- **Only accessible to government organizations**

**Recommendation:** Check if Heerlen has open data portal. Use open municipal data where available.

---

### 8. KVK (Chamber of Commerce) ✅

**Website:** https://kvk.nl  
**Developer Portal:** https://developers.kvk.nl

**API Availability:** ✅ **Public with API key**

**Available APIs:**
- **Zoeken API** - Search trade register
- **Basisprofiel API** - Basic company information
- **Vestigingsprofiel API** - Branch office details
- **Naamgeving API** - Trade names

**Data Available:**
- KVK number, RSIN
- Company name, trade names
- Addresses (visit, postal)
- SBI codes (business activities)
- Number of employees
- Legal form

**Technical Details:**
- **Protocol:** REST API (JSON)
- **Authentication:** API Key (X-Api-Key header)
- **Rate Limits:** Fair use policy
- **Test Environment:** Available

**Pricing:** Check KVK for current terms (some may be paid)

**Recommendation:** ✅ **Good for integration.** Could verify employers, help immigrants research companies.

---

### 9. CBS (Statistics Netherlands) ✅

**Website:** https://cbs.nl/en-gb/our-services/open-data  
**Data Portal:** https://opendata.cbs.nl

**API Availability:** ✅ **Fully Public Open Data**

**Available Data:**
- Population statistics
- Employment data
- Regional statistics (per gemeente/wijk)
- Economic indicators
- Housing data
- Migration statistics

**Technical Details:**
- **Protocol:** OData (REST)
- **Format:** JSON, CSV
- **Authentication:** None
- **Rate Limits:** Generous
- **Libraries:** cbsodataR (R), cbsodata (Python)

**Example Query:**
```
GET https://opendata.cbs.nl/ODataApi/odata/37230ned/TypedDataSet
```

**Recommendation:** ✅ **Excellent for context.** Can show regional statistics, help understand local area.

---

## Central API Portal: developer.overheid.nl

**Website:** https://developer.overheid.nl  
**API Register:** https://apis.developer.overheid.nl

**Overview:**
- 272+ government APIs registered
- Searchable by organization, theme
- Mix of open and restricted APIs

**Authentication for API Register:**
- Public endpoints: API Key (X-Api-Key header)
- Private endpoints: OAuth2 client credentials

**Key Organizations with APIs:**
- CBS (Statistics)
- Kadaster (Land registry)
- KVK (Chamber of Commerce)
- KNMI (Weather)
- Logius (DigiD, MijnOverheid)
- PDOK (Geographic data)
- RDW (Vehicles)
- VNG (Municipalities)
- DUO (Education)

---

## Recommendations for Hackathon

### ✅ APIs to Integrate

1. **RDW Open Data**
   - Check vehicle APK status
   - Verify used car before purchase
   - No auth required, fully open

2. **CBS Statistics**
   - Show regional employment data
   - Display migration statistics
   - Provide neighborhood context

3. **KVK (if applicable)**
   - Verify employer information
   - Research companies

### ⚠️ Consider Building Guides For

1. **IND Navigation**
   - Step-by-step My IND guide
   - Appointment scheduling help
   - Status tracking explanation

2. **DigiD Setup**
   - Activation walkthrough
   - Common issues and solutions
   - Trust level explanations

3. **MijnOverheid**
   - Berichtenbox tour
   - Where to find documents
   - Notification settings

4. **Gemeente Services**
   - Registration (inschrijving) guide
   - Burgerservicenummer explanation
   - Local service locations

### ❌ Not Feasible for Hackathon

- Direct DigiD integration
- MijnOverheid API access
- IND data access
- Belastingdienst integration
- Personal BRP data access

---

## Legal & Compliance Considerations

### For Public APIs (RDW, CBS)
- ✅ CC-0 or open license
- ✅ No personal data concerns
- ✅ Free to use

### For Restricted APIs
- ❌ Requires government organization status
- ❌ Annual security audits
- ❌ PKIoverheid certificates ($$$)
- ❌ Digikoppeling infrastructure
- ❌ Legal agreements

### GDPR Considerations
- Do not store personal data unnecessarily
- If handling any personal data, full GDPR compliance required
- User consent for any data processing
- Right to deletion must be implemented

---

## Technical Resources

### Open Data Portals
- https://data.overheid.nl - National open data catalog
- https://opendata.rdw.nl - Vehicle data
- https://opendata.cbs.nl - Statistics
- https://developer.overheid.nl - API directory

### Documentation
- Logius (DigiD, MijnOverheid): https://logius.nl
- Digikoppeling: https://logius.nl/diensten/digikoppeling
- Haal Centraal: https://github.com/BRP-API

### Developer Communities
- LinkedIn: CBS Open Data group
- GitHub: VNG-Realisatie, BRP-API

---

## Conclusion

For the hackathon, focus on:
1. **Integrating open APIs** (RDW, CBS) for added value
2. **Building navigation guides** for restricted services (IND, DigiD, MijnOverheid)
3. **Aggregating public information** in an immigrant-friendly format
4. **Linking to official portals** rather than attempting unauthorized access

The Dutch government has robust digital infrastructure, but it's designed for government-to-government and certified-business integration. Third-party citizen apps should complement, not replace, official channels.

---

*This research was compiled for the Heerlen Hackathon immigrant assistance project.*
