# OCR Research for MigrantAI

**Goal:** Enable users to scan Dutch letters/documents and have the AI agent explain them.

## TL;DR Recommendation

**For hackathon: Use LLM Vision (Claude/GPT-4) directly — skip traditional OCR.**

Why? LLMs with vision can:
1. Read text from images (OCR)
2. Understand context and structure
3. Explain in user's language
4. All in ONE API call

Traditional OCR would require: OCR → Text → Translation → Explanation (3+ steps).

---

## Comparison Table

| Solution | Accuracy (Dutch) | Cost | Complexity | Offline | Best For |
|----------|------------------|------|------------|---------|----------|
| **LLM Vision (Claude/GPT-4)** | ⭐⭐⭐⭐⭐ | ~$0.001-0.01/image | Low | ❌ | **Context understanding** |
| **Tesseract.js** | ⭐⭐⭐ | Free | Medium | ✅ | High-volume, no server |
| **Google Cloud Vision** | ⭐⭐⭐⭐ | $1.50/1000 images | Medium | ❌ | Enterprise accuracy |
| **Browser Shape Detection** | ❌ N/A | Free | N/A | ✅ | Not ready for production |

---

## Option 1: LLM Vision (Recommended)

### How It Works
Modern LLMs (Claude 3+, GPT-4 Vision) can process images directly. They extract text AND understand it.

### Advantages
- **One-step solution:** Upload image → Get explanation in any language
- **Context-aware:** Understands letter structure (sender, dates, deadlines, action items)
- **Multilingual:** Explains in user's native language automatically
- **Handles poor scans:** LLMs are surprisingly robust with angled photos, handwriting

### Pricing
| Model | Cost per Image (typical document) |
|-------|----------------------------------|
| GPT-4.1-mini | ~$0.001 (1600 tokens × $0.40/1M) |
| GPT-4o | ~$0.005 (765 tokens × $2.50/1M) |
| Claude 3.5 Sonnet | ~$0.004 |
| Claude 3 Haiku | ~$0.0003 |

### Code: ElevenLabs Integration

Since MigrantAI uses ElevenLabs ConvAI, the cleanest approach is:

```typescript
// In ElevenLabs webhook handler
export async function handleDocumentScan(imageBase64: string, userLanguage: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are helping an immigrant understand a Dutch government letter.
                   Analyze this document and explain:
                   1. Who sent it and why
                   2. Key dates and deadlines
                   3. What action the person needs to take
                   4. Any important warnings
                   
                   Respond in ${userLanguage}. Be clear and reassuring.`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
              detail: 'high' // Use 'low' for simple documents
            }
          }
        ]
      }],
      max_tokens: 1000,
    }),
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}
```

---

## Option 2: Tesseract.js (Client-Side OCR)

### Overview
- **What:** WebAssembly port of Tesseract OCR engine
- **Languages:** 100+ including Dutch (`nld`)
- **Size:** ~2.5MB core + ~5MB per language pack
- **License:** Apache 2.0

### When to Use
- Privacy-critical: text never leaves browser
- Offline capability needed
- High volume (thousands of documents)
- You need raw OCR, not understanding

### Limitations
- Dutch accuracy: ~85-90% on clean scans, worse on photos
- No contextual understanding
- Still need translation + explanation step
- Large bundle size

### Code: Basic Implementation

```typescript
// components/DocumentScanner.tsx
'use client';

import { useState } from 'react';
import { createWorker } from 'tesseract.js';

