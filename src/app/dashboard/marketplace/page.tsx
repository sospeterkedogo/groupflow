'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Clock, 
  Plus, 
  Camera, 
  AlertTriangle, 
  Info,
  CheckCircle2,
  Handshake,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react'
import { useProfile } from '@/context/ProfileContext'
import { useSmartLoading } from '@/components/GlobalLoadingProvider'
import { useNotifications } from '@/components/NotificationProvider'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  is_free: boolean
  images: string[]
  meetup_zone: string
  meetup_details: string
  duration_days: number
  payment_method: string
  status: string
  owner_id: string
  created_at: string
}

export default function MarketplacePage() {
  const { profile } = useProfile()
  const [listings, setListings] = useState<Listing[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const { withLoading } = useSmartLoading()
  const { addToast } = useNotifications()

  // 1. Check for first-time visitor
  useEffect(() => {
    const hasSeen = localStorage.getItem('gf_marketplace_onboarding')
    if (!hasSeen) {
      setShowWalkthrough(true)
      localStorage.setItem('gf_marketplace_onboarding', 'true')
    }
  }, [])

  const fetchListings = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Fetch error:', error.message)
    } else {
      setListings(data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    void fetchListings()
  }, [fetchListings])

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '6rem' }}>
      
      {/* ── MARKETPLACE HEADER ────────────────────────────────────────── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 950, letterSpacing: '-0.04em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingBag className="text-brand" size={32} />
            Share & Borrow <span style={{ color: 'var(--brand)', opacity: 0.5, fontWeight: 400 }}>/ Hub</span>
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 600 }}>
            Exchange academic resources safely within your campus ecosystem.
          </p>
        </div>
        
        <button 
          onClick={() => setIsPosting(true)}
          className="btn btn-primary"
          style={{ padding: '0.8rem 1.5rem', borderRadius: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 8px 20px rgba(var(--brand-rgb), 0.3)' }}
        >
          <Plus size={20} strokeWidth={3} />
          Post New Item
        </button>
      </header>

      {/* ── SECURITY BANNER ────────────────────────────────────────────── */}
      <div style={{ 
        padding: '1rem 1.5rem', 
        background: 'rgba(239, 68, 68, 0.05)', 
        border: '1px solid rgba(239, 68, 68, 0.1)', 
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <ShieldAlert className="text-error" size={24} />
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>Safety Protocol Active</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
            Trading illegal or prohibited items is strictly forbidden. All listings are subject to human review and community reporting.
          </div>
        </div>
      </div>

      {/* ── EXPLORER CONTROLS ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} size={18} />
          <input 
            type="text" 
            placeholder="Search current listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.8rem 1rem 0.8rem 3rem', 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: '14px',
              fontSize: '0.9rem',
              fontWeight: 600,
              outline: 'none',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        </div>
      </div>

      {/* ── LISTINGS GRID ─────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ padding: '5rem', textAlign: 'center' }}>
          <Loader2 size={40} className="animate-spin text-brand" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '1.5rem', fontWeight: 800, color: 'var(--text-sub)' }}>Synchronizing Marketplace Flux...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div style={{ padding: '8rem 2rem', textAlign: 'center', background: 'var(--surface)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto', opacity: 0.2, marginBottom: '1.5rem' }} />
          <h3 style={{ fontWeight: 900, marginBottom: '0.5rem' }}>No Items Detected</h3>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>Be the first to share an item with your peers.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredListings.map(item => (
            <div 
              key={item.id} 
              className="glass hover-card"
              style={{ 
                borderRadius: '24px', 
                overflow: 'hidden', 
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
            >
              <div style={{ height: '200px', background: 'var(--bg-sub)', position: 'relative', overflow: 'hidden' }}>
                {item.images?.[0] ? (
                  <img 
                    src={supabase.storage.from('marketplace').getPublicUrl(item.images[0]).data.publicUrl} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    alt={item.title} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', background: 'var(--bg-main)' }}>
                    <Plus size={32} opacity={0.3} />
                  </div>
                )}
                <div style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem', 
                  padding: '0.4rem 0.8rem', 
                  background: 'rgba(0,0,0,0.6)', 
                  backdropFilter: 'blur(10px)', 
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '0.75rem'
                }}>
                  {item.price === 0 ? 'FREE' : `$${item.price}`}
                </div>
              </div>
              
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.4rem' }}>{item.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand)', marginBottom: '0.75rem' }}>
                  <MapPin size={14} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{item.meetup_zone}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-sub)' }}>
                    <Clock size={14} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{item.duration_days} Days Loan</span>
                  </div>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <ArrowRight size={12} className="text-brand" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ONBOARDING WALKTHROUGH ───────────────────────────────────── */}
      {showWalkthrough && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setShowWalkthrough(false)} />
          <div className="page-fade" style={{ 
            width: '100%', 
            maxWidth: '500px', 
            background: 'var(--surface)', 
            borderRadius: '32px', 
            overflow: 'hidden', 
            position: 'relative',
            boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ height: '8px', background: 'var(--brand)' }} />
            <div style={{ padding: '2.5rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(var(--brand-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', marginBottom: '1.5rem' }}>
                <Handshake size={32} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-0.04em', marginBottom: '1rem' }}>Welcome to the Exchange</h2>
              <p style={{ color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: '2rem', fontSize: '1rem' }}>
                GroupFlow's internal marketplace is designed for students to share hardware, textbooks, and resources securely. 
                Coordinate swaps at academic safe-zones and process payments via Stripe or Cash.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flexShrink: 0 }}><CheckCircle2 className="text-success" size={20} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8 }}>Verify your resource before handoff.</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flexShrink: 0 }}><CheckCircle2 className="text-success" size={20} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8 }}>Always meet in academic safe-zones.</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <div style={{ flexShrink: 0 }}><CheckCircle2 className="text-success" size={20} /></div>
                   <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8 }}>Report prohibited or fraudulent behavior.</div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowWalkthrough(false)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '2.5rem', padding: '1rem', borderRadius: '16px', fontWeight: 900, fontSize: '1rem' }}
              >
                Let's Begin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── POSTING WIZARD ───────────────────────────────────────────── */}
      {isPosting && (
        <PostListingModal 
          onClose={() => setIsPosting(false)} 
          onSuccess={() => { setIsPosting(false); fetchListings(); }} 
        />
      )}

      <style jsx>{`
        .hover-card:hover {
          transform: translateY(-8px);
          border-color: var(--brand) !important;
          box-shadow: 0 20px 40px rgba(var(--brand-rgb), 0.2);
        }
        @keyframes sweep {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

function PostListingModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [meetupZone, setMeetupZone] = useState('Library')
  const [meetupDetails, setMeetupDetails] = useState('')
  const [duration, setDuration] = useState(7)
  const [paymentMethod, setPaymentMethod] = useState('BOTH')
  const [images, setImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const supabase = createBrowserSupabaseClient()
  const { addToast } = useNotifications()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages(prev => [...prev, ...newFiles].slice(0, 5))
    }
  }

  const handlePost = async () => {
    if (!agreed) {
      alert('You must agree to the institutional policy.')
      return
    }
    setUploading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Auth required')

      const uploadedPaths: string[] = []
      for (const img of images) {
        const ext = img.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`
        const { error: upErr } = await supabase.storage.from('marketplace').upload(path, img)
        if (!upErr) uploadedPaths.push(path)
      }

      const { error } = await supabase.from('marketplace_listings').insert({
        owner_id: user.id,
        title,
        description,
        price: parseFloat(price),
        is_free: parseFloat(price) === 0,
        images: uploadedPaths,
        meetup_zone: meetupZone,
        meetup_details: meetupDetails,
        duration_days: duration,
        payment_method: paymentMethod,
        status: 'AVAILABLE'
      })

      if (error) throw error
      addToast('Listing Created', 'Your resource is now visible to the institutional graph.', 'success')
      onSuccess()
    } catch (err: any) {
      addToast('Upload Failed', err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }} onClick={onClose} />
      
      <div className="page-fade" style={{ 
        width: '100%', 
        maxWidth: '550px', 
        background: 'var(--surface)', 
        borderRadius: '28px', 
        overflow: 'hidden', 
        position: 'relative',
        boxShadow: 'var(--shadow-2xl)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>List New Resource</h2>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--brand)', background: 'rgba(var(--brand-rgb), 0.1)', padding: '4px 10px', borderRadius: '10px' }}>
            STEP {step} / 3
          </div>
        </div>

        <div style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {step === 1 && (
            <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: '0.6rem' }}>Resource Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Psychology Textbook, Graphing Calculator..."
                  style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-sub)', outline: 'none' }}
                />
              </div>
              <div>
                 <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: '0.6rem' }}>Visual Evidence ({images.length}/5)</label>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                    {images.map((img, i) => (
                      <div key={i} style={{ aspectRatio: '1/1', background: 'var(--bg-sub)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                        <img src={URL.createObjectURL(img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                    {images.length < 5 && (
                      <label style={{ aspectRatio: '1/1', background: 'var(--bg-sub)', border: '2px dashed var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <Camera size={24} className="text-sub" />
                        <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
                      </label>
                    )}
                 </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: '0.6rem' }}>Condition & Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the condition, version, or any specific details..."
                  style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-sub)', outline: 'none', resize: 'none' }}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: '0.6rem' }}>Price ($)</label>
                    <div style={{ position: 'relative' }}>
                       <DollarSign size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
                       <input 
                         type="number" 
                         value={price}
                         onChange={(e) => setPrice(e.target.value)}
                         style={{ width: '100%', padding: '0.9rem 0.9rem 0.9rem 2.5rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-sub)', outline: 'none' }}
                       />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-sub)', marginTop: '0.4rem', display: 'block' }}>Enter 0 for Free/Share</span>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: '0.6rem' }}>Max Duration (Days)</label>
                    <input 
                      type="number" 
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-sub)', outline: 'none' }}
                    />
                  </div>
               </div>

               <div>
                 <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: '0.6rem' }}>Academic Safe Zone</label>
                 <select 
                   value={meetupZone}
                   onChange={(e) => setMeetupZone(e.target.value)}
                   style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-sub)', outline: 'none', appearance: 'none' }}
                 >
                   <option>Library</option>
                   <option>Student Union</option>
                   <option>Science Hub</option>
                   <option>Cafeteria</option>
                   <option>Custom Location</option>
                 </select>
               </div>
               
               <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: '0.6rem' }}>Meetup Details</label>
                  <input 
                    type="text" 
                    value={meetupDetails}
                    onChange={(e) => setMeetupDetails(e.target.value)}
                    placeholder="e.g. Near the main entrance, 2nd floor study area..."
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-sub)', outline: 'none' }}
                  />
               </div>

               <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: '0.6rem' }}>Accepted Payments</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                     {['CASH', 'STRIPE', 'BOTH'].map(m => (
                       <button 
                         key={m} 
                         onClick={() => setPaymentMethod(m)}
                         style={{ 
                           padding: '0.75rem', 
                           borderRadius: '10px', 
                           border: '1px solid var(--border)', 
                           background: paymentMethod === m ? 'var(--brand)' : 'var(--bg-sub)',
                           color: paymentMethod === m ? 'white' : 'var(--text-sub)',
                           fontSize: '0.7rem',
                           fontWeight: 800
                         }}
                       >
                         {m}
                       </button>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'center' }}>
               <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '24px', border: '2px dashed rgba(239, 68, 68, 0.2)' }}>
                  <AlertTriangle className="text-error" size={40} style={{ margin: '0 auto', marginBottom: '1.5rem' }} />
                  <h3 style={{ fontWeight: 950, color: 'var(--error)' }}>LEGAL & POLICY ALERT</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', lineHeight: 1.6, marginTop: '1rem' }}>
                    Trading prohibited substances, dangerous hardware, or copyrighted materials is an institutional violation. 
                    Your account and listing will be immediately logged for human review if reported. 
                    Illegal activities will be forwarded to student conduct boards.
                  </p>
               </div>
               
               <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', justifyContent: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={agreed} 
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--brand)' }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>I strictly adhere to these policies.</span>
               </label>
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 800, border: '1px solid var(--border)' }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <button 
            onClick={() => step < 3 ? setStep(s => s + 1) : handlePost()}
            className="btn btn-primary"
            disabled={uploading}
            style={{ padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 900, minWidth: '120px' }}
          >
            {uploading ? <Loader2 className="animate-spin" size={20} /> : step === 3 ? 'Finalize Post' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
