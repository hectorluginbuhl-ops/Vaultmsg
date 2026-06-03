import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Login() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const p = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
    }))
    setParticles(p)
  }, [])

  async function handleLogin() {
    if (blocked || loading) return
    if (!username || !password) { setError('Remplis tous les champs.'); return }
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase().trim())
      .eq('password', password)
      .single()

    setLoading(false)

    if (err || !data) {
      const next = attempts + 1
      setAttempts(next)
      if (next >= 4) {
        setBlocked(true)
        setError('Acces bloque. Contacte l administrateur.')
      } else {
        setError(`Identifiants incorrects — ${4 - next} tentative(s) restante(s)`)
      }
      return
    }

    localStorage.setItem('vault_user', JSON.stringify({ id: data.id, username: data.username }))
    router.push('/chat')
  }

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#030508; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes pulse { 0%,100%{opacity:.2} 50%{opacity:.6} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanline { 0%{top:-10%} 100%{top:110%} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,.3)} 50%{box-shadow:0 0 40px rgba(99,102,241,.6),0 0 80px rgba(99,102,241,.2)} }
        input:focus { border-color: rgba(99,102,241,.8) !important; box-shadow: 0 0 0 3px rgba(99,102,241,.15) !important; outline:none; }
        input::placeholder { color: #2d3a4a; }
        .btn:hover { background: rgba(99,102,241,.15) !important; transform: translateY(-1px); }
        .btn:active { transform: translateY(0); }
      `}</style>

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position:'fixed', left:`${p.x}%`, top:`${p.y}%`,
          width:p.size, height:p.size, borderRadius:'50%',
          background:'rgba(99,102,241,.4)',
          animation:`float ${p.duration}s ${p.delay}s ease-in-out infinite`,
          pointerEvents:'none',
        }}/>
      ))}

      {/* Grid */}
      <div style={{
        position:'fixed', inset:0, pointerEvents:'none',
        backgroundImage:`linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)`,
        backgroundSize:'60px 60px',
      }}/>

      {/* Scanline */}
      <div style={{
        position:'fixed', left:0, right:0, height:'2px',
        background:'linear-gradient(90deg,transparent,rgba(99,102,241,.3),transparent)',
        animation:'scanline 8s linear infinite', pointerEvents:'none',
      }}/>

      {/* Orbs */}
      <div style={{ position:'fixed', top:'-20%', left:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,.08),transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'fixed', bottom:'-20%', right:'-10%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(168,85,247,.06),transparent 70%)', pointerEvents:'none' }}/>

      {/* Card */}
      <div style={{ ...s.card, animation:'fadeUp .6s ease forwards' }}>

        {/* Top accent */}
        <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(99,102,241,.8),transparent)', marginBottom:40 }}/>

        {/* Logo area */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ position:'relative', display:'inline-block', marginBottom:20 }}>
            <div style={{
              width:72, height:72, borderRadius:20,
              background:'linear-gradient(135deg,rgba(99,102,241,.2),rgba(168,85,247,.2))',
              border:'1px solid rgba(99,102,241,.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:30, animation:'glow 3s ease-in-out infinite',
              margin:'0 auto',
            }}>⬡</div>
            <div style={{
              position:'absolute', top:-4, right:-4,
              width:16, height:16, borderRadius:'50%',
              background:'#22c55e', border:'2px solid #030508',
              boxShadow:'0 0 10px rgba(34,197,94,.5)',
            }}/>
          </div>

          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:700, color:'#f1f5f9', letterSpacing:1, marginBottom:6 }}>
            Vault<span style={{ background:'linear-gradient(135deg,#6366f1,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>MSG</span>
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#334155', letterSpacing:4 }}>
            MESSAGERIE PRIVEE CHIFFREE
          </div>
        </div>

        {/* Fields */}
        {[
          { label:'IDENTIFIANT', val:username, set:setUsername, type:'text', ph:'ton_identifiant', icon:'◈' },
          { label:'MOT DE PASSE', val:password, set:setPassword, type:'password', ph:'••••••••••••', icon:'◉' },
        ].map(({ label, val, set, type, ph, icon }) => (
          <div key={label} style={{ marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <span style={{ color:'#6366f1', fontSize:12 }}>{icon}</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#334155', letterSpacing:3 }}>{label}</span>
            </div>
            <input
              type={type}
              value={val}
              onChange={e => set(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder={ph}
              disabled={blocked}
              style={{
                width:'100%', padding:'14px 16px',
                background:'rgba(15,20,30,.8)',
                border:'1px solid rgba(51,65,85,.6)',
                borderRadius:12, color:'#e2e8f0', fontSize:14,
                fontFamily:"'JetBrains Mono',monospace",
                transition:'all .2s', opacity: blocked ? .5 : 1,
              }}
            />
          </div>
        ))}

        {/* Error */}
        {error && (
          <div style={{
            background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)',
            borderRadius:10, padding:'12px 16px', marginBottom:20,
            fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#f87171',
            display:'flex', alignItems:'center', gap:8,
          }}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* Button */}
        <button
          className="btn"
          onClick={handleLogin}
          disabled={blocked || loading}
          style={{
            width:'100%', padding:'15px',
            background:'rgba(99,102,241,.1)',
            border:'1px solid rgba(99,102,241,.4)',
            borderRadius:12, cursor: blocked ? 'not-allowed' : 'pointer',
            fontFamily:"'JetBrains Mono',monospace",
            fontSize:12, letterSpacing:4, color:'#818cf8',
            transition:'all .2s', opacity: blocked ? .5 : 1,
          }}
        >
          {loading ? '● VERIFICATION...' : blocked ? '⛔ ACCES BLOQUE' : '→ ACCEDER AU VAULT'}
        </button>

        {/* Footer */}
        <div style={{ marginTop:28, textAlign:'center' }}>
          <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(51,65,85,.4),transparent)', marginBottom:16 }}/>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'#1e293b', letterSpacing:2 }}>
            ACCES RESTREINT — MEMBRES AUTORISES UNIQUEMENT
          </div>
        </div>

        {/* Bottom accent */}
        <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(168,85,247,.5),transparent)', marginTop:28 }}/>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    background:'#030508', fontFamily:"'Space Grotesk',sans-serif",
    position:'relative', overflow:'hidden', padding:20,
  },
  card: {
    position:'relative', width:'100%', maxWidth:420,
    background:'rgba(8,12,20,.95)',
    border:'1px solid rgba(51,65,85,.4)',
    borderRadius:24, padding:'0 36px 36px',
    backdropFilter:'blur(20px)',
    boxShadow:'0 25px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.03)',
    opacity:0,
  },
}