export function DocumentScanner() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setText('');

    try {
      // Initialize worker with Dutch language
      const worker = await createWorker('nld', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      // Process image
      const result = await worker.recognize(file);
      setText(result.data.text);

      await worker.terminate();
    } catch (error) {
      console.error('OCR failed:', error);
      setText('Error processing document');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 
                   file:rounded file:border-0 file:bg-blue-500 file:text-white
                   hover:file:bg-blue-600"
      />
      
      {loading && (
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded">
            <div 
              className="h-full bg-blue-500 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">Processing... {progress}%</p>
        </div>
      )}
      
      {text && (
        <div className="p-4 bg-gray-50 rounded border">
          <h3 className="font-semibold mb-2">Extracted Text:</h3>
          <pre className="whitespace-pre-wrap text-sm">{text}</pre>
        </div>
      )}
    </div>
  );
}
```

### Install

```bash
npm install tesseract.js
```

---

## Option 3: Google Cloud Vision API

### Overview
- **Accuracy:** Best-in-class for printed text
- **Pricing:** $1.50/1000 images (first 1000/month free)
- **Features:** Document text detection, handwriting, PDF support

### When to Use
- Enterprise production deployments
- Batch processing many documents
- Need structured output (paragraphs, blocks)

### Limitations
- Requires server-side implementation
- Still need translation + explanation step
- Overkill for hackathon demo

### Code Example

```typescript
// api/ocr/route.ts (server-side)
import vision from '@google-cloud/vision';

export async function POST(request: Request) {
  const { imageBase64 } = await request.json();
  
  const client = new vision.ImageAnnotatorClient();
  
  const [result] = await client.documentTextDetection({
    image: { content: imageBase64 },
  });
  
  const fullText = result.fullTextAnnotation?.text || '';
  
  return Response.json({ text: fullText });
}
```

---

## Option 4: Browser Shape Detection API

### Status: ❌ NOT RECOMMENDED

The W3C Shape Detection API includes `TextDetector`, but:
- **Text Detection is NOT standardized** (explicitly excluded from spec)
- Only supported in Chrome behind flags
- Accuracy varies wildly by platform
- No Dutch language support guaranteed

```javascript
// This DOES NOT work reliably
const textDetector = new TextDetector(); // Experimental, unstable
```

**Verdict:** Ignore this option entirely.

---

## ElevenLabs Vision Capabilities

ElevenLabs ConvAI does NOT have native vision/OCR capabilities. The agent cannot directly process images.

### Workaround Architecture

```
User uploads image
       ↓
[Client] Convert to base64
       ↓
[Client Tool Call] → Send to webhook
       ↓
[Webhook] → Call LLM Vision API (GPT-4/Claude)
       ↓
[Webhook] → Return explanation text
       ↓
[ElevenLabs] → Speaks explanation to user
```

---

## Recommended Implementation for Hackathon

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Camera   │────▶│   Next.js App    │────▶│   GPT-4 Vision  │
│   or File Pick  │     │   (resize/b64)   │     │   (OCR+Explain) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
                               ┌──────────────────────────────────┐
                               │ "This letter from the gemeente   │
                               │  says you need to register..."  │
                               └──────────────────────────────────┘
                                                          │
                                                          ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │   ElevenLabs     │◀────│   Return to UI  │
                        │   TTS (optional) │     │   or ConvAI     │
                        └──────────────────┘     └─────────────────┘
```

### Prototype Component

