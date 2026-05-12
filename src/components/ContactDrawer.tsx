"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

type Mode = "mail" | "call"

function getSlots(): { day: Date; times: string[] }[] {
  const times = ["9h00", "14h00", "17h00"]
  const result: { day: Date; times: string[] }[] = []
  const today = new Date()
  let cursor = new Date(today)
  cursor.setDate(cursor.getDate() + 1)
  while (result.length < 5) {
    const dow = cursor.getDay()
    if (dow !== 0 && dow !== 6) {
      result.push({ day: new Date(cursor), times })
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

export default function ContactDrawer() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("mail")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [selectedSlot, setSelectedSlot] = useState({ dayIndex: 0, slotIndex: 0 })

  const [isMobile, setIsMobile] = useState(false)

  const drawerRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const contentItemsRef = useRef<(HTMLElement | null)[]>([])
  const circleProxy = useRef({ r: 0 })
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
    el.style.clipPath = `circle(${r + SHELL_W}vmax at ${OX} ${OY})`
    const mask = buildMask(r)
    el.style.maskImage = mask
    ;(el.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = mask
  }

  const clearMask = (el: HTMLElement) => {
    el.style.clipPath = "none"
    el.style.maskImage = "none"
    ;(el.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = "none"
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
    gsap.set(backdrop, { opacity: 0, display: "block" })

    gsap.to(backdrop, { opacity: 1, duration: 0.5 })
    gsap.to(circleProxy.current, {
      r: 200,
      duration: 0.9,
      ease: "power3.inOut",
      onUpdate: () => { applyMask(drawer, circleProxy.current.r) },
      onComplete: () => { clearMask(drawer) },
    })

    const items = contentItemsRef.current.filter(Boolean)
    gsap.fromTo(items,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, ease: "power4.out", stagger: 0.05, delay: 0.5 }
    )
  }, [open])

  useEffect(() => {
    if (!open) return
    const items = contentItemsRef.current.filter(Boolean)
    gsap.fromTo(items,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, ease: "power4.out", stagger: 0.04 }
    )
  }, [mode])

  const handleClose = () => {
    const drawer = drawerRef.current
    const backdrop = backdropRef.current
    if (!drawer) return

    gsap.killTweensOf(circleProxy.current)
    if (drawer.style.clipPath === "none" || !drawer.style.clipPath) {
      circleProxy.current.r = 200
      applyMask(drawer, 200)
    }

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

  const handleSubmitMail = () => {
    window.location.href = `mailto:hello@theoheck.fr?subject=Contact via portfolio&body=${encodeURIComponent(message)}`
  }

  const handleSubmitCall = () => {
    const slots = getSlots()
    const day = slots[selectedSlot.dayIndex]
    console.log({
      firstName,
      lastName,
      phone,
      day: day.day.toLocaleDateString("fr-FR"),
      time: day.times[selectedSlot.slotIndex],
    })
  }

  const handleButtonHover = (el: HTMLElement | null) => {
    if (!el) return
    gsap.to(el, { scale: 1.05, ease: "elastic.out(1, 0.5)", duration: 0.5 })
  }

  const handleButtonLeave = (el: HTMLElement | null) => {
    if (!el) return
    gsap.to(el, { scale: 1, duration: 0.3 })
  }

  const setRef = (index: number) => (el: HTMLElement | null) => {
    contentItemsRef.current[index] = el
  }

  const slots = getSlots()

  const drawerStyle: React.CSSProperties = {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100vh",
    width: "min(33.333vw, 580px)",
    zIndex: 1000,
    background: "#000",
    overflowY: "auto",
    padding: "clamp(28px, 4vw, 52px)",
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
    borderBottom: "1px solid rgba(255,255,255,0.2)",
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
    fontWeight: 500,
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: 4,
  }

  const topButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Satoshi, sans-serif",
    fontWeight: 500,
    fontSize: "0.9rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: 0,
  }

  const submitButtonRef = useRef<HTMLButtonElement>(null)

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
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 5.31 5.31l1.62-1.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 14.9l.27 2z" />
              </svg>
              Appeler
            </button>
          ) : (
            <button
              style={topButtonStyle}
              onClick={() => setMode("mail")}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,1)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >
              ← Mail
            </button>
          )}
          <button
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              fontSize: "1.5rem",
              fontFamily: "Satoshi, sans-serif",
              cursor: "pointer",
              lineHeight: 1,
              padding: 0,
            }}
            onClick={handleClose}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
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
              <button
                ref={submitButtonRef}
                onClick={handleSubmitMail}
                onMouseEnter={() => handleButtonHover(submitButtonRef.current)}
                onMouseLeave={() => handleButtonLeave(submitButtonRef.current)}
                style={{
                  background: "linear-gradient(135deg, #0AE448, #C5FF33)",
                  color: "#000",
                  borderRadius: 100,
                  padding: "14px 32px",
                  border: "none",
                  fontFamily: "Satoshi, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  display: "inline-block",
                }}
              >
                Envoyer →
              </button>
            </div>
          </>
        ) : (
          <>
            <div ref={setRef(2)} style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                {slots.map((slot, di) => (
                  <div
                    key={di}
                    style={{
                      textAlign: "center",
                      fontFamily: "Satoshi, sans-serif",
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.4,
                      paddingBottom: 4,
                    }}
                  >
                    {DAY_LABELS[slot.day.getDay()]}
                    <br />
                    {slot.day.getDate()}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gridTemplateRows: "repeat(3, auto)",
                  gap: 6,
                }}
              >
                {slots.map((slot, di) =>
                  slot.times.map((time, si) => {
                    const isSelected = selectedSlot.dayIndex === di && selectedSlot.slotIndex === si
                    const isFirst = di === 0 && si === 0
                    return (
                      <div
                        key={`${di}-${si}`}
                        onClick={() => setSelectedSlot({ dayIndex: di, slotIndex: si })}
                        style={{
                          gridColumn: di + 1,
                          gridRow: si + 1,
                          borderRadius: 8,
                          padding: "8px 4px",
                          fontSize: "0.8rem",
                          fontFamily: "Satoshi, sans-serif",
                          cursor: "pointer",
                          textAlign: "center",
                          lineHeight: 1.4,
                          transition: "background 0.15s",
                          background: isSelected
                            ? "linear-gradient(135deg, #0AE448, #C5FF33)"
                            : "rgba(255,255,255,0.06)",
                          color: isSelected ? "#000" : "rgba(255,255,255,0.8)",
                          fontWeight: isSelected ? 700 : 400,
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.13)"
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.06)"
                        }}
                      >
                        {isFirst && (
                          <span
                            style={{
                              fontSize: "0.6rem",
                              background: "#0AE448",
                              color: "#000",
                              borderRadius: 4,
                              padding: "1px 4px",
                              display: "block",
                              marginBottom: 2,
                            }}
                          >
                            Prochain
                          </span>
                        )}
                        {time}
                      </div>
                    )
                  })
                )}
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
              <button
                ref={submitButtonRef}
                onClick={handleSubmitCall}
                onMouseEnter={() => handleButtonHover(submitButtonRef.current)}
                onMouseLeave={() => handleButtonLeave(submitButtonRef.current)}
                style={{
                  background: "linear-gradient(135deg, #0AE448, #C5FF33)",
                  color: "#000",
                  borderRadius: 100,
                  padding: "14px 32px",
                  border: "none",
                  fontFamily: "Satoshi, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  display: "inline-block",
                }}
              >
                Confirmer →
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
