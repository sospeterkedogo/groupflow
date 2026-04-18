'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { 
  Sparkles, 
  Gamepad2, 
  Users, 
  BrainCircuit, 
  ShieldCheck, 
  Terminal, 
  Zap,
  CheckCircle2,
  Play,
  Loader2,
  Dna,
  Cpu,
  RefreshCw
} from 'lucide-react'
import { useProfile } from '@/context/ProfileContext'
import { usePresence } from '@/components/PresenceProvider'
import { useNotifications } from '@/components/NotificationProvider'
import { useSmartLoading } from '@/components/GlobalLoadingProvider'

const TOPICS = [
  { 
    id: 'cyber_ethics', 
    name: 'Cyber Ethics & Law', 
    icon: ShieldCheck, 
    color: 'var(--error)',
    description: 'Master the legal landscape of the digital academic frontier.'
  },
  { 
    id: 'logic_puzzles', 
    name: 'Algorithmic Riddles', 
    icon: BrainCircuit, 
    color: 'var(--brand)',
    description: 'Test your raw logic with complex computing patterns.'
  },
  { 
    id: 'pop_culture', 
    name: 'Scholarly Pop Culture', 
    icon: Gamepad2, 
    color: 'var(--success)',
    description: 'From Turing to Jobs: The history of the digital era.'
  },
  { 
    id: 'institutional', 
    name: 'Institutional Protocols', 
    icon: Terminal, 
    color: 'var(--accent)',
    description: 'How well do you know GroupFlow\u0027s governance?'
  }
]

