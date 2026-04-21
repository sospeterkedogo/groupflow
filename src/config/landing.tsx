import React from 'react'
import { Layers, Users, Zap, Shield, Milestone, Award, LayoutGrid, BookOpen, Globe, Fingerprint, HelpCircle } from 'lucide-react'

export const features = [
  { 
    icon: <Layers size={21} />, 
    title: "Smart Task Board", 
    desc: "Easily manage your tasks with real-time updates that save automatically as you work.",
    color: "var(--brand)"
  },
  { 
    icon: <Users size={21} />, 
    title: "Student Network", 
    desc: "Connect with other students in your classes, share resources, and build your university network.",
    color: "#10b981"
  },
  { 
    icon: <Zap size={21} />, 
    title: "Quick Syncing", 
    desc: "Fast and reliable chat and file sharing that stays updated across all your devices.",
    color: "var(--accent)"
  },
  { 
    icon: <Shield size={21} />, 
    title: "Credit for Your Work", 
    desc: "We keep a safe record of your help in every project, ensuring you always get the credit you deserve.",
    color: "#6366f1"
  },
  { 
    icon: <Milestone size={21} />, 
    title: "Visible Progress", 
    desc: "See your group deadlines clearly and track your project's path from start to finish.",
    color: "#f59e0b"
  },
  { 
     icon: <Award size={21} />, 
     title: "Recognition Badges", 
     desc: "Earn special badges and profile status based on your contributions and team achievements.",
     color: "#fbbf24"
  },
  { 
    icon: <Shield size={21} />, 
    title: "Secure & Safe", 
    desc: "Your data is protected with modern security to keep your work and personal info safe.",
    color: "#10b981"
  }
]

export const faqs = [
  {
    q: "How can I support Espeezy?",
    a: "You can support this project by upgrading to Pro (£4.99/mo) or Premium (£14.99/mo) or securing a Founder Lifetime Access for £99. Your contribution directly funds the high-performance infrastructure required for global academic excellence."
  },
  {
    q: "What is the 'Orbit Gateway'?",
    a: "It is our institutional-grade security portal. It utilizes dynamic secret routes and TOTP verification to ensure that only authorized administrative nodes can access the platform's core orchestration layers."
  },
  {
    q: "How is my data protected?",
    a: "We utilize multi-layer encryption and institutional audit logs. Your data is stored in the same high-security environment used by the world's leading academic institutions."
  },
  {
    q: "Can I delete my account?",
    a: "Of course. You're in control of your data. You can permanently delete your account and all your project info with a single click whenever you like."
  },
  {
    q: "Who is behind Espeezy?",
    a: "I created Espeezy to help student teams feel more supported and recognized during group work."
  }
]

export const navMenus = {
  product: {
    label: 'Features',
    categories: [
      {
        label: 'Tools',
        items: [
          { id: 'kanban', title: 'Smart Kanban', desc: 'Manage your tasks with real-time updates.', icon: <LayoutGrid size={18} />, href: '/#features' },
          { id: 'sync', title: 'Team Sync', desc: 'Keep everyone on the same page, always.', icon: <Zap size={18} />, href: '/#features' }
        ]
      },
      {
        label: 'Planning',
        items: [
          { id: 'roadmap', title: 'Project Timeline', desc: 'See your deadlines in a clear visual way.', icon: <Milestone size={18} />, href: '/#features' }
        ]
      }
    ]
  },
  solutions: {
    label: 'Who it\'s for',
    categories: [
      {
        label: 'Users',
        items: [
          { id: 'research', title: 'Individual Students', desc: 'Track your work and get credit for what you do.', icon: <BookOpen size={18} />, href: '/#mission' },
          { id: 'teams', title: 'Study Groups', desc: 'Collaborate easily with your whole class.', icon: <Users size={18} />, href: '/#mission' }
        ]
      },
      {
        label: 'Organizations',
        items: [
          { id: 'enterprise', title: 'University Clubs', desc: 'Manage large student groups with ease.', icon: <Globe size={18} />, href: '/#mission' }
        ]
      }
    ]
  },
  resources: {
    label: 'About',
    categories: [
      {
        label: 'Our Project',
        items: [
          { id: 'mission', title: 'Our Mission', desc: 'Learn why we started Espeezy.', icon: <Fingerprint size={18} />, href: '/#mission' },
          { id: 'achievements', title: 'Community Impact', desc: 'See how we help students worldwide.', icon: <Award size={18} />, href: '/#faq' }
        ]
      },
      {
        label: 'Need Help?',
        items: [
          { id: 'help', title: 'Help Center', desc: 'Guides and tips to help you get started.', icon: <HelpCircle size={18} />, href: '/docs' }
        ]
      }
    ]
  }
}
