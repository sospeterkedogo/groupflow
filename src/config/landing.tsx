import React from 'react'
import { Layers, Users, Zap, Shield, Milestone, Award, LayoutGrid, BookOpen, Globe, Fingerprint, HelpCircle, Braces } from 'lucide-react'

export const features = [
  { 
    icon: <Layers size={21} />, 
    title: "Task Management Made Easy", 
    desc: "Collaborate with your team on tasks with our smart task board. Save time with automatic updates and real-time syncing across all your devices.",
    color: "var(--brand)"
  },
  { 
    icon: <Users size={21} />, 
    title: "Connect with Your Peers", 
    desc: "Build your university network and connect with other students in your classes. Share resources and collaborate on projects.",
    color: "#10b981"
  },
  { 
    icon: <Zap size={21} />, 
    title: "Stay Synced", 
    desc: "Our quick syncing feature keeps your chat and file sharing up-to-date across all your devices. Never miss a beat with our reliable platform.",
    color: "var(--accent)"
  },
  { 
    icon: <Shield size={21} />, 
    title: "Credit Where Credit is Due", 
    desc: "We keep a safe record of your contributions in every project. Ensure you always get the credit you deserve with our platform.",
    color: "#6366f1"
  },
  { 
    icon: <Milestone size={21} />, 
    title: "See Your Progress", 
    desc: "Track your progress with our visible progress feature. Stay motivated and reach your goals with our platform.",
    color: "#f56565"
  },
  { 
    icon: <Award size={21} />, 
    title: "Recognition for Your Work", 
    desc: "We recognize your hard work with our award system. Earn badges and rewards for your contributions to projects.",
    color: "#f6e05e"
  },
  { 
    icon: <LayoutGrid size={21} />, 
    title: "Organize Your Tasks", 
    desc: "Organize your tasks with our layout grid feature. Create a visually appealing and organized task board.",
    color: "#5c6bc0"
  },
  { 
    icon: <BookOpen size={21} />, 
    title: "Access to Resources", 
    desc: "Access a library of resources and tutorials with our book open feature. Learn new skills and stay up-to-date with industry trends.",
    color: "#3b82f6"
  },
  { 
    icon: <Globe size={21} />, 
    title: "Global Community", 
    desc: "Join a global community of students and professionals. Connect with people from all over the world and collaborate on projects.",
    color: "#28a745"
  },
  { 
    icon: <Fingerprint size={21} />, 
    title: "Personalized Experience", 
    desc: "Enjoy a personalized experience with our fingerprint feature. Your preferences and settings are saved for easy access.",
    color: "#795548"
  },
  { 
    icon: <HelpCircle size={21} />, 
    title: "Support When You Need It", 
    desc: "Our help circle feature provides support when you need it. Get help with any issues or questions you may have.",
    color: "#9f3a38"
  },
  { 
    icon: <Braces size={21} />, 
    title: "Safety First", 
    desc: "Your safety is our priority with our braces feature. We keep your data secure and private. Rest assured, your information is in good hands.",
    color: "#d32f2f"
  }
]

export const Landing: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Introducing Espeezy</h1>
      <p className="text-lg mb-4">Your new task management platform</p>
      <div className="flex flex-wrap justify-center items-center">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center mb-4">
            <div className="w-16 h-16 rounded-full flex justify-center items-center bg-gray-300 mb-2">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
      <button className="px-4 py-2 mt-4 bg-blue-500 text-white rounded hover:bg-blue-700">Get Started</button>
    </div>
  )
}