```typescript
// components/DocumentUpload.tsx
'use client';

import { useState, useRef } from 'react';

interface DocumentUploadProps {
  onExplanation: (text: string) => void;
  userLanguage: string;
}

export function DocumentUpload({ onExplanation, userLanguage }: DocumentUploadProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    // Resize image to reduce costs (max 1024px)
    const resized = await resizeImage(file, 1024);
    
    setLoading(true);
    try {
      const response = await fetch('/api/explain-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: resized,
          language: userLanguage,
        }),
      });
      
      const data = await response.json();
      onExplanation(data.explanation);
    } catch (error) {
      console.error('Failed to process document:', error);
      onExplanation('Sorry, I could not read this document. Please try again with a clearer photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    
    await processImage(file);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment" // Use back camera on mobile
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="w-full py-4 px-6 bg-orange-500 text-white rounded-lg
                   font-semibold text-lg hover:bg-orange-600 disabled:opacity-50
                   flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            Analyzing document...
          </>
        ) : (
          <>
            📷 Scan Document
          </>
        )}
      </button>
      
      {preview && (
        <img 
          src={preview} 
          alt="Document preview"
          className="max-h-48 rounded border mx-auto"
        />
      )}
    </div>
  );
}

// Utility: Resize image to reduce API costs
async function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Return base64 without data URL prefix
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataUrl.split(',')[1]);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

### API Route

```typescript
// app/api/explain-document/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { image, language } = await request.json();
  
  const systemPrompt = `You are a helpful assistant for immigrants in the Netherlands.
You are analyzing a Dutch government document or letter.

RESPOND ONLY IN ${language.toUpperCase()}.

Analyze the document and explain:
1. 📬 Who sent this and why
2. 📅 Important dates and deadlines (be very clear about these!)
3. ✅ What action the person needs to take
4. ⚠️ Any warnings or consequences if ignored
5. 💡 Helpful tips (where to go, what to bring)

Be warm, clear, and reassuring. Many immigrants find Dutch bureaucracy intimidating.
Use simple language. Format with emojis for clarity.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini', // or 'gpt-4o' for better quality
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Please explain this document:' },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    }),
  });
  
  const data = await response.json();
  
  return NextResponse.json({
    explanation: data.choices[0].message.content,
  });
}
```

---

## Limitations & Gotchas

### LLM Vision Limitations
1. **Handwriting:** Works but accuracy drops significantly
2. **Rotated images:** May misread; suggest user straighten photo
3. **Low contrast:** Old faxes or poor scans struggle
4. **Privacy:** Document content goes to OpenAI servers (mention in privacy policy)

### Tesseract.js Gotchas
1. **Initial load:** 5-10 seconds to download language pack first time
2. **Memory:** Large images can crash mobile browsers
3. **Accuracy:** Struggles with columns, tables, complex layouts
4. **Language packs:** Must explicitly load `nld` for Dutch

### General Tips
1. **Guide users:** "Hold phone steady, ensure good lighting"
2. **Resize images:** 1024px is plenty; saves tokens/bandwidth
3. **Fallback:** Always have "I couldn't read this" error state
4. **Confidence:** LLMs may hallucinate if image is unclear

---

## Cost Estimate (Hackathon Demo)

Assuming 100 demo scans during hackathon:

| Approach | Cost |
|----------|------|
| GPT-4.1-mini | ~$0.10 |
| GPT-4o | ~$0.50 |
| Tesseract.js | $0 |
| Google Cloud Vision | $0 (free tier) |

**Verdict:** Cost is negligible. Optimize for demo quality, not cost.

---

## Decision Matrix

| Criteria | LLM Vision | Tesseract.js |
|----------|------------|--------------|
| Setup time | 10 min | 30 min |
| Accuracy (Dutch printed) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Context understanding | ⭐⭐⭐⭐⭐ | ❌ |
| Multilingual explanation | ⭐⭐⭐⭐⭐ | ❌ (needs extra step) |
| Privacy (no server) | ❌ | ⭐⭐⭐⭐⭐ |
| Offline | ❌ | ⭐⭐⭐⭐⭐ |
| Bundle size impact | None | +7MB |

---

## Final Recommendation

### For Hackathon Demo: **GPT-4.1-mini Vision**

1. ✅ One API call = OCR + Understanding + Translation
2. ✅ 10 minutes to implement
3. ✅ Cost: <$1 for entire hackathon
4. ✅ Best user experience

### Future Production Consideration

Consider hybrid approach:
- **Tesseract.js** for quick preview text (client-side)
- **LLM Vision** for full explanation (only if user requests)

This balances privacy (local OCR) with quality (cloud explanation).

---

## Files Created

- `docs/RESEARCH-OCR.md` — This document
- Prototype components ready to copy into `web/src/components/`

## Next Steps

1. Add `OPENAI_API_KEY` to `.env.local`
2. Create `/api/explain-document/route.ts`
3. Add `<DocumentUpload />` to main page
4. Test with sample Dutch gemeente letters
