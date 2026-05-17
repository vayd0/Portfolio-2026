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

function SubmitButton({ label, onClick }: { label: string; onClick: () => void }) {
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
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 5 }}
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

  const handleClose = () => {
    const drawer = drawerRef.current
    const backdrop = backdropRef.current
    if (!drawer) return

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

  const handleSubmitMail = () => {
    window.location.href = `mailto:hello@theoheck.fr?subject=Contact via portfolio&body=${encodeURIComponent(message)}`
  }

  const handleSubmitCall = () => {
    const slots = getSlots(weekOffset)
    const day = slots[selectedSlot.dayIndex]
    console.log({
      firstName,
      lastName,
      phone,
      day: day.day.toLocaleDateString("fr-FR"),
      time: day.times[selectedSlot.slotIndex],
    })
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
              <svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: 4 }}>
                <path d="M4.3457 1.42718C4.34588 1.4309 4.3586 1.50395 4.6722 2.0508C4.9524 2.53939 5.5621 3.40463 6.02733 4.19913C6.49256 4.99363 6.81623 5.6779 6.98685 6.05576C7.15747 6.43362 7.16522 6.48434 7.15443 6.54669C7.13014 6.68711 6.9695 6.94083 6.74826 7.2753C6.5652 7.55204 6.18204 8.09914 5.77118 8.81611C5.58686 9.13775 5.56664 9.25901 5.56155 9.36804C5.54959 9.62427 5.89397 10.208 6.44055 11.0963C7.1839 12.3043 7.5828 12.3917 7.80239 12.4556C7.85723 12.4716 7.90832 12.4685 8.3311 12.2386C8.75388 12.0088 9.54765 11.5453 10.0148 11.2872C10.5878 10.9708 10.8086 10.9441 11.0243 10.9461C11.1492 10.9472 11.3071 10.9803 12.03 11.3279C12.7528 11.6755 14.0362 12.3446 14.7184 12.7056C15.4429 13.0993 15.5455 13.1667 15.6516 13.2351C15.6986 13.2699 15.7318 13.3046 15.769 13.3613" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M4.27439 0.549776C4.18734 0.55277 3.68834 0.648707 3.0064 0.883993C2.66291 1.0025 2.35647 1.22725 2.0791 1.44991C1.55 1.87468 1.23516 2.31885 1.02181 2.70313C0.746959 3.19819 0.620765 3.62227 0.58014 4.00113C0.549658 4.28541 0.543759 4.7698 0.555718 5.24543C0.567677 5.72105 0.609079 6.17664 0.692999 6.64441C0.776918 7.11218 0.9021 7.57834 1.09591 8.1419C1.28972 8.70546 1.54836 9.35229 1.93681 10.1646C2.32526 10.9768 2.83568 11.9349 3.35228 12.739C3.86889 13.5432 4.37621 14.1644 4.69955 14.5391C5.32858 15.1745 5.49403 15.2744 5.59642 15.3132C5.6429 15.3294 5.67827 15.3384 5.78061 15.3664" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M5.00196 15.0192C5.0021 15.0221 5.52846 15.436 6.48565 16.1564C6.90763 16.474 7.23616 16.6556 7.59186 16.8306C8.31477 17.1864 8.82977 17.3447 9.20573 17.4156C9.47428 17.4663 9.90486 17.5153 10.3947 17.5565C11.4215 17.6429 12.0792 17.6362 12.5079 17.5427C12.8367 17.4709 13.3729 17.3027 13.8141 17.1451C14.5986 16.8647 14.4736 16.7923 14.7302 16.5797C15.4389 15.9925 15.654 15.5401 15.8392 15.0496C15.8407 14.4548 15.7813 13.877 15.6951 13.5711C15.6599 13.4547 15.6422 13.417 15.5909 13.3545" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M4.10864 13.7996C4.10868 13.8004 4.10873 13.8013 4.30084 13.9928C4.49296 14.1843 4.87715 14.5665 5.27494 14.9205C5.67273 15.2745 6.07248 15.5888 6.49813 15.8806C6.92377 16.1723 7.36321 16.4319 7.68442 16.5965C8.19528 16.8229 8.51881 16.9162 8.72489 16.9657C8.80285 16.9855 8.82675 16.9944 8.90003 17.0313" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M15.0178 13.5272C15.0179 13.5292 15.0088 13.5748 14.7576 14.0911C14.5252 14.5688 14.0407 15.4603 13.7222 16.0122C13.4036 16.564 13.2557 16.743 13.1191 16.8909C12.7335 17.3081 12.6182 17.3167 12.5621 17.3181C12.5346 17.3188 12.5095 17.288 12.4927 17.2282C12.45 17.0755 12.4815 16.7081 12.6303 15.8616C12.7338 15.2733 12.9945 14.3938 13.1258 13.9133C13.3225 13.1936 13.4839 12.9134 13.4661 12.8548C13.4573 12.8256 13.4155 12.8129 13.3761 12.8129C13.3367 12.8128 13.2924 12.8297 12.5765 13.5998C11.8607 14.3699 10.4747 15.8927 9.76207 16.6536C9.04944 17.4145 9.0522 17.3675 9.44058 16.6722C9.82897 15.9769 10.6029 14.6348 11.0364 13.8949C11.4698 13.155 11.5394 13.058 11.6206 12.858C11.7017 12.6579 11.7922 12.3577 11.8457 12.1499C11.8992 11.9421 11.913 11.8358 11.0883 12.4145C10.2636 12.9933 8.60017 14.2604 7.72908 14.92C6.858 15.5795 6.82968 15.5932 6.80476 15.582C6.77984 15.5709 6.75917 15.5345 6.74928 15.4829C6.72694 15.3664 6.76549 15.2372 6.86725 15.0395C6.93979 14.8985 7.0796 14.6918 7.67911 14.0399C8.27862 13.3881 9.33994 12.3017 9.84346 11.7461C10.347 11.1905 10.2606 11.1987 10.1959 11.2032C10.0911 11.2105 9.9538 11.2316 9.38315 11.4967C8.89917 11.7215 8.05596 12.201 7.43488 12.4775C6.81381 12.7541 6.44949 12.8314 6.11396 12.9187C5.77843 13.0061 5.48273 13.1011 5.22552 13.1634C4.96832 13.2256 4.75858 13.2521 4.61113 13.2648C4.46369 13.2774 4.3849 13.2755 4.23868 13.2283" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M3.96237 12.9847C3.95934 12.922 3.97086 12.7413 4.09919 12.4212C4.20004 12.1696 4.4171 11.7611 4.61108 11.4231C4.80507 11.0851 4.98056 10.8361 5.05432 10.7042C5.12809 10.5722 5.0948 10.5649 5.04088 10.5381C4.91016 10.473 4.8086 10.4039 4.28521 10.275C3.7917 10.1535 2.83203 9.94381 2.29672 9.81485C1.67651 9.66545 1.5501 9.58844 1.48724 9.53503C1.46183 9.51344 1.47336 9.47885 2.07014 9.23168C2.66693 8.98451 3.8547 8.51963 4.57236 8.22055C5.5134 7.82837 5.74125 7.66044 5.75529 7.62083C5.76222 7.60124 5.70994 7.57848 5.13198 7.58443C4.55402 7.59037 3.43692 7.62464 2.79813 7.63738C2.03386 7.65262 1.87442 7.61658 1.82422 7.58088C1.7989 7.56287 1.7858 7.52845 1.78761 7.50269C1.78941 7.47694 1.80957 7.45664 2.47666 7.00475C3.14375 6.55285 4.45715 5.66999 5.27599 5.15516C6.09482 4.64033 6.37928 4.52029 6.45406 4.4557C6.52188 4.39713 6.15122 4.39012 5.53242 4.52798C4.99743 4.64717 4.02352 4.90064 3.39444 5.03072C2.52328 5.21084 2.21003 5.1768 2.11888 5.18186C2.07093 5.18666 2.01955 5.19601 1.90994 5.19816C1.80033 5.20031 1.63405 5.19498 1.44117 5.124" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M1.19834 5.36454C1.20038 5.36462 1.20241 5.3647 1.7186 4.90774C2.23479 4.45078 3.26507 3.53678 3.80747 3.05234C4.34987 2.5679 4.37317 2.5407 4.39871 2.52168" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
              transform: "translateX(calc(clamp(80px, 14vw, 180px) - clamp(50px, 6vw, 80px)))",
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
              <SubmitButton label="Envoyer →" onClick={handleSubmitMail} />
            </div>
          </>
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
              <SubmitButton label="Confirmer →" onClick={handleSubmitCall} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
