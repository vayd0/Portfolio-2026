"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

type Mode = "mail" | "call"

function getSlots(weekOffset = 0): { day: Date; times: string[] }[] {
  const times = ["9h00", "14h00", "17h00"]
  const result: { day: Date; times: string[] }[] = []
  const today = new Date()
  let cursor = new Date(today)
  cursor.setDate(cursor.getDate() + 1)
  let skipped = 0
  const toSkip = weekOffset * 5
  while (result.length < 5) {
    const dow = cursor.getDay()
    if (dow !== 0 && dow !== 6) {
      if (skipped < toSkip) { skipped++ }
      else { result.push({ day: new Date(cursor), times }) }
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
const MONTH_LABELS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

function SuccessFeedback({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #0AE448, #C5FF33)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l5 5L20 7" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p style={{ fontFamily: "Fat, sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "white", fontWeight: "normal", lineHeight: 1.1, margin: 0 }}>{title}</p>
      <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>{subtitle}</p>
    </div>
  )
}

function SubmitButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  const lineRef = useRef<HTMLDivElement>(null)
  const gradientRef = useRef<HTMLSpanElement>(null)
  const maskProxy = useRef({ p: 0 })

  const onEnter = () => {
    gsap.killTweensOf(maskProxy.current)
    gsap.to(maskProxy.current, {
      p: 1,
      duration: 0.45,
      ease: "power2.out",
      onUpdate: () => {
        if (!gradientRef.current) return
        const p = maskProxy.current.p * 110
        const mask = `linear-gradient(to right, black ${p - 10}%, transparent ${p}%)`
        gradientRef.current.style.maskImage = mask
        ;(gradientRef.current.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = mask
      },
    })
    gsap.to(lineRef.current, { width: "100%", duration: 0.3, ease: "power2.out" })
  }

  const onLeave = () => {
    gsap.killTweensOf(maskProxy.current)
    gsap.to(maskProxy.current, {
      p: 0,
      duration: 0.35,
      ease: "power2.in",
      onUpdate: () => {
        if (!gradientRef.current) return
        const p = maskProxy.current.p * 110
        const mask = `linear-gradient(to right, black ${p - 10}%, transparent ${p}%)`
        gradientRef.current.style.maskImage = mask
        ;(gradientRef.current.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = mask
      },
    })
    gsap.to(lineRef.current, { width: 0, duration: 0.22, ease: "power2.in" })
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={disabled ? undefined : onEnter}
      onMouseLeave={disabled ? undefined : onLeave}
      disabled={disabled}
      style={{ background: "none", border: "none", padding: 0, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 5 }}
    >
      <div style={{ position: "relative", display: "inline-block" }}>
        <span style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.04em", background: "linear-gradient(90deg, #0AE448, #C5FF33)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>
          {label}
        </span>
        <span
          ref={gradientRef}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: "1.1rem",
            letterSpacing: "0.04em",
            background: "linear-gradient(90deg, #0AE448, #C5FF33)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            maskImage: "linear-gradient(to right, black -10%, transparent 0%)",
            WebkitMaskImage: "linear-gradient(to right, black -10%, transparent 0%)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </div>
      <div ref={lineRef} style={{ height: 1, background: "linear-gradient(90deg, #0AE448, #C5FF33)", width: 0 }} />
    </button>
  )
}

export default function ContactDrawer() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("mail")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [selectedSlot, setSelectedSlot] = useState({ dayIndex: 0, slotIndex: 0 })
  const [weekOffset, setWeekOffset] = useState(0)
  const [brief, setBrief] = useState("")
  const [mailStatus, setMailStatus] = useState<"idle" | "sending" | "success">("idle")
  const [callStatus, setCallStatus] = useState<"idle" | "sending" | "success">("idle")
  const [confirmedSlot, setConfirmedSlot] = useState<{ day: string; time: string } | null>(null)

  const [isMobile, setIsMobile] = useState(false)

  const drawerRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const contentItemsRef = useRef<(HTMLElement | null)[]>([])
  const circleProxy = useRef({ r: 0 })
  const wavePhase = useRef(0)
  const waveTickerRef = useRef<((time: number, deltaTime: number) => void) | null>(null)
  const OX = "0%"
  const OY = "100%"
  const RING_W = 3
  const SHELL_W = 5
  const GAPS = [10, 6, 3]

  const buildMask = (r: number) => {
    const segs: Array<{ from: number; to: number; black: boolean }> = [
      { from: r, to: r + SHELL_W, black: true },
    ]
    let pos = r
    for (const gap of GAPS) {
      const gapFrom = Math.max(0, pos - gap)
      segs.push({ from: gapFrom, to: pos, black: false })
      pos = gapFrom
      if (pos <= 0) break
      const ringFrom = Math.max(0, pos - RING_W)
      segs.push({ from: ringFrom, to: pos, black: true })
      pos = ringFrom
    }
    if (pos > 0) segs.push({ from: 0, to: pos, black: true })
    segs.sort((a, b) => a.from - b.from)
    const stops: string[] = ["black 0"]
    let prevBlack = true
    for (const seg of segs) {
      const c = seg.black ? "black" : "transparent"
      if (seg.black !== prevBlack) stops.push(`${c} ${seg.from}vmax`)
      stops.push(`${c} ${seg.to}vmax`)
      prevBlack = seg.black
    }
    if (prevBlack) stops.push(`transparent ${r + SHELL_W}vmax`)
    return `radial-gradient(circle at ${OX} ${OY}, ${stops.join(", ")})`
  }

  const applyMask = (el: HTMLElement, r: number) => {
    const mask = buildMask(r)
    el.style.maskImage = mask
    ;(el.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = mask
  }

  const clearMask = (el: HTMLElement) => {
    el.style.maskImage = "none"
    ;(el.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = "none"
  }

  const startWave = (drawer: HTMLDivElement) => {
    if (drawer.offsetWidth >= window.innerWidth * 0.95) return
    const AMP = 14
    const FREQ = 2.5
    const SEGS = 60
    const tick = () => {
      wavePhase.current += 0.01
      const W = drawer.offsetWidth
      const H = window.innerHeight
      let d = `M 0 0`
      for (let i = 0; i <= SEGS; i++) {
        const t = i / SEGS
        const y = t * H
        const x = (W - AMP) + AMP * Math.sin(wavePhase.current + t * Math.PI * 2 * FREQ)
        d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`
      }
      d += ` L 0 ${H} Z`
      drawer.style.clipPath = `path('${d}')`
    }
    gsap.ticker.add(tick)
    waveTickerRef.current = tick
  }

  const stopWave = () => {
    if (waveTickerRef.current) {
      gsap.ticker.remove(waveTickerRef.current)
      waveTickerRef.current = null
    }
    if (drawerRef.current) drawerRef.current.style.clipPath = ""
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)

    const handler = () => setOpen(true)
    window.addEventListener("contact:open", handler)
    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("contact:open", handler)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const drawer = drawerRef.current
    const backdrop = backdropRef.current
    if (!drawer || !backdrop) return

    gsap.killTweensOf(circleProxy.current)
    circleProxy.current.r = 0
    applyMask(drawer, 0)
    startWave(drawer)
    gsap.set(backdrop, { opacity: 0, display: "block" })

    gsap.to(backdrop, { opacity: 1, duration: 0.4 })
    gsap.to(circleProxy.current, {
      r: 200,
      duration: 0.72,
      ease: "power3.inOut",
      onUpdate: () => { applyMask(drawer, circleProxy.current.r) },
      onComplete: () => { clearMask(drawer) },
    })

    const items = contentItemsRef.current.filter(Boolean)
    gsap.fromTo(items,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, ease: "power4.out", stagger: 0.05, delay: 0.5 }
    )

    return () => { stopWave() }
  }, [open])

  useEffect(() => {
    if (!open) return
    const items = contentItemsRef.current.filter(Boolean)
    gsap.fromTo(items,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, ease: "power4.out", stagger: 0.04 }
    )
  }, [mode])

  useEffect(() => {
    if (!open) {
      setMailStatus("idle")
      setCallStatus("idle")
      setBrief("")
      setConfirmedSlot(null)
    }
  }, [open])

  const handleClose = () => {
    const drawer = drawerRef.current
    const backdrop = backdropRef.current
    if (!drawer) return
    window.dispatchEvent(new CustomEvent("contact:close"))

    gsap.killTweensOf(circleProxy.current)
    circleProxy.current.r = 200
    applyMask(drawer, 200)

    gsap.to(circleProxy.current, {
      r: 0,
      duration: 0.65,
      ease: "power3.inOut",
      onUpdate: () => { applyMask(drawer, circleProxy.current.r) },
      onComplete: () => {
        setOpen(false)
        if (backdrop) gsap.set(backdrop, { display: "none" })
      },
    })
    if (backdrop) gsap.to(backdrop, { opacity: 0, duration: 0.35, delay: 0.25 })
  }

  const handleSubmitMail = async () => {
    setMailStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "mail", email, message }),
      })
      const data = await res.json()
      console.log("[contact mail]", res.status, data)
      if (res.ok && !data.error) setMailStatus("success")
      else setMailStatus("idle")
    } catch {
      setMailStatus("idle")
    }
  }

  const handleSubmitCall = async () => {
    setCallStatus("sending")
    const day = slots[selectedSlot.dayIndex]
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "call",
          firstName,
          lastName,
          phone,
          brief,
          day: day.day.toLocaleDateString("fr-FR"),
          time: day.times[selectedSlot.slotIndex],
        }),
      })
      setConfirmedSlot({
        day: day.day.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
        time: day.times[selectedSlot.slotIndex],
      })
      setCallStatus("success")
    } catch {
      setCallStatus("idle")
    }
  }

  const setRef = (index: number) => (el: HTMLElement | null) => {
    contentItemsRef.current[index] = el
  }

  const slots = getSlots(weekOffset)

  const drawerStyle: React.CSSProperties = {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100vh",
    width: "min(42vw, 680px)",
    zIndex: 1000,
    background: "#000",
    overflowY: "auto",
    padding: "clamp(28px, 4vw, 52px) clamp(80px, 14vw, 180px) clamp(28px, 4vw, 52px) clamp(28px, 4vw, 52px)",
    boxSizing: "border-box",
  }

  const drawerFinalStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "#000",
        overflowY: "auto",
        padding: "clamp(28px, 4vw, 52px)",
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
      }
    : drawerStyle

  const inputStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.55)",
    color: "white",
    fontFamily: "Satoshi, sans-serif",
    fontSize: "1rem",
    padding: "12px 0",
    width: "100%",
    outline: "none",
    marginBottom: 20,
    display: "block",
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "Satoshi, sans-serif",
    fontWeight: 600,
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: 4,
  }

  const topButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,1)",
    fontFamily: "Satoshi, sans-serif",
    fontWeight: 700,
    fontSize: "0.9rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: 0,
  }

  if (!open) return null

  return (
    <>
      <div
        ref={backdropRef}
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 999,
        }}
      />
      <div
        ref={drawerRef}
        style={drawerFinalStyle}
      >
        <div
          ref={setRef(0)}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          {mode === "mail" ? (
            <button
              style={topButtonStyle}
              onClick={() => setMode("call")}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,1)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.17 9.71 19.79 19.79 0 01.09 1.1 2 2 0 012.08 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
              Appeler
            </button>
          ) : (
            <button
              style={topButtonStyle}
              onClick={() => setMode("mail")}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,1)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
            >
              ← Mail
            </button>
          )}
          <button
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.75)",
              fontSize: "1.5rem",
              fontFamily: "Satoshi, sans-serif",
              cursor: "pointer",
              lineHeight: 1,
              padding: 0,
              }}
            onClick={handleClose}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
          >
            ×
          </button>
        </div>

        <h2
          ref={setRef(1)}
          style={{
            fontFamily: "Fat, sans-serif",
            fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
            color: "white",
            fontWeight: "normal",
            marginTop: 40,
            marginBottom: 32,
            lineHeight: 1.1,
          }}
        >
          {mode === "mail" ? "Écrivez-moi." : "Planifions un appel."}
        </h2>

        {mode === "mail" ? (
          mailStatus === "success" ? (
            <SuccessFeedback
              title="Message envoyé."
              subtitle="Je vous répondrai dans les plus brefs délais."
            />
          ) : (
          <>
            <div ref={setRef(2)}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.2)")}
              />
            </div>
            <div ref={setRef(3)}>
              <label style={labelStyle}>Message</label>
              <textarea
                rows={4}
                placeholder="Décrivez votre projet en quelques mots..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ ...inputStyle, resize: "none" }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.2)")}
              />
            </div>
            <div ref={setRef(4)}>
              <SubmitButton label="Envoyer →" onClick={handleSubmitMail} disabled={mailStatus === "sending"} />
            </div>
          </>
          )
        ) : (
          callStatus === "success" && confirmedSlot ? (
            <SuccessFeedback
              title="Créneau confirmé."
              subtitle={`Je vous appellerai le ${confirmedSlot.day} à ${confirmedSlot.time}.`}
            />
          ) : (
          <>
            <div ref={setRef(2)} style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "white", letterSpacing: "0.02em" }}>
                  {MONTH_LABELS[slots[0].day.getMonth()]}
                  {slots[0].day.getMonth() !== slots[4].day.getMonth() && ` — ${MONTH_LABELS[slots[4].day.getMonth()]}`}
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => { setWeekOffset(w => Math.max(0, w - 1)); setSelectedSlot({ dayIndex: 0, slotIndex: 0 }) }}
                    disabled={weekOffset === 0}
                    style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, color: weekOffset === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)", cursor: weekOffset === 0 ? "default" : "pointer", padding: "4px 10px", fontFamily: "Satoshi, sans-serif", fontSize: "0.85rem", transition: "color 0.15s, border-color 0.15s" }}
                    onMouseEnter={(e) => { if (weekOffset > 0) e.currentTarget.style.color = "white" }}
                    onMouseLeave={(e) => { if (weekOffset > 0) e.currentTarget.style.color = "rgba(255,255,255,0.7)" }}
                  >←</button>
                  <button
                    onClick={() => { setWeekOffset(w => w + 1); setSelectedSlot({ dayIndex: 0, slotIndex: 0 }) }}
                    style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "4px 10px", fontFamily: "Satoshi, sans-serif", fontSize: "0.85rem", transition: "color 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "white" }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)" }}
                  >→</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {slots.map((slot, di) => {
                  const isDaySelected = selectedSlot.dayIndex === di
                  return (
                    <div key={di} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div
                        style={{
                          textAlign: "center",
                          fontFamily: "Satoshi, sans-serif",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: isDaySelected ? "transparent" : "rgba(255,255,255,0.5)",
                          background: isDaySelected ? "linear-gradient(135deg, #0AE448, #C5FF33)" : "transparent",
                          WebkitBackgroundClip: isDaySelected ? "text" : undefined,
                          backgroundClip: isDaySelected ? "text" : undefined,
                          WebkitTextFillColor: isDaySelected ? "transparent" : undefined,
                          paddingBottom: 8,
                          borderBottom: `1px solid ${isDaySelected ? "rgba(197,255,51,0.4)" : "rgba(255,255,255,0.1)"}`,
                          transition: "color 0.2s, border-color 0.2s",
                        }}
                      >
                        {DAY_LABELS[slot.day.getDay()]}
                        <br />
                        <span style={{ fontSize: "1rem", fontWeight: 700 }}>
                          {slot.day.getDate()}
                        </span>
                      </div>
                      {slot.times.map((time, si) => {
                        const isSelected = selectedSlot.dayIndex === di && selectedSlot.slotIndex === si
                        return (
                          <div
                            key={si}
                            onClick={() => setSelectedSlot({ dayIndex: di, slotIndex: si })}
                            style={{
                              borderRadius: 8,
                              padding: "9px 4px",
                              fontSize: "0.82rem",
                              fontFamily: "Satoshi, sans-serif",
                              fontWeight: isSelected ? 700 : 400,
                              cursor: "pointer",
                              textAlign: "center",
                              transition: "background 0.15s, color 0.15s",
                              background: isSelected ? "linear-gradient(135deg, #0AE448, #C5FF33)" : "rgba(255,255,255,0.07)",
                              color: isSelected ? "#000" : "rgba(255,255,255,0.7)",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.background = "rgba(255,255,255,0.13)"
                                e.currentTarget.style.color = "white"
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.background = "rgba(255,255,255,0.07)"
                                e.currentTarget.style.color = "rgba(255,255,255,0.7)"
                              }
                            }}
                          >
                            {time}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>

            <div ref={setRef(3)}>
              <label style={labelStyle}>Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.2)")}
              />
            </div>
            <div ref={setRef(4)}>
              <label style={labelStyle}>Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.2)")}
              />
            </div>
            <div ref={setRef(5)}>
              <label style={labelStyle}>Téléphone</label>
              <input
                type="tel"
                placeholder="+33 6 00 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.2)")}
              />
            </div>
            <div ref={setRef(6)}>
              <label style={labelStyle}>Sujet <span style={{ fontWeight: 400, opacity: 0.5 }}>(optionnel)</span></label>
              <textarea
                rows={3}
                placeholder="En quelques mots, de quoi souhaitez-vous parler ?"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                style={{ ...inputStyle, resize: "none" }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.2)")}
              />
            </div>
            <div ref={setRef(7)}>
              <SubmitButton label="Confirmer →" onClick={handleSubmitCall} disabled={callStatus === "sending"} />
            </div>
          </>
          )
        )}
      </div>
    </>
  )
}
