# Phase 05: AI Reports + Compatibility - Research

**Researched:** 2026-02-01
**Domain:** PDF Generation & Deep AI Analysis
**Confidence:** HIGH

## Summary

Phase 5 focuses on generating high-value "premium" artifacts: downloadable PDF reports and in-depth compatibility analysis. The research confirms that **PDFKit** is the viable standard for server-side PDF generation in this stack, specifically when hosted in a Node.js environment (not Edge).

For compatibility, the existing Server Action architecture works well for the *view* layer, but for PDF downloads, we must move to **Route Handlers** to support binary streaming and proper `Content-Disposition` headers, which Server Actions do not natively support.

**Primary recommendation:** Use **PDFKit** within a **Next.js Route Handler** for PDF downloads, fetching cached AI content to avoid double-generation latency.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **pdfkit** | ^0.17.2 | PDF Generation | Lightweight, fast, stream-native, already installed. |
| **@google/generative-ai** | ^0.24.1 | AI Analysis | Existing standard for this project. |
| **lru-cache** | ^11.2.5 | Content Caching | Prevents regenerating AI text for the PDF. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **lucide-react** | Existing | Icons | UI indicators for download/loading. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **pdfkit** | **@react-pdf/renderer** | React-pdf allows using React components for PDF layout. **Tradeoff:** Slower generation, heavier bundle, and frequent hydration issues in Next.js App Router server-side contexts. PDFKit is lower-level but faster and robust. |
| **pdfkit** | **Puppeteer** | Headless browser HTML-to-PDF. **Tradeoff:** Extremely heavy, slow cold starts, difficult to deploy on standard serverless without size limit issues. |

## Architecture Patterns

### PDF Download Flow (The "Split" Pattern)

Avoid generating AI text *during* the PDF request to prevent timeouts.

1.  **View Phase (Server Action):**
    -   User requests report/compatibility.
    -   AI generates text.
    -   Text is stored in `lru-cache` (key: `report-{params}`).
    -   UI displays text.
2.  **Download Phase (Route Handler):**
    -   User clicks "Download PDF".
    -   Request hits `GET /api/report/pdf?name=...&dob=...`.
    -   Handler reconstructs cache key, fetches text from memory (or regenerates if evicted).
    -   Streams PDF response immediately.

### Recommended Project Structure
```
src/
├── app/
│   ├── api/
│   │   └── report/
│   │       └── pdf/
│   │           └── route.ts   # The Download Handler
│   ├── report/
│   │   └── page.tsx           # The View Page
│   └── actions/
│       └── compatibility.ts   # Existing analysis logic
├── lib/
│   └── pdf/
│       └── generator.ts       # PDFKit logic (styles, layout)
└── public/
    └── fonts/                 # Custom fonts for PDF (if needed)
```

### Pattern 1: Streaming PDF Response
**What:** Using Next.js Route Handlers to return a binary stream.
**When to use:** ALWAYS for file downloads. Server Actions cannot reliably return file streams.
**Example:**
```typescript
// src/app/api/report/pdf/route.ts
import { NextResponse } from "next/server"
import PDFDocument from "pdfkit"

export async function GET(request: Request) {
  // 1. Get params & Data
  // ...

  // 2. Create Stream
  const doc = new PDFDocument()

  // 3. Return Response with headers
  const stream = new ReadableStream({
    start(controller) {
      doc.on("data", (chunk) => controller.enqueue(chunk))
      doc.on("end", () => controller.close())
      doc.on("error", (err) => controller.error(err))
    }
  })

  // 4. Start writing (async)
  generatePDFContent(doc, data) // logic in lib/pdf/generator.ts

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="report.pdf"',
    },
  })
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **Text Wrapping** | Custom line-breaking logic | `doc.text(str, { width, align })` | PDFKit handles word wrapping, justification, and pagination natively. |
| **File Downloads** | `<a>` tags with Base64 strings | `window.open('/api/...')` | Base64 crashes browsers with large files. Streams are memory efficient. |

## Common Pitfalls

### Pitfall 1: Serverless Asset Loading
**What goes wrong:** `doc.image('/logo.png')` fails in production.
**Why it happens:** In Vercel/Serverless, the working directory is not what you expect, and relative paths break.
**How to avoid:** Use `path.join(process.cwd(), 'public', 'logo.png')`.
**Warning signs:** Works locally, throws `ENOENT` on deployment.

### Pitfall 2: Edge Runtime Incompatibility
**What goes wrong:** Deploying PDF generation to Edge.
**Why it happens:** PDFKit relies on Node.js built-ins (`fs`, `stream`) not available in Edge.
**How to avoid:** Add `export const runtime = 'nodejs'` to the Route Handler.

### Pitfall 3: Font Support
**What goes wrong:** PDF shows squares or gibberish for non-Latin characters (like Hindi if we localize later).
**Why it happens:** Standard PDF fonts (Helvetica) strictly support Latin-1.
**How to avoid:** Embed a TTF font (e.g., Noto Sans) explicitly if special chars are needed. For MVP English, standard fonts are fine.

## Code Examples

### Loading Assets in Serverless
```typescript
import path from "path"
import process from "process"

const logoPath = path.join(process.cwd(), "public", "logo.png")
doc.image(logoPath, 100, 100, { width: 50 })
```

## Open Questions

1.  **Cache Persistence**
    -   **Issue:** `lru-cache` is in-memory. If the serverless function cold-starts between "View" and "Download", the cache is empty.
    -   **Mitigation:** The AI prompt is deterministic enough with our parameters. If cache misses, transparently regenerate. It costs one extra API call but ensures reliability without setting up Redis yet.

## Sources

### Primary (HIGH confidence)
- [Context7] `pdfkit` documentation (Streaming, Node.js usage)
- [Official Docs] Next.js Route Handlers (Streaming responses)
- [Codebase] Existing `src/lib/pdf/generator.ts` setup

### Secondary (MEDIUM confidence)
- [WebSearch] Vercel file system access patterns (`process.cwd()`)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - PDFKit is the Node.js standard.
- Architecture: HIGH - Route Handlers are the correct Next.js primitive for files.
- Pitfalls: HIGH - Asset loading is a known Vercel specific behavior.

**Research date:** 2026-02-01
