'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  RoomProvider, 
  useStorage, 
  useMutation, 
  useMyPresence, 
  useOthers,
  useUpdateMyPresence
} from '@/liveblocks.config'
import { LiveList, LiveObject } from '@liveblocks/client'
import { 
  Trophy, 
  Timer, 
  User, 
  Crown, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Zap,
  Target,
  Download,
  LogOut,
  Sparkles,
  Loader2
} from 'lucide-react'
import { useProfile } from '@/context/ProfileContext'
import confetti from 'canvas-confetti'
import { jsPDF } from 'jspdf'

export default function QuizRoomPage() {
  const params = useParams()
  const roomId = params?.id as string
  
  return (
    <RoomProvider 
      id={roomId} 
      initialStorage={{ 
        tasks: new LiveList([]),
        messages: new LiveList([]),
        quizQuestions: new LiveList([]),
        quizScores: new LiveList([]),
        quizStatus: 'setup',
        currentQuestionIndex: 0,
        activeTurnUserId: null,
        gameId: roomId
      }}
      initialPresence={{ draggingTaskId: null, isThinking: false }}
    >
      <QuizGameContainer />
    </RoomProvider>
  )
}

function QuizGameContainer() {
  const { profile } = useProfile()
  const router = useRouter()
  const [me, updateMyPresence] = useMyPresence()
  const others = useOthers()
  const quizStatus = useStorage(s => s.quizStatus)
  const questions = useStorage(s => s.quizQuestions)
  const currentIdx = useStorage(s => s.currentQuestionIndex)
  const scores = useStorage(s => s.quizScores)
  const activeTurnId = useStorage(s => s.activeTurnUserId)
  
  const [showIntro, setShowIntro] = useState(true)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  
  // ── MUTATIONS ───────────────────────────────────────────────────
  const initializeGame = useMutation(({ storage }) => {
    // Generate some mock questions if empty
    if (storage.get('quizQuestions').length === 0) {
      const qPool = [
        { id: '1', question: 'What is the primary goal of GroupFlow?', options: ['Automation', 'Accountability', 'Socializing', 'Gaming'], correctAnswer: 1 },
        { id: '2', question: 'Which phase comes after Research in our workflow?', options: ['Execute', 'Plan', 'Verify', 'Deploy'], correctAnswer: 1 },
        { id: '3', question: 'What does Flux representative of?', options: ['Money', 'Activity', 'Energy', 'Velocity'], correctAnswer: 3 },
        { id: '4', question: 'Maximum capacity of a Pro team?', options: ['5', '12', '25', 'Unlimited'], correctAnswer: 2 }
      ]
      qPool.forEach(q => storage.get('quizQuestions').push(q))
    }
    storage.set('quizStatus', 'playing')
    // Pick first random player
    const players = [profile?.id, ...others.map(o => o.connectionId)].filter(Boolean) as string[]
    storage.set('activeTurnUserId', players[Math.floor(Math.random() * players.length)])
  }, [profile?.id, others])

  const submitAnswer = useMutation(({ storage }, isCorrect: boolean) => {
    const userId = profile?.id
    if (!userId) return

    // Update Scores
    const scoresList = storage.get('quizScores')
    let found = false
    for (let i = 0; i < scoresList.length; i++) {
        if (scoresList.get(i).userId === userId) {
            scoresList.set(i, { ...scoresList.get(i), points: scoresList.get(i).points + (isCorrect ? 100 : -25) })
            found = true
            break
        }
    }
    if (!found) {
        scoresList.push({ userId, userName: profile?.full_name || 'Anonymous', points: isCorrect ? 100 : 0 })
    }

    // Move to next turn
    const nextIdx = storage.get('currentQuestionIndex') + 1
    if (nextIdx < storage.get('quizQuestions').length) {
      storage.set('currentQuestionIndex', nextIdx)
      const allPlayers = [userId, ...others.map(o => o.id)].filter(Boolean)
      storage.set('activeTurnUserId', allPlayers[Math.floor(Math.random() * allPlayers.length)])
    } else {
      storage.set('quizStatus', 'results')
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
    }
  }, [profile, others])

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const currentQ = questions[currentIdx]
  const isMyTurn = activeTurnId === profile?.id

  const handleSelect = (idx: number) => {
    if (!isMyTurn || hasAnswered) return
    setSelectedOption(idx)
    setHasAnswered(true)
    
    const correct = idx === currentQ.correctAnswer
    if (correct) confetti({ particleCount: 40, scalar: 0.7 })
    
    setTimeout(() => {
      submitAnswer(correct)
      setSelectedOption(null)
      setHasAnswered(false)
    }, 1500)
  }

  // ── TROPHY GENERATION ───────────────────────────────────────────
  const downloadTrophy = () => {
    const doc = new jsPDF()
    const winner = scores.sort((a,b) => b.points - a.points)[0]
    
    doc.setFillColor(15, 23, 42) // Slate 900
    doc.rect(0, 0, 210, 297, 'F')
    
    doc.setTextColor(59, 130, 246) // Blue 500
    doc.setFontSize(40)
    doc.text('INSTITUTIONAL TROPHY', 105, 50, { align: 'center' })
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.text('ACADEMIC DOMINANCE ATTAINED', 105, 80, { align: 'center' })
    
    doc.setFontSize(16)
    doc.text(`Game ID: ${quizStatus === 'results' ? 'GF-' + Math.random().toString(36).substr(2,6).toUpperCase() : 'PENDING'}`, 105, 100, { align: 'center' })
    
    doc.setTextColor(251, 191, 36) // Amber 400
    doc.setFontSize(30)
    doc.text(winner?.userName?.toUpperCase() || 'ANONYMOUS', 105, 130, { align: 'center' })
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.text(`TOTAL SCORE: ${winner?.points || 0}`, 105, 150, { align: 'center' })
    doc.text(`QUESTIONS CLEARED: ${questions.length}`, 105, 160, { align: 'center' })
    
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(1)
    doc.line(40, 175, 170, 175)
    
    doc.setFontSize(10)
    doc.text('GROUPFLOW CHILL OUT PROTOCOL v1.0', 105, 280, { align: 'center' })
    
    doc.save(`trophy_${winner?.userName || 'winner'}.pdf`)
  }

  if (showIntro) {
    return (
      <div style={{ height: 'var(--vh-dynamic)', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
         <div className="glitch-container" style={{ position: 'relative' }}>
            <Zap size={100} className="text-brand animate-pulse" fill="var(--brand)" />
         </div>
         <h1 style={{ fontSize: '3rem', fontWeight: 950, letterSpacing: '-0.05em', marginTop: '2rem' }}>INITIALIZING <span style={{ color: 'var(--brand)' }}>SKIRMISH</span></h1>
         <p style={{ color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Binding Real-Time Flux...</p>
      </div>
    )
  }

  return (
    <div className="page-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', height: 'calc(var(--vh-dynamic) - 6rem)', overflow: 'hidden' }}>
      
      {/* ── MAIN GAME AREA ────────────────────────────────────────── */}
      <div style={{ background: 'var(--surface)', borderRadius: '32px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {quizStatus === 'setup' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
             <Crown size={80} className="text-brand" style={{ marginBottom: '2rem', opacity: 0.2 }} />
             <h2 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: '1rem' }}>Waiting for Participants</h2>
             <p style={{ color: 'var(--text-sub)', marginBottom: '2.5rem', maxWidth: '400px', fontWeight: 600 }}>The skirmish will begin once the lobby creator initializes the synchronized questions.</p>
             {profile?.id && others.length > 0 && <button onClick={initializeGame} className="btn btn-primary" style={{ padding: '1rem 3rem', borderRadius: '16px', fontWeight: 950, fontSize: '1.1rem' }}>DEPLOY GAME FLUX</button>}
             {others.length === 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-sub)', fontWeight: 700 }}><Loader2 className="animate-spin" size={20} /> SYNCING WITH PEERS...</div>}
          </div>
        )}

        {quizStatus === 'playing' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '3rem' }}>
             {/* Header */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(var(--brand-rgb), 0.1)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950 }}>{currentIdx + 1}</div>
                   <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', color: 'var(--text-sub)', letterSpacing: '0.1em' }}>Current Round</div>
                      <div style={{ fontWeight: 800 }}>Institutional Logic</div>
                   </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1rem', background: 'var(--bg-sub)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                   <Timer size={18} className="text-brand" />
                   <span style={{ fontWeight: 900, fontSize: '1.25rem', fontFamily: 'monospace' }}>--:--</span>
                </div>
             </div>

             {/* Question Card */}
             <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1rem' }}>{currentQ?.question}</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                   <Target size={16} className="text-brand" />
                   <span style={{ fontWeight: 700, color: 'var(--text-sub)' }}>
                      Active Player: <span style={{ color: isMyTurn ? 'var(--brand)' : 'var(--text-main)', fontWeight: 950 }}>{isMyTurn ? 'YOU' : others.find(o => o.id === activeTurnId)?.info?.name || 'A Peer'}</span>
                   </span>
                </div>
             </div>

             {/* Options Grid */}
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {currentQ?.options.map((opt: string, i: number) => {
                  const isSelected = selectedOption === i
                  const isCorrect = hasAnswered && i === currentQ.correctAnswer
                  const isWrong = hasAnswered && isSelected && i !== currentQ.correctAnswer
                  
                  return (
                    <button 
                      key={i}
                      disabled={!isMyTurn || hasAnswered}
                      onClick={() => handleSelect(i)}
                      className={`option-btn ${isSelected ? 'selected' : ''}`}
                      style={{ 
                        padding: '1.5rem', 
                        borderRadius: '20px', 
                        border: '2px solid var(--border)', 
                        background: 'var(--bg-sub)',
                        textAlign: 'left',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        cursor: isMyTurn ? 'pointer' : 'default',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderColor: isCorrect ? 'var(--success)' : isWrong ? 'var(--error)' : isSelected ? 'var(--brand)' : 'var(--border)'
                      }}
                    >
                      <span>{opt}</span>
                      {isCorrect && <CheckCircle2 className="text-success" />}
                      {isWrong && <XCircle className="text-error" />}
                    </button>
                  )
                })}
             </div>
          </div>
        )}

        {quizStatus === 'results' && (
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem' }}>
              <div className="trophy-reveal" style={{ position: 'relative', marginBottom: '2rem' }}>
                 <Trophy size={120} className="text-brand" fill="var(--brand)" style={{ filter: 'drop-shadow(0 0 20px rgba(var(--brand-rgb), 0.4))' }} />
                 <Sparkles size={40} style={{ position: 'absolute', top: -20, right: -20, color: '#fbbf24' }} className="animate-pulse" />
              </div>
              <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '0.5rem' }}>SKIRMISH COMPLETE</h2>
              <p style={{ color: 'var(--text-sub)', fontSize: '1.1rem', fontWeight: 600, maxWidth: '500px', marginBottom: '3rem' }}>The academic hierarchy has been re-established. Final scores are now immutable and archived.</p>
              
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                 <button 
                   onClick={downloadTrophy}
                   className="btn btn-primary" 
                   style={{ padding: '1rem 2.5rem', borderRadius: '16px', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                 >
                    <Download size={20} />
                    Download Trophy Receipt
                 </button>
                 <button onClick={() => router.push('/dashboard/chillout')} className="btn btn-secondary" style={{ padding: '1rem 2.5rem', borderRadius: '16px', fontWeight: 950 }}>
                    Exit Lobby
                 </button>
              </div>
           </div>
        )}
      </div>

      {/* ── SIDEBAR / LEADERBOARD ─────────────────────────────────── */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
         <div style={{ flex: 1, background: 'var(--surface)', borderRadius: '32px', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 950, textTransform: 'uppercase', color: 'var(--text-sub)', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Target size={14} className="text-brand" /> Live Leaderboard
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {scores.sort((a,b) => b.points - a.points).map((s, idx) => (
                 <div key={s.userId} style={{ padding: '0.75rem', borderRadius: '14px', background: s.userId === profile?.id ? 'rgba(var(--brand-rgb), 0.05)' : 'var(--bg-sub)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '24px', fontWeight: 900, color: idx === 0 ? '#fbbf24' : 'var(--text-sub)' }}>#{idx + 1}</div>
                    <div style={{ flex: 1, fontWeight: 800, fontSize: '0.85rem' }}>{s.userName}</div>
                    <div style={{ fontWeight: 950, color: 'var(--brand)', fontSize: '0.9rem' }}>{s.points}</div>
                 </div>
               ))}
               {scores.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-sub)', fontSize: '0.8rem' }}>Awaiting points data...</div>}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
               <div style={{ fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: '1rem' }}>Scholars in Room ({others.length + 1})</div>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--brand)', padding: '2px', border: activeTurnId === profile?.id ? '2px solid var(--success)' : 'none' }}>
                     <img src={profile?.avatar_url || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                  {others.map(o => (
                    <div key={o.id} style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--bg-sub)', padding: '2px', border: activeTurnId === o.id ? '2px solid var(--success)' : 'none' }}>
                      <img src={o.info?.avatar || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <button onClick={() => router.push('/dashboard/chillout')} className="btn btn-secondary" style={{ width: '100%', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontWeight: 950 }}>
            <LogOut size={18} /> Abandon Skirmish
         </button>
      </aside>

      <style jsx>{`
        .option-btn:hover:not(:disabled) {
           border-color: var(--brand) !important;
           transform: translateX(8px);
        }
        .option-btn.selected {
           background: rgba(var(--brand-rgb), 0.1) !important;
        }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.1); } }
        .page-fade { animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}
