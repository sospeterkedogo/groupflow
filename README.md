# GroupFlow: Engineering Terminal & Academic Ledger

GroupFlow is a high-fidelity collaboration platform built for technical teams to track, verify, and visualize academic contributions. It replaces generic project management with a structured **Identity Protocol** that bridges coursework with professional engineering readiness.

## Core Systems

### 🛡️ Identity Protocol
*   **Technical Arsenal**: Real-time skill matrix and proficiency tracking for engineering stacks (React, TypeScript, Supabase).
*   **Dynamic Roadmap**: Visualization of degree progression and module completion via enrollment data integration.
*   **Verifiable Audit Logs**: Instant PDF generation of contribution history for portfolio evidence and tutor review.

### 📊 Tactical Analytics
*   **KPI Visualization**: Live tracking of completion rates, evidence density, and delivery risks using Recharts.
*   **Effort Distribution**: Granular breakdown of team participation to ensure equitable project contribution.
*   **Engineering Kanban**: Specialized task workflow with integrated risk assessment and status durability.

### ⚡ Communication & Presence
*   **Secure Infrastructure**: Authentication via Supabase with isolated GitHub OAuth connection flows.
*   **Real-time Presence**: High-fidelity presence tracking to monitor active contribution within the pipeline.
*   **Team Discovery**: Managed join-request workflows with admin-level approval protocols.

## Technical Architecture

*   **Core**: Next.js 15 (App Router) / TypeScript 5
*   **Data Tier**: Supabase (PostgreSQL / Auth / Realtime)
*   **Logic**: Server Actions with Anti-bot Honeypot Security
*   **Frontend**: Vanilla CSS with Glassmorphism / Lucide React
*   **Reporting**: jsPDF Engine

## Environment Configuration

Initialize the local terminal using `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GITHUB_CLIENT_ID=your_oauth_id
GITHUB_CLIENT_SECRET=your_oauth_secret
```

## Deployment Protocol

The repository utilizes a strict verification pipeline:
*   **Production Validation**: Automated builds on every PR to ensure runtime stability.
*   **Type Safety**: Mandatory TypeScript verification across all modules.

---

**[v1.0.0]** • Developed for the next generation of software engineers.
