# GroupFlow 🚀

**Dynamic Academic Identity & Team Synergy Platform**

GroupFlow is a state-of-the-art educational technology platform designed to transform how students collaborate on complex projects. It moves beyond simple task tracking, creating a verifiable **Academic Identity Hub** that bridges the gap between coursework and professional readiness.

![GroupFlow Banner](public/assets/auth_bg.png)

## 🌟 Key Features

### 🎓 Academic Identity Hub
- **Dynamic Roadmap**: Real-time visualization of your degree progress (Year 1, 2, 3...) based on enrollment data.
- **Technical Arsenal**: A curated and customizable skill matrix where students track their proficiency in tools like React, TypeScript, and more.
- **Verifiable Audit Logs**: Generate professional PDF reports of team performance and individual contributions, perfect for portfolio evidence.

### 📊 Advanced Project Analytics
- **Live KPI Tracking**: Monitor completion rates, evidence density, and overdue risks at a glance.
- **Effort Distribution**: Transparent breakdown of team contributions to ensure fair project participation.
- **Interactive Kanban**: A futuristic, student-focused task board with integrated risk assessments.

### 💬 Seamless Collaboration
- **Real-time Team Chat**: WhatsApp-style communication embedded directly into the workspace.
- **Presence System**: See who's online and actively contributing to the pipeline.
- **Join Requests**: Secure team discovery and request management via an admin-approval workflow.
- **Zen Mode**: A built-in "Break Point" Quiz to keep your technical knowledge sharp during build waits.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: Vanilla CSS with High-End Glassmorphism & Cyberpunk Aesthetics
- **Visualization**: [Recharts](https://recharts.org/)
- **Reporting**: [jsPDF](https://github.com/parallax/jsPDF)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase Project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/groupflow.git
   cd groupflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file with the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   GITHUB_CLIENT_ID=your_id
   GITHUB_CLIENT_SECRET=your_secret
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 🏗️ Deployment Pipeline

This repository is equipped with a **Tip-Top Deployment Pipeline** via GitHub Actions:
- **Build Verification**: Automatically runs `npm run build` on every PR to ensure production stability.
- **Type Safety**: Enforces strict TypeScript checks across the entire ecosystem.

---

Built with ❤️ for the next generation of engineers.
