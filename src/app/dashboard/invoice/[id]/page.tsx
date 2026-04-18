'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { ShieldCheck, Download, Printer, ChevronLeft, Mail, Building2, Landmark } from 'lucide-react'
import Link from 'next/link'

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string
  const supabase = createBrowserSupabaseClient()
  
  const [payment, setPayment] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data: paymentData } = await supabase
      .from('payments')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single()

    if (paymentData) {
      setPayment(paymentData)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)
    }
    setLoading(false)
  }, [supabase, invoiceId, router])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>
  if (!payment) return <div style={{ textAlign: 'center', padding: '10rem' }}>Protocol record not found.</div>

  const amount = (payment.amount_total / 100).toFixed(2)
  const currency = payment.currency?.toUpperCase() || 'USD'

  return (
    <div className="invoice-container" style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '4rem 2rem' }}>
      
      {/* Top Controls (Hidden on Print) */}
      <div className="no-print" style={{ maxWidth: '850px', margin: '0 auto 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', fontWeight: 700 }}>
          <ChevronLeft size={20} /> Back to Dashboard
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handlePrint} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
            <Printer size={18} /> Print Record
          </button>
          <button onClick={handlePrint} className="btn btn-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
            <Download size={18} /> Download Protocol
          </button>
        </div>
      </div>

      {/* THE HIGH-END INVOICE */}
      <div id="invoice-sheet" style={{ 
        maxWidth: '850px', 
        margin: '0 auto', 
        background: 'white', 
        color: '#1e293b',
        padding: '5rem',
        borderRadius: '2px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif"
      }}>
        {/* Subtle Watermark */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', fontSize: '10rem', fontWeight: 900, opacity: 0.03, pointerEvents: 'none', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
          Institutional Clearance
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5rem' }}>
          <div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', background: '#0f172a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={28} color="#d4af37" />
                </div>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#0f172a' }}>GroupFlow</h1>
             </div>
             <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Landmark size={14} /> Higher Education Research Initiative</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> kedogosospeter36@gmail.com</div>
             </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Protocol Invoice</h2>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>No. {payment.invoice_number || `GF-${format(new Date(payment.created_at), 'yyyy')}-${payment.id.slice(0, 6).toUpperCase()}`}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Issued: {format(new Date(payment.created_at), 'MMMM dd, yyyy')}</div>
          </div>
        </div>

        {/* Bill To & Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '300px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Sponsoring Specialist</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{profile?.full_name}</div>
            <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.25rem' }}>{profile?.email}</div>
            <div style={{ fontSize: '0.9rem', color: '#475569' }}>{profile?.institution || 'Academic Collaborator'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Clearance Status</div>
            <div style={{ 
              display: 'inline-block', 
              padding: '0.4rem 1.2rem', 
              background: payment.status === 'paid' ? '#f0fdf4' : '#fff7ed', 
              borderRadius: '99px',
              border: `1px solid ${payment.status === 'paid' ? '#bcf0da' : '#ffedd5'}`,
              color: payment.status === 'paid' ? '#166534' : '#c2410c',
              fontSize: '0.75rem',
              fontWeight: 900,
              textTransform: 'uppercase'
            }}>
              {payment.status === 'paid' ? 'Authenticated & Secured' : 'Pending Authorization'}
            </div>
          </div>
        </div>

        {/* Hero Wording Block */}
        <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '4rem' }}>
           <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.6 }}>
             "Your contribution serves as a pivotal synchronization point in our global research framework. By securing this institutional clearance, you have directly empowered the synchronization of scholars worldwide. <b>You are now a verified protocol architect within the GroupFlow ecosystem.</b>"
           </p>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #0f172a' }}>
              <th style={{ textAlign: 'left', padding: '1rem 0', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Description</th>
              <th style={{ textAlign: 'right', padding: '1rem 0', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Type</th>
              <th style={{ textAlign: 'right', padding: '1rem 0', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '1.5rem 0', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{payment.plan_label}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Full institutional synchronization, priority AI routing, and encrypted research vault access.</div>
              </td>
              <td style={{ textAlign: 'right', padding: '1.5rem 0', verticalAlign: 'top', textTransform: 'capitalize', fontWeight: 700 }}>{payment.mode}</td>
              <td style={{ textAlign: 'right', padding: '1.5rem 0', verticalAlign: 'top', fontWeight: 900, color: '#0f172a' }}>{amount} {currency}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} style={{ textAlign: 'right', padding: '2rem 1rem 0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Subtotal</td>
              <td style={{ textAlign: 'right', padding: '2rem 1rem 0.5rem', fontWeight: 700 }}>{amount} {currency}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ textAlign: 'right', padding: '0.5rem 1rem', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>Total Authorized</td>
              <td style={{ textAlign: 'right', padding: '0.5rem 1rem', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{amount} {currency}</td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <Building2 size={32} color="#cbd5e1" />
              <ShieldCheck size={32} color="#cbd5e1" />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '400px' }}>
              GroupFlow Institutional Clearance Record. This document is electronically generated and verified via the institutional blockchain. For queries, contact kedogosospeter36@gmail.com
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
             <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#64748b', marginBottom: '0.5rem' }}>Protocol Authorized By:</div>
             <div style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em', borderBottom: '1px solid #0f172a', display: 'inline-block' }}>Sospeter Kedogo</div>
             <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.25rem', textTransform: 'uppercase' }}>Lead Protocol Architect</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .invoice-container { background: white !important; padding: 0 !important; }
          #invoice-sheet { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; border: none !important; }
        }
      `}</style>
    </div>
  )
}
