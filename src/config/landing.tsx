import React from 'react'
import { Layers, Users, Zap, Shield, Milestone, Award, LayoutGrid, BookOpen, Globe, Fingerprint, HelpCircle } from 'lucide-react'

export const features = [
  { 
    icon: <Layers size={21} />, 
    title: "Kanban Project Intelligence", 
    desc: "Synchronized workflow management with real-time state persistence and automated assignment tracking.",
    color: "var(--brand)"
  },
  { 
    icon: <Users size={21} />, 
    title: "Global Academic Networking", 
    desc: "Connect with peers across departments, exchange credentials, and build your professional university network.",
    color: "#10b981"
  },
  { 
    icon: <Zap size={21} />, 
    title: "Real-time Synchronization", 
    desc: "High-performance synchronization for chat, presence, and file management across all team devices.",
    color: "var(--accent)"
  },
  { 
    icon: <Shield size={21} />, 
    title: "Verifiable Contribution Hub", 
    desc: "Secure, audit-ready logs of every research contribution, ensuring transparency for students and faculty.",
    color: "#6366f1"
  },
  { 
    icon: <Milestone size={21} />, 
    title: "Intelligent Roadmapping", 
    desc: "Project timeline visualization with 5-stage academic status intervals from research to final submission.",
    color: "#f59e0b"
  },
  { 
     icon: <Award size={21} />, 
     title: "Achievement Tier System", 
     desc: "Differentiated recognition levels based on contribution metrics, unlocking professional profile enhancements.",
     color: "#fbbf24"
  }
]

export const faqs = [
  {
    q: "How can I support GroupFlow2026?",
    a: "You can support this project by upgrading to Pro (£2.99/mo) or Premium (£99 Lifetime). Your contribution directly helps me bring this tool to many more schools and support learning worldwide."
  },
  {
    q: "How is my data protected?",
    a: "Your privacy is my primary focus. I utilize industry-standard encryption to protect your work, ensuring your personal information remains confidential and is never shared with third parties."
  },
  {
    q: "Can I delete my account?",
    a: "Of course. You're in control of your data. You can permanently delete your account and all your project info with a single click whenever you like."
  },
  {
    q: "Who is behind GroupFlow2026?",
    a: "I created GroupFlow2026 to help student teams feel more supported and recognized during group work."
  }
]

export const navMenus = {
  product: {
    label: 'Product',
    categories: [
      {
        label: 'Infrastructure',
        items: [
          { id: 'kanban', title: 'Project Intelligence', desc: 'Real-time Kanban for technical research teams.', icon: <LayoutGrid size={18} /> },
          { id: 'sync', title: 'Real-time Sync', desc: 'Universal presence and file state synchronization.', icon: <Zap size={18} /> }
        ]
      },
      {
        label: 'Insights',
        items: [
          { id: 'roadmap', title: 'Academic Roadmap', desc: 'Phased timeline intervals for complex submissions.', icon: <Milestone size={18} /> }
        ]
      }
    ]
  },
  solutions: {
    label: 'Solutions',
    categories: [
      {
        label: 'Use Cases',
        items: [
          { id: 'research', title: 'Scholars & Researchers', desc: 'Secure contribute logs for high-stakes projects.', icon: <BookOpen size={18} /> },
          { id: 'teams', title: 'Team Collaboration', desc: 'Departmental project management at global scale.', icon: <Users size={18} /> }
        ]
      },
      {
        label: 'Scale',
        items: [
          { id: 'enterprise', title: 'Institutional Flow', desc: 'Integrated university ecosystems and audit-ready data.', icon: <Globe size={18} /> }
        ]
      }
    ]
  },
  resources: {
    label: 'Resources',
    categories: [
      {
        label: 'Community',
        items: [
          { id: 'mission', title: 'Global Mission 2026', desc: 'Read our manifesto for student support tech.', icon: <Fingerprint size={18} /> },
          { id: 'achievements', title: 'Impact Stats', desc: 'Global contribution metrics of the community.', icon: <Award size={18} /> }
        ]
      },
      {
        label: 'Support',
        items: [
          { id: 'help', title: 'Help & Knowledge', desc: 'Step-by-step guides for technical leads.', icon: <HelpCircle size={18} /> }
        ]
      }
    ]
  }
}
