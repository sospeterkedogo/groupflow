'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Mail, Download, Clock, CheckCircle, FileText, Send, Inbox, AlertTriangle } from 'lucide-react'

type VirtualEmail = {
  id: string
  subject: string
  from: string
  content: string
  timestamp: string
  hasAttachment: boolean
  type: 'reminder' | 'report' | 'system'
}

export default function EmailCenter({ groupId, profile }: { groupId: string, profile: any }) {
  const [emails, setEmails] = useState<VirtualEmail[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<VirtualEmail | null>(null)
  const supabase = createClient()

  useEffect(() => {
    generateSimulatedInbox()
  }, [])

  const generateSimulatedInbox = () => {
    const mockEmails: VirtualEmail[] = [
      {
        id: '1',
        subject: '⚠️ Milestone Alert: Deadline Approaching',
        from: 'GroupFlow AI Autopilot',
        content: `Greetings ${profile?.full_name || 'Collaborator'},\n\nOur temporal sensors indicate that 3 tasks in your group are due within the next 48 hours. Please sync with your team to ensure the velocity remains optimal.`,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        hasAttachment: false,
        type: 'reminder'
      },
      {
        id: '2',
        subject: '📊 Automated Project Performance Digest',
        from: 'Analytics Distribution Node',
        content: `Your weekly performance digest is ready. This report includes a full breakdown of task completions, validity score distributions, and current project health metrics.`,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        hasAttachment: true,
        type: 'report'
      }
    ]
    setEmails(mockEmails)
  }

  const generateAndSendReport = async () => {
    setLoading(true)
    // Simulate complex PDF compilation delay
    await new Promise(r => setTimeout(r, 2000))
    
    const newEmail: VirtualEmail = {
      id: Math.random().toString(),
      subject: '📄 Verifiable Audit Report Generated',
      from: 'Audit Service Alpha',
      content: `The comprehensive project audit report has been generated at your request. This PDF contains every verifiable action logged in the last session.`,
      timestamp: new Date().toISOString(),
      hasAttachment: true,
      type: 'report'
    }
    
    setEmails([newEmail, ...emails])
    setLoading(false)
    alert("Report generated and delivered to your Virtual Inbox.")
  }

  const downloadMockPDF = () => {
    // In a real environment, we'd use jspdf. For this simulation, we'll create a text blob.
    const reportContent = `
      GROUPFLOW PROJECT AUDIT REPORT
      ==============================
      Project: ${groupId}
      Member: ${profile?.full_name}
      Generated: ${new Date().toLocaleString()}
      
      STATS:
      - Validity Score: ${profile?.total_score || 0}
      - Project Status: Active
      
      CONFIRMATION: This report is a verifiable snapshot of the project registry.
    `
    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `GroupFlow_Report_${new Date().toISOString().split('T')[0]}.pdf`
    link.click()
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', height: '600px', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      
      {/* Sidebar: Inbox List */}
      <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Inbox size={20} color="var(--brand)" /> Virtual Inbox
           </h3>
        </div>
        
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
           <button 
             onClick={generateAndSendReport}
             disabled={loading}
             className="btn btn-primary" 
             style={{ width: '100%', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
           >
              {loading ? 'Compiling PDF...' : <><Send size={16} /> Force Report Now</>}
           </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {emails.map(email => (
            <div 
              key={email.id} 
              onClick={() => setSelectedEmail(email)}
              style={{ 
                padding: '1.25rem', 
                borderBottom: '1px solid var(--bg-main)', 
                cursor: 'pointer',
                background: selectedEmail?.id === email.id ? 'rgba(var(--brand-rgb), 0.05)' : 'transparent',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ fontSize: '0.65rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                {new Date(email.timestamp).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{email.subject}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{email.from}</div>
              {email.hasAttachment && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--brand)', fontSize: '0.7rem', fontWeight: 700 }}>
                   <FileText size={12} /> PDF ATTACHED
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel: Email Content */}
      <div style={{ background: 'var(--bg-sub)', display: 'flex', flexDirection: 'column' }}>
        {selectedEmail ? (
          <>
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>{selectedEmail.subject}</h2>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                    {new Date(selectedEmail.timestamp).toLocaleString()}
                  </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>GF</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedEmail.from}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>To: {profile?.email}</div>
                  </div>
               </div>
            </div>

            <div style={{ padding: '2.5rem', flex: 1, whiteSpace: 'pre-line', lineHeight: 1.6, color: 'var(--text-main)', fontSize: '0.95rem' }}>
               {selectedEmail.content}
               
               {selectedEmail.hasAttachment && (
                 <div style={{ marginTop: '3rem', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '16px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <div style={{ padding: '1rem', background: 'rgba(217, 48, 37, 0.1)', color: 'var(--error)', borderRadius: '12px' }}>
                          <FileText size={24} />
                       </div>
                       <div>
                          <div style={{ fontWeight: 700 }}>GroupFlow_Audit_Report.pdf</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Signed PDF Document • 1.2 MB</div>
                       </div>
                    </div>
                    <button onClick={downloadMockPDF} className="btn" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', fontWeight: 700 }}>
                       <Download size={18} /> Download
                    </button>
                 </div>
               )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)' }}>
             <Mail size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
             <p>Select a message to view the audit trail.</p>
          </div>
        )}
      </div>

    </div>
  )
}