export default function ChillOutHub() {
  const router = useRouter()
  const { profile } = useProfile()
  const { onlineUsers } = usePresence()
  const { addToast } = useNotifications()
  const { withLoading } = useSmartLoading()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const [step, setStep] = useState(1) // 1: Topic, 2: Preview, 3: Players
  const [selectedTopic, setSelectedTopic] = useState<typeof TOPICS[0] | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [onlineProfiles, setOnlineProfiles] = useState<any[]>([])

  // Fetch profiles for online users
  useEffect(() => {
    async function fetchOnlineProfiles() {
      if (onlineUsers.size === 0) return
      const ids = Array.from(onlineUsers)
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', ids)
      
      if (data) setOnlineProfiles(data.filter(p => p.id !== profile?.id))
    }
    fetchOnlineProfiles()
  }, [onlineUsers, supabase, profile?.id])

  const handleTopicSelect = async (topic: typeof TOPICS[0]) => {
    setSelectedTopic(topic)
    setIsGenerating(true)
    
    // Simulate AI Generation with cinematic delay
    await new Promise(r => setTimeout(r, 2500))
    
    const mockQuestions = [
      { id: '1', question: `Who is known as the father of modern computing?`, options: ['Alan Turing', 'Bill Gates', 'Steve Jobs', 'Ada Lovelace'], correctAnswer: 0 },
      { id: '2', question: `What does the 'S' in HTTPS stand for?`, options: ['Secure', 'Simple', 'Standard', 'Script'], correctAnswer: 0 },
      { id: '3', question: `Which protocol is used for sending email?`, options: ['FTP', 'SMTP', 'HTTP', 'SSH'], correctAnswer: 1 },
      { id: '4', question: `What is the group capacity limit for a Standard Group?`, options: ['5', '10', '15', 'Unlimited'], correctAnswer: 1 },
      { id: '5', question: `Which logic gate outputs true if both inputs are true?`, options: ['OR', 'XOR', 'AND', 'NOR'], correctAnswer: 2 },
    ]
    
    setQuestions(mockQuestions)
    setIsGenerating(false)
    setStep(2)
  }

  const togglePlayer = (id: string) => {
    setSelectedPlayers(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleStartGame = async () => {
    if (selectedPlayers.length === 0) {
      addToast('No Players', 'You must invite at least one online peer.', 'warning')
      return
    }

    const roomId = `quiz_${Date.now()}`
    
    await withLoading(async () => {
      // 1. Send Notifications to all selected players
      for (const playerId of selectedPlayers) {
        await supabase.from('notifications').insert({
          user_id: playerId,
          type: 'quiz_invite',
          title: 'Quiz Challenge!',
          message: `${profile?.full_name || 'A Peer'} invited you to a round of ${selectedTopic?.name}.`,
          metadata: { room_id: roomId, topic_id: selectedTopic?.id }
        })
      }
      
      // 2. Redirect creator
      router.push(`/dashboard/chillout/room/${roomId}`)
    }, 'Initializing Competitive Flux...')
  }

  return (
    <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      
      {/* ── HEADER ────────────────────────────────────────────── */}
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '14px', background: 'rgba(var(--brand-rgb), 0.1)', color: 'var(--brand)' }}>
             <Sparkles size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>
              Chill Out <span style={{ color: 'var(--brand)' }}>Zone</span>
            </h1>
            <p style={{ color: 'var(--text-sub)', fontWeight: 600, fontSize: '0.9rem' }}>Decompress and dominate with real-time academic skirmishes.</p>
          </div>
        </div>
      </header>

      {/* ── STEP INDICATOR ───────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[1, 2, 3].map(s => (
          <div 
            key={s} 
            style={{ 
              height: '4px', 
              flex: 1, 
              background: step >= s ? 'var(--brand)' : 'var(--border)',
              borderRadius: '2px',
              transition: 'all 0.4s ease'
            }} 
          />
        ))}
      </div>

      {/* ── CONTENT RENDERING ────────────────────────────────────── */}
      {isGenerating ? (
        <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="initializing-ring" style={{ marginBottom: '2rem' }}>
             <Dna size={80} className="animate-pulse" style={{ color: 'var(--brand)' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Initializing Game Parameters</h2>
          <p style={{ color: 'var(--text-sub)', fontWeight: 700, fontSize: '0.85rem' }}>Synthesizing {selectedTopic?.name} questions from the institutional graph...</p>
        </div>
      ) : step === 1 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {TOPICS.map(topic => (
            <button 
              key={topic.id}
              onClick={() => handleTopicSelect(topic)}
              className="glass hover-card"
              style={{ 
                padding: '2rem', 
                borderRadius: '24px', 
                border: '1px solid var(--border)', 
                textAlign: 'left',
                background: 'var(--surface)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `rgba(${topic.color === 'var(--brand)' ? 'var(--brand-rgb)' : '239, 68, 68'}, 0.1)`, color: topic.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <topic.icon size={28} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>{topic.name}</h3>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-sub)', lineHeight: 1.5, fontWeight: 500 }}>{topic.description}</p>
              </div>
            </button>
          ))}
        </div>
      ) : step === 2 ? (
        <div className="page-fade" style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 950, margin: 0 }}>Battle Log Configuration</h2>
             <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>Back</button>
                <button onClick={() => setStep(3)} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>Continue</button>
             </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {questions.map((q, i) => (
              <div key={i} style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-sub)', display: 'flex', gap: '1rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.4rem' }}>{q.question}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {q.options.map((opt: string, j: number) => (
                      <span key={j} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', background: j === q.correctAnswer ? 'rgba(30, 142, 62, 0.1)' : 'var(--bg-main)', color: j === q.correctAnswer ? 'var(--success)' : 'var(--text-sub)', border: '1px solid var(--border)' }}>
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 950, marginBottom: '0.5rem' }}>Select Opponents</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '2rem' }}>Only online scholars can receive real-time game signals.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {onlineProfiles.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-sub)' }}>
                  <Users size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                  <p style={{ fontWeight: 700 }}>No other scholars are currently online.</p>
                </div>
              ) : (
                onlineProfiles.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => togglePlayer(p.id)}
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '16px', 
                      border: '1px solid var(--border)', 
                      background: selectedPlayers.includes(p.id) ? 'rgba(var(--brand-rgb), 0.05)' : 'var(--bg-sub)',
                      borderColor: selectedPlayers.includes(p.id) ? 'var(--brand)' : 'var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-main)' }}>
                      {p.avatar_url ? <img src={p.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={16} /></div>}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, flex: 1 }}>{p.full_name}</span>
                    {selectedPlayers.includes(p.id) && <CheckCircle2 size={16} className="text-brand" />}
                  </button>
                ))
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
             <button onClick={() => setStep(2)} className="btn btn-secondary" style={{ padding: '0.8rem 2rem' }}>Back</button>
             <button 
               onClick={handleStartGame} 
               className="btn btn-primary" 
               style={{ padding: '0.8rem 3rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 950 }}
               disabled={selectedPlayers.length === 0}
             >
               <Play size={20} fill="currentColor" />
               Initialize Room
             </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-card:hover {
          transform: translateY(-8px);
          border-color: var(--brand) !important;
          box-shadow: 0 20px 40px rgba(var(--brand-rgb), 0.2);
        }
        .page-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </div>
  )
}
