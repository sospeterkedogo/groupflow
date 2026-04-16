'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  RoomProvider, 
  useStorage, 
  useMutation, 
  useMyPresence, 
  useOthers,
  useUpdateMyPresence
} from '@/liveblocks.config'
import { LiveList } from '@liveblocks/client'
import { Send, User as UserIcon, Smile, Paperclip, MoreVertical, MessageSquare, Video } from 'lucide-react'
import VideoCall from './VideoCall'

import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { useSmartLoading } from '@/components/GlobalLoadingProvider'

interface ChatRoomProps {
  roomId: string;
  currentUser: { id: string; name: string };
}

function ChatContent({ currentUser, roomId }: { currentUser: { id: string; name: string }, roomId: string }) {
  const messages = useStorage((root) => root.messages);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [text, setText] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createBrowserSupabaseClient();
  const { withLoading } = useSmartLoading();

  const isTyping = others.some((other) => other.presence.isTyping);

  useEffect(() => {
    fetchHistory();
  }, [roomId]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (data) {
      setHistory(data.map(m => ({
        id: m.id,
        senderId: m.sender_id,
        senderName: m.metadata?.sender_name || 'Researcher',
        text: m.content,
        timestamp: m.created_at,
        isHistory: true
      })));
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, history]);

  const sendMessage = useMutation(({ storage }, text: string) => {
    const messages = storage.get("messages");
    messages.push({
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      timestamp: new Date().toISOString(),
    });
  }, [currentUser]);

  const handleSend = async () => {
    if (!text.trim()) return;
    
    // 1. Instant Real-time Broadcast via Liveblocks
    sendMessage(text);
    const messageContent = text;
    setText("");
    updateMyPresence({ isTyping: false });

    // 2. Permanent Archival via Supabase
    await withLoading(async () => {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: currentUser.id,
          content: messageContent,
          metadata: { sender_name: currentUser.name }
        });
      
      if (error) console.error("Message backup failed:", error);
    }, 'Synchronizing Archive...')
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(var(--brand-rgb), 0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.6rem', background: 'var(--brand)', borderRadius: '12px' }}>
            <MessageSquare size={20} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Secure Messaging</h3>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--success)', fontWeight: 800 }}>VERIFIED STUDENT CONNECTION</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => setShowVideo(true)}
            style={{ 
              background: 'var(--bg-sub)', border: 'none', padding: '0.5rem 0.75rem', 
              borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', 
              gap: '0.5rem', color: 'var(--brand)', fontWeight: 800, fontSize: '0.8rem' 
            }}
          >
            <Video size={18} /> Start Video
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }}>
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {showVideo && (
        <VideoCall 
          roomName={roomId} 
          userName={currentUser.name} 
          onClose={() => setShowVideo(false)} 
        />
      )}

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {loadingHistory && (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-sub)', fontSize: '0.8rem' }}>
            Restoring message history...
          </div>
        )}

        {!loadingHistory && history.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Previous Messages</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>
        )}

        {/* Render History from Supabase */}
        {history.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div 
              key={msg.id} 
              style={{ 
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex',
                gap: '0.75rem',
                flexDirection: isMe ? 'row-reverse' : 'row'
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: isMe ? 'var(--brand)' : 'var(--bg-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserIcon size={16} color={isMe ? "white" : "var(--text-sub)"} />
              </div>
              <div style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                background: isMe ? 'var(--brand)' : 'var(--bg-sub)',
                color: isMe ? 'white' : 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-sm)',
                opacity: 0.85
              }}>
                {msg.text}
                <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.4rem', textAlign: isMe ? 'right' : 'left' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Separator if live messages exist */}
        {(messages?.length || 0) > 0 && history.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.3 }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase' }}>Live Updates</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.3 }} />
          </div>
        )}

        {/* Render Live Messages from Liveblocks */}
        {messages?.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div 
              key={msg.id} 
              style={{ 
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex',
                gap: '0.75rem',
                flexDirection: isMe ? 'row-reverse' : 'row'
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: isMe ? 'var(--brand)' : 'var(--bg-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserIcon size={16} color={isMe ? "white" : "var(--text-sub)"} />
              </div>
              <div style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                background: isMe ? 'var(--brand)' : 'var(--bg-sub)',
                color: isMe ? 'white' : 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-sm)'
              }}>
                {msg.text}
                <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.4rem', textAlign: isMe ? 'right' : 'left' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontStyle: 'italic', marginLeft: '3.25rem' }}>
            Someone is typing...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', background: 'var(--bg-sub)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-sub)' }}>
             <Paperclip size={20} style={{ cursor: 'pointer' }} />
             <Smile size={20} style={{ cursor: 'pointer' }} />
          </div>
          <input 
            type="text"
            className="form-input"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              updateMyPresence({ isTyping: e.target.value.length > 0 });
            }}
            onKeyDown={handleKeyDown}
            style={{ flex: 1, height: '3rem', borderRadius: '16px', paddingLeft: '1rem', border: '1px solid var(--border)', background: 'var(--surface)' }}
          />
          <button 
            onClick={handleSend}
            style={{ 
              width: '3rem', height: '3rem', borderRadius: '16px', background: 'var(--brand)', 
              color: 'white', border: 'none', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(var(--brand-rgb), 0.3)' 
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatRoom({ roomId, currentUser }: ChatRoomProps) {
  return (
    <RoomProvider 
       id={roomId} 
       initialPresence={{ draggingTaskId: null, userName: currentUser.name, isTyping: false }}
       initialStorage={{ tasks: new LiveList([]), messages: new LiveList([]) }}
    >
      <ChatContent currentUser={currentUser} roomId={roomId} />
    </RoomProvider>
  );
}
