import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

function encrypt(text, key) {
  return btoa(text.split('').map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join(''))
}
function decrypt(encoded, key) {
  try {
    const raw = atob(encoded)
    return raw.split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('')
  } catch { return '[message illisible]' }
}

const KEY = 'vaultmsg_x9#mZ!kP@qR2_secret'

export default function Chat() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [online] = useState(Math.floor(Math.random() * 3) + 2)
  const bottomRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('vault_user')
    if (!stored) { router.push('/'); return }
    setUser(JSON.parse(stored))
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100)
    if (data) setMessages(data)
    setLoading(false)
  }

  async function sendMessage() {
    if (!input.trim() || !user) return
    const encrypted = encrypt(input.trim(), KEY)
    await supabase.from('messages').insert({ from_user: user.username, content: encrypted })
    setInput('')
    fetchMessages()
  }

  function logout() {
    localStorage.removeItem('vault_user')
    router.push('/')
  }

  const colors = ['#6366f1','#a855f7','#ec4899','#06b6d4','#10b981']
  function userColor(name) {
    let hash = 0
    for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#030508', gap:16 }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:40, height:40, border:'2px solid rgba(99,102,241,.2)', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#334155', letterSpacing:3 }}>CONNEXION SECURISEE...</div>
    </div>
  )

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#030508; overflow:hidden; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(99,102,241,.3);border-radius:2px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        input:focus{outline:none;border-color:rgba(99,102,241,.6)!important;box-shadow:0 0 0 3px rgba(99,102,241,.1)!important}
        input::placeholder{color:#1e293b}
        .send-btn:hover{background:rgba(99,102,241,.2)!important;border-color:rgba(99,102,241,.6)!important}
        .msg-bubble{animation:fadeIn .3s ease forwards}
      `}</style>

      {/* Background grid */}
      <div style={{ position:'fixed', inset:0, backgroundImage:`linear-gradient(rgba(99,102,241,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.02) 1px,transparent 1px)`, backgroundSize:'60px 60px', pointerEvents:'none' }}/>

      {/* Header */}
      <div style={s.header}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700, color:'#f1f5f9' }}>
            Vault<span style={{ background:'linear-gradient(135deg,#6366f1,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>MSG</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)', borderRadius:20, padding:'4px 10px' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 6px rgba(34,197,94,.6)', animation:'pulse 2s ease-in-out infinite' }}/>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#22c55e' }}>{online} EN LIGNE</span>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(15,20,30,.8)', border:'1px solid rgba(51,65,85,.4)', borderRadius:10, padding:'6px 12px' }}>
            <div style={{ width:24, height:24, borderRadius:8, background:`${user ? userColor(user.username) : '#6366f1'}22`, border:`1px solid ${user ? userColor(user.username) : '#6366f1'}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color: user ? userColor(user.username) : '#6366f1' }}>
              {user?.username[0].toUpperCase()}
            </div>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#64748b' }}>@{user?.username}</span>
          </div>
          <button onClick={logout} style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:10, padding:'8px 14px', color:'#f87171', fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:1, cursor:'pointer' }}>
            QUITTER
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={s.messages}>
        {messages.length === 0 && (
          <div style={{ textAlign:'center', margin:'auto', color:'#1e293b' }}>
            <div style={{ fontSize:40, marginBottom:12, opacity:.3 }}>⬡</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:3 }}>CANAL SECURISE — AUCUN MESSAGE</div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.from_user === user?.username
          const text = decrypt(msg.content, KEY)
          const time = new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
          const color = userColor(msg.from_user)
          const prevFrom = i > 0 ? messages[i-1].from_user : null
          const showName = msg.from_user !== prevFrom

          return (
            <div key={msg.id} className="msg-bubble" style={{ display:'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap:10, marginBottom: showName ? 16 : 4 }}>
              {/* Avatar */}
              <div style={{ width:32, height:32, flexShrink:0, borderRadius:10, background:`${color}15`, border:`1px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color, opacity: showName ? 1 : 0 }}>
                {msg.from_user[0].toUpperCase()}
              </div>

              <div style={{ maxWidth:'65%' }}>
                {showName && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color, fontWeight:500 }}>{msg.from_user}</span>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'#1e293b' }}>{time}</span>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:'#1e293b' }}>🔒</span>
                  </div>
                )}
                <div style={{
                  padding:'12px 16px',
                  background: isMe ? `rgba(99,102,241,.1)` : 'rgba(15,23,42,.8)',
                  border: `1px solid ${isMe ? 'rgba(99,102,241,.25)' : 'rgba(51,65,85,.3)'}`,
                  borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                }}>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:14, color:'#cbd5e1', lineHeight:1.6 }}>{text}</div>
                  <div style={{ marginTop:6, fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:'#1e293b', letterSpacing:1 }}>
                    ◈ {msg.content.substring(0, 20)}...
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input bar */}
      <div style={s.inputBar}>
        <div style={{ flex:1, position:'relative' }}>
          <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'#1e293b' }}>🔒</span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Message chiffre..."
            style={{
              width:'100%', padding:'14px 16px 14px 42px',
              background:'rgba(15,20,30,.9)', border:'1px solid rgba(51,65,85,.4)',
              borderRadius:14, color:'#e2e8f0', fontSize:14,
              fontFamily:"'Space Grotesk',sans-serif", transition:'all .2s',
            }}
          />
        </div>
        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={!input.trim()}
          style={{
            padding:'14px 20px',
            background:'rgba(99,102,241,.08)', border:'1px solid rgba(99,102,241,.3)',
            borderRadius:14, color:'#818cf8',
            fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:2,
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            opacity: input.trim() ? 1 : .4, transition:'all .2s',
          }}
        >
          ENVOYER →
        </button>
      </div>
    </div>
  )
}

const s = {
  page: { height:'100vh', display:'flex', flexDirection:'column', background:'#030508', position:'relative' },
  header: {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'14px 24px', background:'rgba(8,12,20,.95)',
    borderBottom:'1px solid rgba(51,65,85,.3)',
    backdropFilter:'blur(20px)', position:'relative', zIndex:10,
  },
  messages: {
    flex:1, overflowY:'auto', padding:'24px',
    display:'flex', flexDirection:'column', gap:2,
  },
  inputBar: {
    display:'flex', gap:10, padding:'16px 24px',
    background:'rgba(8,12,20,.95)', borderTop:'1px solid rgba(51,65,85,.3)',
    backdropFilter:'blur(20px)',
  },
}
